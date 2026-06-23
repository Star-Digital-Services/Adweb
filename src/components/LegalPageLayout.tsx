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
            className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-rose-400 transition-colors mb-6"
          >
            ← Back to home
          </Link>

          <article className="rounded-2xl border border-white/5 bg-zinc-950/20 backdrop-blur-md p-6 sm:p-8 lg:p-10 animate-fade-in shadow-2xl">
            <header className="mb-8 pb-6 border-b border-white/5">
              <h1 className="text-3xl sm:text-4xl font-serif font-medium text-white mb-2">{title}</h1>
              <p className="text-xs text-zinc-500 font-sans tracking-wide">Last updated: {lastUpdated}</p>
            </header>

            {intro && (
              <p className="text-zinc-400 leading-relaxed text-sm sm:text-base mb-8 font-sans">{intro}</p>
            )}

            <div className="space-y-8">
              {sections.map((section) => (
                <section key={section.title} className="space-y-3">
                  <h2 className="text-lg font-serif font-semibold text-zinc-100">{section.title}</h2>
                  <div className="space-y-4">
                    {section.paragraphs.map((paragraph, index) => (
                      <p
                        key={`${section.title}-${index}`}
                        className="text-zinc-400 leading-relaxed text-sm sm:text-base font-sans"
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
