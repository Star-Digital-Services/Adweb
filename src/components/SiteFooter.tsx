import Link from "next/link";
import { Lock } from "lucide-react";
import { siteContent } from "@/config/site-content";
import { legalLinks } from "@/config/legal-content";

export function SiteFooter() {
  const { footer } = siteContent;

  return (
    <footer className="border-t border-white/5 bg-zinc-950/30 backdrop-blur-sm mt-16">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-10 py-8 space-y-5">
        <nav
          aria-label="Legal"
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium"
        >
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-zinc-500 hover:text-rose-400 transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-center gap-2 max-w-xl mx-auto text-center">
          <Lock className="h-3 w-3 text-zinc-600 shrink-0" />
          <p className="text-center text-[11px] text-zinc-600 leading-relaxed font-sans">{footer}</p>
        </div>
        <p className="text-center text-[10px] text-zinc-700">
          © {new Date().getFullYear()} Spicy Content Premium. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
