/**
 * Photo set definitions — add new sets here (set2, set3, …).
 * Each set maps to an S3 folder: photos/{id}/
 * Upload photos to that folder; they appear automatically for paid users.
 */

export interface PhotoSetConfig {
  id: string;
  name: string;
  /** S3 prefix, e.g. "photos/set1/" */
  s3Prefix: string;
  /** Price in paise (3900 = ₹39) */
  pricePaise: number;
  previewImage: string;
  badge: string;
  headline: string;
  headlineAccent: string;
  description: string;
  features: string[];
  currency: string;
  priceLabel: string;
  unlockButton: string;
  processingButton: string;
  devViewButton: string;
  previewCaption: string;
  photoCountLabel?: string;
  galleryTitle: string;
  gallerySubtitle: string;
}

export const photoSets: PhotoSetConfig[] = [
  {
    id: "set1",
    name: "Set 1 — Exclusive Collection",
    s3Prefix: "photos/set1/",
    pricePaise: 3900,
    previewImage: "/preview/cover.jpg",
    badge: "Premium Collection",
    headline: "Exclusive Private 4K Photos",
    headlineAccent: "Unposted High Quality Photos",
    description:
      "Access a curated collection of premium 4K photographs. Unlock instantly after a one-time secure payment. New photos added to this set are included automatically.",
    features: [
      "High-resolution exclusive photos",
      "Secure, time-limited signed URLs",
      "Instant access after payment",
      "Future additions included at no extra cost",
    ],
    currency: "₹",
    priceLabel: "Lifetime access after payment",
    unlockButton: "Unlock Set 1",
    processingButton: "Processing…",
    devViewButton: "View Photos (test mode)",
    previewCaption: "Preview — unlock for full access",
    photoCountLabel: "50+ photos",
    galleryTitle: "Set 1 — Your Collection",
    gallerySubtitle: "Secure, time-limited access — links expire automatically",
  },
  // ── Add future sets below ──────────────────────────────────
  // {
  //   id: "set2",
  //   name: "Set 2 — Summer Edition",
  //   s3Prefix: "photos/set2/",
  //   pricePaise: 4900,
  //   previewImage: "/preview/set2-cover.jpg",
  //   ...
  // },
];

export function getSetById(setId: string): PhotoSetConfig | undefined {
  return photoSets.find((s) => s.id === setId);
}

export function formatSetPrice(set: PhotoSetConfig): string {
  return (set.pricePaise / 100).toFixed(0);
}

export function isValidSetId(setId: string): boolean {
  return photoSets.some((s) => s.id === setId);
}
