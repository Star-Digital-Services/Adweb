import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { legalContent } from "@/config/legal-content";

const { title, lastUpdated, sections } = legalContent.pages.terms;

export const metadata: Metadata = {
  title: `${title} — AI Content Premium`,
  description: "Terms and conditions for using AI Content Premium.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout title={title} lastUpdated={lastUpdated} sections={sections} />
  );
}
