/** Local dev only — bypasses Razorpay when NODE_ENV=development. Never enabled in production builds. */
export const devSkipPayment =
  process.env.NODE_ENV === "development" &&
  process.env.DEV_SKIP_PAYMENT === "true";
