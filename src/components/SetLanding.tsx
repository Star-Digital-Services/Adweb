"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  LogOut,
  Shield,
  Sparkles,
  Unlock,
  Images,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRazorpayCheckout } from "@/hooks/useRazorpayCheckout";
import { AuthModal } from "@/components/AuthModal";
import { PhotoGallery } from "@/components/PhotoGallery";
import { RazorpayScript } from "@/components/RazorpayScript";
import { devSkipPayment } from "@/lib/dev";
import { formatSetPrice, getSetById, type PhotoSetConfig } from "@/config/sets";
import {
  getPreviewBlurStyles,
  PREVIEW_IMAGE_FALLBACK,
  previewUrl,
} from "@/config/preview";

interface SetLandingProps {
  setId: string;
}

export function SetLanding({ setId }: SetLandingProps) {
  const photoSet = getSetById(setId);
  const { user, loading, logout } = useAuth();
  const { startCheckout, processing } = useRazorpayCheckout(setId);
  const [authOpen, setAuthOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [devViewPhotos, setDevViewPhotos] = useState(devSkipPayment);
  const [error, setError] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState(() =>
    previewUrl(photoSet?.previewImage ?? "/preview/cover.jpg")
  );
  const previewBlur = getPreviewBlurStyles();

  if (!photoSet) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-400 mb-4">This photo set does not exist.</p>
        <Link href="/" className="text-brand-300 hover:text-brand-200 text-sm">
          ← Back to collections
        </Link>
      </div>
    );
  }

  const ownsSet =
    devViewPhotos ||
    user?.purchasedSets.includes(setId) ||
    paymentSuccess;

  const handleUnlock = async () => {
    setError(null);

    if (!user) {
      setAuthOpen(true);
      return;
    }

    if (user.purchasedSets.includes(setId)) return;

    try {
      await startCheckout();
      setPaymentSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment failed";
      if (message !== "Payment cancelled") {
        setError(message);
      }
    }
  };

  const handleAuthSuccess = async () => {
    try {
      await startCheckout();
      setPaymentSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment failed";
      if (message !== "Payment cancelled") {
        setError(message);
      }
    }
  };

  if (loading && !devSkipPayment) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  if (ownsSet) {
    return (
      <div className="animate-fade-in">
        {!devSkipPayment && <RazorpayScript />}
        {devSkipPayment && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Dev mode — payment bypassed. Set{" "}
            <code className="text-amber-100">NEXT_PUBLIC_DEV_SKIP_PAYMENT=false</code>{" "}
            in <code className="text-amber-100">.env</code> to re-enable Razorpay.
          </div>
        )}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
              All sets
            </Link>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">
                {devSkipPayment ? "Photo test mode" : `${photoSet.name} — unlocked`}
              </span>
            </div>
          </div>
          {user && !devSkipPayment && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-400">{user.email}</span>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
          {devSkipPayment && (
            <button
              onClick={() => setDevViewPhotos(false)}
              className="text-sm text-zinc-400 hover:text-white transition"
            >
              ← Back to preview
            </button>
          )}
        </div>
        <PhotoGallery setId={setId} />
      </div>
    );
  }

  return (
    <>
      {!devSkipPayment && <RazorpayScript />}
      {!devSkipPayment && (
        <AuthModal
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        All sets
      </Link>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center animate-fade-in">
        <SetPreview
          previewSrc={previewSrc}
          previewBlur={previewBlur}
          photoSet={photoSet}
          onPreviewError={() => {
            if (!previewSrc.includes("cover.svg")) {
              setPreviewSrc(previewUrl(PREVIEW_IMAGE_FALLBACK));
            }
          }}
        />

        <SetPurchaseCard
          photoSet={photoSet}
          error={error}
          processing={processing}
          user={user}
          devSkipPayment={devSkipPayment}
          onUnlock={handleUnlock}
          onDevView={() => setDevViewPhotos(true)}
        />
      </div>
    </>
  );
}

function SetPreview({
  previewSrc,
  previewBlur,
  photoSet,
  onPreviewError,
}: {
  previewSrc: string;
  previewBlur: ReturnType<typeof getPreviewBlurStyles>;
  photoSet: PhotoSetConfig;
  onPreviewError: () => void;
}) {
  return (
    <div className="relative w-full mx-auto lg:mx-0">
      <div className="absolute -inset-4 bg-brand-600/10 blur-3xl rounded-3xl pointer-events-none" />
      <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full max-w-xl mx-auto lg:max-w-none rounded-2xl overflow-hidden border border-zinc-700/80 shadow-2xl shadow-black/50 ring-1 ring-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewSrc}
          alt={`${photoSet.name} preview`}
          className="absolute inset-0 h-full w-full object-cover select-none"
          style={previewBlur.imageStyle}
          onContextMenu={(e) => e.preventDefault()}
          onError={onPreviewError}
          draggable={false}
        />
        <div
          className="absolute inset-0 bg-black pointer-events-none"
          style={{ opacity: previewBlur.overlayOpacity }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-white/90">
            <Shield className="h-4 w-4 text-brand-400 shrink-0" />
            <p className="text-sm font-medium">{photoSet.previewCaption}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SetPurchaseCard({
  photoSet,
  error,
  processing,
  user,
  devSkipPayment,
  onUnlock,
  onDevView,
}: {
  photoSet: PhotoSetConfig;
  error: string | null;
  processing: boolean;
  user: { email: string } | null;
  devSkipPayment: boolean;
  onUnlock: () => void;
  onDevView: () => void;
}) {
  return (
    <div className="w-full max-w-xl mx-auto lg:max-w-none">
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1.5 text-xs font-semibold text-brand-300 uppercase tracking-wide">
          <Sparkles className="h-3.5 w-3.5" />
          {photoSet.badge}
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl xl:text-[2.75rem] font-bold text-white leading-[1.15] tracking-tight">
            {photoSet.headline}
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-500">
              {photoSet.headlineAccent}
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            {photoSet.description}
          </p>
        </div>

        {!devSkipPayment && (
          <>
            <ul className="space-y-3.5 pt-1">
              {photoSet.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm sm:text-[0.95rem] text-zinc-300"
                >
                  <CheckCircle2 className="h-4 w-4 text-brand-400 mt-0.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="flex items-end gap-3 pt-2 pb-1">
              <span className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                {photoSet.currency}
                {formatSetPrice(photoSet)}
              </span>
              <span className="text-sm text-zinc-500 pb-1.5">{photoSet.priceLabel}</span>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              onClick={onUnlock}
              disabled={processing}
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-4 text-base font-semibold text-white hover:from-brand-500 hover:to-brand-400 disabled:opacity-60 transition shadow-xl shadow-brand-600/25"
            >
              {processing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Unlock className="h-5 w-5" />
              )}
              {processing ? photoSet.processingButton : photoSet.unlockButton}
            </button>

            {user && (
              <p className="text-sm text-zinc-500 text-center sm:text-left">
                Signed in as <span className="text-zinc-300">{user.email}</span>
              </p>
            )}
          </>
        )}

        {devSkipPayment && (
          <button
            onClick={onDevView}
            className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-emerald-600 px-8 py-4 text-base font-semibold text-white hover:bg-emerald-500 transition shadow-xl shadow-emerald-600/25"
          >
            <Images className="h-5 w-5" />
            {photoSet.devViewButton}
          </button>
        )}
      </div>
    </div>
  );
}
