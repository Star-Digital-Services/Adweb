import Link from "next/link";
import { siteContent } from "@/config/site-content";
import { legalLinks } from "@/config/legal-content";

export function SiteFooter() {
  const { footer } = siteContent;

  return (
    <footer className="border-t border-zinc-800/60 mt-8">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-10 py-6 space-y-4">
        <nav
          aria-label="Legal"
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs"
        >
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-zinc-500 hover:text-brand-300 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-center text-xs text-zinc-600 leading-relaxed">{footer}</p>
      </div>
    </footer>
  );
}
