"use client";

import Link from "next/link";
import { CheckCircle2, Lock, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { photoSets, formatSetPrice } from "@/config/sets";
import { siteContent } from "@/config/site-content";
import { previewUrl, getPreviewBlurStyles } from "@/config/preview";

const { catalog } = siteContent;

export function SetCatalog() {
  const { user, loading } = useAuth();
  const previewBlur = getPreviewBlurStyles();

  return (
    <div className="animate-fade-in">
      <div className="mb-10 sm:mb-12 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1.5 text-xs font-semibold text-brand-300 uppercase tracking-wide mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          {catalog.badge}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
          {catalog.title}
        </h1>
        <p className="text-zinc-400 leading-relaxed">{catalog.subtitle}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {photoSets.map((set) => {
          const owned = !loading && user?.purchasedSets.includes(set.id);

          return (
            <Link
              key={set.id}
              href={`/sets/${set.id}`}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm transition hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-600/10"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl(set.previewImage)}
                  alt={set.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 select-none"
                  style={previewBlur.imageStyle}
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                />
                <div
                  className="absolute inset-0 bg-black pointer-events-none"
                  style={{ opacity: previewBlur.overlayOpacity }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {owned ? (
                  <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-xs font-medium text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Unlocked
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-zinc-900/80 border border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-300">
                    <Lock className="h-3.5 w-3.5" />
                    Locked
                  </div>
                )}
              </div>

              <div className="p-5 space-y-2">
                <h2 className="font-semibold text-white group-hover:text-brand-200 transition-colors">
                  {set.name}
                </h2>
                <p className="text-sm text-zinc-500 line-clamp-2">{set.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-lg font-bold text-white">
                    {set.currency}
                    {formatSetPrice(set)}
                  </span>
                  <span className="text-xs text-zinc-500">{set.priceLabel}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {photoSets.length === 0 && (
        <p className="text-center text-zinc-500 py-16">No collections available yet.</p>
      )}
    </div>
  );
}
