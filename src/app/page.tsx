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
          className="mt-10 sm:mt-12 rounded-xl border border-zinc-800/80 bg-zinc-900/30 px-4 sm:px-6 py-4 text-center text-xs sm:text-sm text-zinc-500 leading-relaxed"
        >
          {disclaimer}
        </aside>
      </div>

      <SiteFooter />
    </main>
  );
}
