import Razorpay from "razorpay";
import crypto from "crypto";

type RazorpayEnvironment = "auto" | "test" | "live";

interface RazorpayCredentials {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  environment: Exclude<RazorpayEnvironment, "auto">;
}

function getConfiguredEnvironment(): RazorpayEnvironment {
  const configured = (
    process.env.RAZORPAY_ENV || process.env.NEXT_PUBLIC_RAZORPAY_ENV || "auto"
  ).toLowerCase();

  if (configured === "test" || configured === "live") {
    return configured;
  }

  return "auto";
}

function resolveCredentials(): RazorpayCredentials {
  const configuredEnvironment = getConfiguredEnvironment();

  const testKeyId = process.env.RAZORPAY_TEST_KEY_ID;
  const testKeySecret = process.env.RAZORPAY_TEST_KEY_SECRET;
  const testWebhookSecret = process.env.RAZORPAY_TEST_WEBHOOK_SECRET;

  const liveKeyId = process.env.RAZORPAY_LIVE_KEY_ID;
  const liveKeySecret = process.env.RAZORPAY_LIVE_KEY_SECRET;
  const liveWebhookSecret = process.env.RAZORPAY_LIVE_WEBHOOK_SECRET;

  const fallbackKeyId = process.env.RAZORPAY_KEY_ID;
  const fallbackKeySecret = process.env.RAZORPAY_KEY_SECRET;
  const fallbackWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const selectedEnvironment: Exclude<RazorpayEnvironment, "auto"> =
    configuredEnvironment === "auto"
      ? testKeyId || testKeySecret || testWebhookSecret
        ? "test"
        : "live"
      : configuredEnvironment;

  if (selectedEnvironment === "test") {
    const keyId = testKeyId || fallbackKeyId;
    const keySecret = testKeySecret || fallbackKeySecret;
    const webhookSecret = testWebhookSecret || fallbackWebhookSecret || "";

    if (!keyId || !keySecret) {
      throw new Error(
        "Razorpay test credentials are not configured. Set RAZORPAY_TEST_KEY_ID and RAZORPAY_TEST_KEY_SECRET, or fall back to RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
      );
    }

    return {
      keyId,
      keySecret,
      webhookSecret,
      environment: "test",
    };
  }

  const keyId = liveKeyId || fallbackKeyId;
  const keySecret = liveKeySecret || fallbackKeySecret;
  const webhookSecret = liveWebhookSecret || fallbackWebhookSecret || "";

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay live credentials are not configured. Set RAZORPAY_LIVE_KEY_ID and RAZORPAY_LIVE_KEY_SECRET, or fall back to RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
    );
  }

  return {
    keyId,
    keySecret,
    webhookSecret,
    environment: "live",
  };
}

function getRazorpayInstance(): Razorpay {
  const credentials = resolveCredentials();

  return new Razorpay({
    key_id: credentials.keyId,
    key_secret: credentials.keySecret,
  });
}

export async function createRazorpayOrder(
  amountInPaise: number,
  receipt: string,
  setId: string,
  setName: string
) {
  const razorpay = getRazorpayInstance();

  return razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt,
    notes: {
      source: "spicy-content-premium",
      setId,
      setName,
    },
  });
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const { keySecret: secret } = resolveCredentials();
  if (!secret) return false;

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const { webhookSecret: secret } = resolveCredentials();
  if (!secret) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

export function getRazorpayKeyId(): string {
  return resolveCredentials().keyId;
}

export function getRazorpayEnvironment(): Exclude<RazorpayEnvironment, "auto"> {
  return resolveCredentials().environment;
}
