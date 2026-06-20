import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { legalContent } from "@/config/legal-content";

const { title, lastUpdated, sections } = legalContent.pages.terms;

export const metadata: Metadata = {
  title: `${title} — Spicy Content Premium`,
  description: "Terms and conditions for using Spicy Content Premium.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout title={title} lastUpdated={lastUpdated} sections={sections} />
  );
}
