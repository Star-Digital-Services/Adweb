"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import type { Photo } from "@/types";
import { getSetById } from "@/config/sets";

interface PhotoGalleryProps {
  setId: string;
}

export function PhotoGallery({ setId }: PhotoGalleryProps) {
  const photoSet = getSetById(setId);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Photo | null>(null);

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/content/photos?setId=${encodeURIComponent(setId)}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load photos");
      }

      setPhotos(data.photos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load photos");
    } finally {
      setLoading(false);
    }
  }, [setId]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  useEffect(() => {
    if (photos.length === 0) return;

    const minExpiry = Math.min(...photos.map((p) => p.expiresIn));
    const refreshMs = Math.max((minExpiry - 60) * 1000, 60000);

    const timer = setTimeout(loadPhotos, refreshMs);
    return () => clearTimeout(timer);
  }, [photos, loadPhotos]);

  const galleryTitle = photoSet?.galleryTitle ?? "Your Collection";
  const gallerySubtitle =
    photoSet?.gallerySubtitle ??
    "Secure, time-limited access — links expire automatically";
  const loadingText = "Loading your exclusive collection…";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
        <p className="text-sm text-zinc-400">{loadingText}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={loadPhotos}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-zinc-400 mb-4">No photos in this set yet. Check back soon.</p>
        <button
          onClick={loadPhotos}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-serif font-medium tracking-tight text-white">{galleryTitle}</h2>
          <p className="text-sm text-zinc-400 mt-1 font-sans">{gallerySubtitle}</p>
        </div>
        <button
          onClick={loadPhotos}
          className="inline-flex items-center gap-2 rounded-xl border border-white/5 bg-zinc-950/40 backdrop-blur-md px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-rose-400 hover:border-rose-500/20 active:scale-95 transition-all duration-300"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setSelected(photo)}
            className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/20 backdrop-blur-md focus:outline-none focus:ring-1 focus:ring-rose-500/40 shadow-md hover:border-rose-500/20 hover:shadow-xl hover:shadow-rose-950/10 transition-all duration-500"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.signedUrl}
              alt={photo.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] select-none"
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
            {/* Beautiful hover visual overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-h-[85vh] max-w-5xl w-full flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/15"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selected.signedUrl}
              alt={selected.title}
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-xl select-none"
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-12 right-0 inline-flex items-center gap-1.5 text-zinc-400 hover:text-white bg-zinc-950/60 border border-white/10 hover:border-rose-500/20 rounded-full px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-200"
            >
              Close ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
