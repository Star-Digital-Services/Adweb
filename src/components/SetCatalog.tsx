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
    <div className="animate-fade-in space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/5 px-4 py-1.5 text-[11px] font-bold text-rose-300 uppercase tracking-widest mb-2 shadow-sm ring-1 ring-white/5">
          <Sparkles className="h-3 w-3 text-rose-400 animate-pulse" />
          <span>{catalog.badge}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-white leading-tight">
          Choose Your <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-rose-300 to-amber-200">Exclusive</span> Collection
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-sans">
          {catalog.subtitle}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {photoSets.map((set) => {
          const owned = !loading && user?.purchasedSets.includes(set.id);

          return (
            <Link
              key={set.id}
              href={`/sets/${set.id}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/20 backdrop-blur-md transition-all duration-500 hover:border-rose-500/20 hover:-translate-y-1.5 hover:shadow-[0_15px_40px_rgba(244,63,94,0.15)]"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl(set.previewImage)}
                  alt={set.name}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 select-none"
                  style={previewBlur.imageStyle}
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                />
                
                {set.photoCountLabel && (
                  <svg
                    viewBox="0 0 100 100"
                    aria-hidden="true"
                    className="absolute left-0 top-0 h-24 w-24 drop-shadow-md pointer-events-none z-10"
                  >
                    <polygon points="0,0 0,100 100,0" fill="url(#set-card-badge-gradient)" />
                    <defs>
                      <linearGradient id="set-card-badge-gradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fcd34d" /> {/* amber-300 */}
                        <stop offset="100%" stopColor="#b45309" /> {/* amber-700 */}
                      </linearGradient>
                    </defs>
                    <text x="14" y="24" fill="white" fontSize="16" fontWeight="700" letterSpacing="1">
                      50+
                    </text>
                    <text x="12" y="38" fill="rgba(255,255,255,0.85)" fontSize="9" fontWeight="700" letterSpacing="1">
                      PHOTOS
                    </text>
                  </svg>
                )}
                
                <div
                  className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-500 group-hover:opacity-40"
                  style={{ opacity: previewBlur.overlayOpacity + 0.1 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/10 to-transparent opacity-90" />

                {owned ? (
                  <div className="absolute top-3.5 right-3.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-300 shadow-lg shadow-emerald-950/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Unlocked
                  </div>
                ) : (
                  <div className="absolute top-3.5 right-3.5 inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 backdrop-blur-md border border-rose-500/30 px-3 py-1 text-xs font-semibold text-rose-300 shadow-lg shadow-rose-950/30">
                    <Lock className="h-3 w-3 text-rose-400" />
                    Premium
                  </div>
                )}
              </div>

              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between bg-zinc-950/30">
                <div className="space-y-1.5">
                  <h2 className="font-serif text-xl font-medium text-white group-hover:text-rose-200 transition-colors duration-300 leading-snug">
                    {set.name}
                  </h2>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                    {set.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-2">
                  <span className="text-xl font-serif font-bold text-amber-400 group-hover:text-amber-300 transition-colors">
                    {set.currency}
                    {formatSetPrice(set)}
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold font-sans">
                    {set.priceLabel}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {photoSets.length === 0 && (
        <p className="text-center text-zinc-500 py-16 font-sans">No collections available yet.</p>
      )}
    </div>
  );
}
