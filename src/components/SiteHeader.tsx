import Link from "next/link";
import { Shield } from "lucide-react";
import { siteContent } from "@/config/site-content";

export function SiteHeader() {
  const { brand } = siteContent;

  return (
    <header className="border-b border-white/5 backdrop-blur-md sticky top-0 z-40 bg-zinc-950/70">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-10 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group transition-opacity">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-600 flex items-center justify-center text-white font-serif font-bold text-base shadow-lg shadow-rose-950/40 ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105">
            {brand.logoLetter}
          </div>
          <div className="flex flex-col">
            <span className="font-serif italic font-semibold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-zinc-50 to-zinc-300 group-hover:from-white group-hover:to-rose-200 transition-all duration-300">
              {brand.name}
            </span>
            <span className="text-[10px] text-zinc-500 tracking-widest uppercase font-medium mt-0.5">
              Exclusive Access
            </span>
          </div>
        </Link>
        
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-amber-500/10 bg-amber-500/5 px-3 py-1 text-[11px] font-medium text-amber-300/90 shadow-sm shadow-amber-950/20">
          <Shield className="h-3 w-3 text-amber-400" />
          <span>{brand.tagline}</span>
        </div>
      </div>
    </header>
  );
}
