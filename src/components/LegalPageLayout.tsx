import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

type LegalSection = {
  title: string;
  paragraphs: readonly string[];
};

type LegalPageLayoutProps = {
  title: string;
  lastUpdated: string;
  intro?: string;
  sections: readonly LegalSection[];
  children?: React.ReactNode;
};

export function LegalPageLayout({
  title,
  lastUpdated,
  intro,
  sections,
  children,
}: LegalPageLayoutProps) {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-10 py-8 sm:py-12 lg:py-16">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-zinc-500 hover:text-brand-300 transition-colors mb-6"
          >
            ← Back to home
          </Link>

          <article className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm p-6 sm:p-8 lg:p-10 animate-fade-in">
            <header className="mb-8 pb-6 border-b border-zinc-800/60">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{title}</h1>
              <p className="text-sm text-zinc-500">Last updated: {lastUpdated}</p>
            </header>

            {intro && (
              <p className="text-zinc-400 leading-relaxed mb-8">{intro}</p>
            )}

            <div className="space-y-8">
              {sections.map((section) => (
                <section key={section.title}>
                  <h2 className="text-lg font-semibold text-white mb-3">{section.title}</h2>
                  <div className="space-y-3">
                    {section.paragraphs.map((paragraph, index) => (
                      <p
                        key={`${section.title}-${index}`}
                        className="text-zinc-400 leading-relaxed text-sm sm:text-base"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {children}
          </article>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
