import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { legalContent } from "@/config/legal-content";

const { title, lastUpdated, sections } = legalContent.pages.refund;

export const metadata: Metadata = {
  title: `${title} — Spicy Content Premium`,
  description: "Refund and cancellation policy for Spicy Content Premium digital purchases.",
};

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout title={title} lastUpdated={lastUpdated} sections={sections} />
  );
}
