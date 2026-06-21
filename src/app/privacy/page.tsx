import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { legalContent } from "@/config/legal-content";

const { title, lastUpdated, sections } = legalContent.pages.privacy;

export const metadata: Metadata = {
  title: `${title} — AI Content Premium`,
  description: "Privacy policy for AI Content Premium.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title={title} lastUpdated={lastUpdated} sections={sections} />
  );
}
