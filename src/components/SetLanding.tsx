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
  Lock,
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
            Dev mode — payment bypassed. Remove{" "}
            <code className="text-amber-100">DEV_SKIP_PAYMENT=true</code> from{" "}
            <code className="text-amber-100">.env</code> to use live Razorpay.
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
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-rose-400 transition mb-8 group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
        All Collections
      </Link>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-20 items-center animate-fade-in max-w-6xl mx-auto">
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
      {/* Luxurious ambient crimson glow halo behind preview */}
      <div className="absolute -inset-6 halo-velvet rounded-[2.5rem] opacity-75 blur-3xl pointer-events-none animate-pulse-slow" />
      
      <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full max-w-xl mx-auto lg:max-w-none rounded-3xl overflow-hidden border border-white/5 shadow-2xl shadow-black/85 ring-1 ring-white/10 group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewSrc}
          alt={`${photoSet.name} preview`}
          className="absolute inset-0 h-full w-full object-cover select-none transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          style={previewBlur.imageStyle}
          onContextMenu={(e) => e.preventDefault()}
          onError={onPreviewError}
          draggable={false}
        />
        
        {photoSet.photoCountLabel && (
          <svg
            viewBox="0 0 100 100"
            aria-hidden="true"
            className="absolute left-0 top-0 h-28 w-28 sm:h-32 sm:w-32 drop-shadow-md pointer-events-none z-10"
          >
            <polygon points="0,0 0,100 100,0" fill="url(#set-preview-badge-gradient)" />
            <defs>
              <linearGradient id="set-preview-badge-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fcd34d" />
                <stop offset="100%" stopColor="#b45309" />
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
          className="absolute inset-0 bg-[#050506] pointer-events-none transition-opacity duration-500 group-hover:opacity-40"
          style={{ opacity: previewBlur.overlayOpacity + 0.1 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/70 border border-white/5 backdrop-blur-md">
            <Lock className="h-3 w-3 text-rose-400 shrink-0" />
            <p className="text-[11px] font-semibold text-rose-200 tracking-wider uppercase font-sans">{photoSet.previewCaption}</p>
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
    <div className="w-full max-w-xl mx-auto lg:max-w-none relative">
      {/* Ambient background glow */}
      <div className="absolute -inset-4 halo-gold rounded-full opacity-40 blur-2xl pointer-events-none" />

      <div className="relative rounded-3xl border border-white/5 bg-zinc-950/20 backdrop-blur-md p-8 sm:p-10 lg:p-12 space-y-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/5 px-4 py-1.5 text-[11px] font-bold text-rose-300 uppercase tracking-widest shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
          {photoSet.badge}
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-[2.75rem] font-serif font-medium text-white leading-[1.12] tracking-tight">
            {photoSet.headline}
            <span className="block mt-1.5 text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-rose-300 to-amber-200 italic font-serif">
              {photoSet.headlineAccent}
            </span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-sans">
            {photoSet.description}
          </p>
        </div>

        {!devSkipPayment && (
          <>
            <ul className="space-y-3.5 pt-2 border-t border-white/5">
              {photoSet.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3.5 text-sm text-zinc-300 font-sans"
                >
                  <CheckCircle2 className="h-4.5 w-4.5 text-rose-400 mt-0.5 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-baseline gap-3 pt-3">
              <span className="text-5xl sm:text-6xl font-serif font-black text-white tracking-tight">
                <span className="text-2xl sm:text-3xl text-zinc-100 font-sans align-top mr-1 font-bold">{photoSet.currency}</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-300 font-extrabold">{formatSetPrice(photoSet)}</span>
              </span>
              <span className="text-xs uppercase tracking-[0.3em] font-semibold font-sans text-white bg-white/10 border border-white/15 rounded-full px-3 py-1 shadow-sm shadow-black/20">
                {photoSet.priceLabel}
              </span>
            </div>

            {error && (
              <p className="text-sm text-rose-300 bg-rose-950/20 border border-rose-500/30 rounded-xl px-4 py-3 font-sans">
                {error}
              </p>
            )}

            <button
              onClick={onUnlock}
              disabled={processing}
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 px-8 py-4.5 text-base font-bold text-white hover:from-rose-500 hover:to-amber-400 active:scale-[0.98] transition-all duration-300 shadow-xl shadow-rose-950/20 btn-glow-rose disabled:opacity-60"
            >
              {processing ? (
                <Loader2 className="h-5 w-5 animate-spin text-amber-200" />
              ) : (
                <Unlock className="h-5 w-5" />
              )}
              <span>{processing ? photoSet.processingButton : photoSet.unlockButton}</span>
            </button>

            {/* Premium Trust Panel */}
            <div className="pt-6 border-t border-white/5 grid grid-cols-3 gap-3 text-center">
              <div className="space-y-1">
                <Shield className="h-4.5 w-4.5 text-amber-500 mx-auto" />
                <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-widest font-sans">SSL Encrypted</span>
              </div>
              <div className="space-y-1">
                <Lock className="h-4.5 w-4.5 text-rose-400 mx-auto" />
                <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-widest font-sans">Instant Access</span>
              </div>
              <div className="space-y-1">
                <svg className="h-4.5 w-4.5 text-emerald-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-widest font-sans">100% Secure</span>
              </div>
            </div>

            {user && (
              <p className="text-xs text-zinc-500 text-center font-sans">
                Logged in as <span className="text-zinc-300 font-semibold">{user.email}</span>
              </p>
            )}
          </>
        )}

        {devSkipPayment && (
          <button
            onClick={onDevView}
            className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-8 py-4.5 text-base font-bold text-white hover:from-emerald-500 hover:to-teal-400 active:scale-[0.98] transition-all duration-300 shadow-xl shadow-emerald-950/20 btn-glow-gold"
          >
            <Images className="h-5 w-5" />
            <span>{photoSet.devViewButton}</span>
          </button>
        )}
      </div>
    </div>
  );
}
