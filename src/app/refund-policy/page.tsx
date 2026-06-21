import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { legalContent } from "@/config/legal-content";

const { title, lastUpdated, sections } = legalContent.pages.refund;

export const metadata: Metadata = {
  title: `${title} — AI Content Premium`,
  description: "Refund and cancellation policy for AI Content Premium digital purchases.",
};

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout title={title} lastUpdated={lastUpdated} sections={sections} />
  );
}
