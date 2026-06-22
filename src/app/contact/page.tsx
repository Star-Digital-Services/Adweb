import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { legalContent } from "@/config/legal-content";

const { title, lastUpdated, intro, sections } = legalContent.pages.contact;
const { email, businessName } = legalContent.contact;

export const metadata: Metadata = {
  title: `${title} — Spicy Content Premium`,
  description: "Contact Spicy Content Premium for support and billing inquiries.",
};

export default function ContactPage() {
  return (
    <LegalPageLayout
      title={title}
      lastUpdated={lastUpdated}
      intro={intro}
      sections={sections}
    >
      <div className="mt-8 pt-6 border-t border-zinc-800/60">
        <p className="text-sm text-zinc-500 mb-2">{businessName}</p>
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center text-brand-300 hover:text-brand-200 transition-colors font-medium"
        >
          {email}
        </a>
      </div>
    </LegalPageLayout>
  );
}
