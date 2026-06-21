/** Client-safe Razorpay mode — must mirror RAZORPAY_ENV on the server. */
export const razorpayPublicEnv = (
  process.env.NEXT_PUBLIC_RAZORPAY_ENV || "test"
).toLowerCase();

export const isRazorpayTestMode = razorpayPublicEnv === "test";
