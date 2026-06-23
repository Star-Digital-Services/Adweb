import { SetCatalog } from "@/components/SetCatalog";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { siteContent } from "@/config/site-content";

export default function Home() {
  const { disclaimer } = siteContent;

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-10 py-8 sm:py-12 lg:py-16">
        <SetCatalog />

        <aside
          aria-label="Platform disclaimer"
          className="mt-14 sm:mt-18 rounded-2xl border border-white/5 bg-zinc-950/20 backdrop-blur-sm px-6 sm:px-8 py-5 text-center text-[11px] sm:text-xs text-zinc-500 leading-relaxed max-w-4xl mx-auto shadow-xl ring-1 ring-white/5"
        >
          <div className="flex items-center justify-center gap-1.5 mb-2 text-amber-500/80 uppercase tracking-widest text-[9px] font-bold">
            <span className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" />
            Compliance & Authenticity Notice
          </div>
          {disclaimer}
        </aside>
      </div>

      <SiteFooter />
    </main>
  );
}
