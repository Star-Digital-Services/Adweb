import Link from "next/link";
import { siteContent } from "@/config/site-content";

export function SiteHeader() {
  const { brand } = siteContent;

  return (
    <header className="border-b border-zinc-800/60 backdrop-blur-sm sticky top-0 z-40 bg-zinc-950/80">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-10 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand-600/30">
            {brand.logoLetter}
          </div>
          <span className="font-semibold text-white tracking-tight">{brand.name}</span>
        </Link>
        <span className="text-xs text-zinc-500 hidden sm:block">{brand.tagline}</span>
      </div>
    </header>
  );
}
