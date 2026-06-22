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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">{galleryTitle}</h2>
          <p className="text-sm text-zinc-400 mt-1">{gallerySubtitle}</p>
          <p className="text-xs text-zinc-500 mt-1">photos</p>
        </div>
        <button
          onClick={loadPhotos}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setSelected(photo)}
            className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.signedUrl}
              alt={photo.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 select-none"
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-6xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selected.signedUrl}
              alt={selected.title}
              className="max-h-[85vh] w-full object-contain rounded-lg select-none"
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-10 right-0 text-zinc-400 hover:text-white text-sm"
            >
              Close ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
