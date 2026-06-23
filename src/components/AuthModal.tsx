"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultMode?: "login" | "register";
}

export function AuthModal({
  open,
  onClose,
  onSuccess,
  defaultMode = "register",
}: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/60 backdrop-blur-xl p-8 shadow-3xl shadow-black animate-slide-up ring-1 ring-white/5 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />
        
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-zinc-500 hover:text-white transition duration-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/10 border border-rose-500/30 shadow-inner">
            <Lock className="h-5 w-5 text-rose-400 animate-pulse-slow" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-medium text-white leading-none">
              {mode === "login" ? "Welcome back" : "Create Account"}
            </h2>
            <p className="text-xs text-zinc-400 mt-1.5 font-sans leading-tight">
              {mode === "login"
                ? "Sign in to unlock your premium collection"
                : "Register to proceed with secure payment"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 font-sans">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-rose-500/40 focus:outline-none focus:ring-1 focus:ring-rose-500/40 transition-colors duration-200 font-sans"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 font-sans">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3 pr-10 text-sm text-white placeholder:text-zinc-600 focus:border-rose-500/40 focus:outline-none focus:ring-1 focus:ring-rose-500/40 transition-colors duration-200 font-sans"
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition duration-150"
              >
                {showPassword ? (
                  <EyeOff className="h-4.5 w-4.5" />
                ) : (
                  <Eye className="h-4.5 w-4.5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-300 bg-rose-950/30 border border-rose-500/30 rounded-xl px-4 py-2.5 font-sans">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 px-4 py-3.5 font-bold text-white hover:from-rose-500 hover:to-rose-400 active:scale-[0.98] disabled:opacity-60 transition duration-300 shadow-lg shadow-rose-950/20 btn-glow-rose"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-400 font-sans">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError(null);
            }}
            className="text-rose-400 hover:text-rose-300 font-semibold transition-colors duration-150"
          >
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
