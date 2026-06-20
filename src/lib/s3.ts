import { getSignedUrl as getS3SignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl as getCloudFrontSignedUrl } from "@aws-sdk/cloudfront-signer";

const SIGNED_URL_EXPIRY_SECONDS = 300; // 5 minutes

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];

function getS3Client(): S3Client {
  return new S3Client({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

export interface PhotoMeta {
  key: string;
  title: string;
}

function isImageKey(key: string): boolean {
  const lower = key.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function titleFromKey(key: string): string {
  const filename = key.split("/").pop() || key;
  const name = filename.replace(/\.[^.]+$/, "");
  return name.replace(/[-_]/g, " ");
}

/** List all images under a set prefix (e.g. photos/set1/). New uploads appear on next fetch. */
export async function listPhotosInSet(s3Prefix: string): Promise<PhotoMeta[]> {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) throw new Error("AWS_S3_BUCKET is not configured");

  const prefix = s3Prefix.endsWith("/") ? s3Prefix : `${s3Prefix}/`;

  const client = getS3Client();
  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: prefix,
  });

  const response = await client.send(command);
  const keys =
    response.Contents?.map((obj) => obj.Key).filter(
      (key): key is string => !!key && !key.endsWith("/") && isImageKey(key)
    ) || [];

  return keys
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((key) => ({
      key,
      title: titleFromKey(key),
    }));
}

function generateCloudFrontSignedUrl(objectKey: string): string | null {
  const domain = process.env.AWS_CLOUDFRONT_DOMAIN;
  const keyPairId = process.env.AWS_CLOUDFRONT_KEY_PAIR_ID;
  const privateKey = process.env.AWS_CLOUDFRONT_PRIVATE_KEY;

  if (!domain || !keyPairId || !privateKey) {
    return null;
  }

  const url = `https://${domain}/${objectKey}`;
  const expires = new Date(Date.now() + SIGNED_URL_EXPIRY_SECONDS * 1000);

  const signedUrl = getCloudFrontSignedUrl({
    url,
    keyPairId,
    privateKey: privateKey.replace(/\\n/g, "\n"),
    dateLessThan: expires.toISOString(),
  });

  return signedUrl;
}

async function generateS3SignedUrl(objectKey: string): Promise<string> {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) throw new Error("AWS_S3_BUCKET is not configured");

  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: objectKey,
  });

  return getS3SignedUrl(client, command, {
    expiresIn: SIGNED_URL_EXPIRY_SECONDS,
  });
}

export async function generateSignedUrlForPhoto(
  objectKey: string
): Promise<{ url: string; expiresIn: number }> {
  const cloudFrontUrl = generateCloudFrontSignedUrl(objectKey);

  if (cloudFrontUrl) {
    return { url: cloudFrontUrl, expiresIn: SIGNED_URL_EXPIRY_SECONDS };
  }

  const s3Url = await generateS3SignedUrl(objectKey);
  return { url: s3Url, expiresIn: SIGNED_URL_EXPIRY_SECONDS };
}

export async function generateSignedUrlsForPhotos(
  photos: PhotoMeta[]
): Promise<Array<PhotoMeta & { signedUrl: string; expiresIn: number }>> {
  return Promise.all(
    photos.map(async (photo) => {
      const { url, expiresIn } = await generateSignedUrlForPhoto(photo.key);
      return {
        ...photo,
        signedUrl: url,
        expiresIn,
      };
    })
  );
}
