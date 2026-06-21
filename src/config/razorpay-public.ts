/** Client-safe Razorpay key and mode — KEY_SECRET must never be exposed here. */
export const razorpayPublicEnv = (
  process.env.NEXT_PUBLIC_RAZORPAY_ENV || "test"
).toLowerCase();

export const isRazorpayTestMode = razorpayPublicEnv === "test";

export const razorpayPublicKeyId =
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
