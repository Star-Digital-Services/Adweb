/** Set NEXT_PUBLIC_DEV_SKIP_PAYMENT=true to bypass Razorpay and view photos locally. */
export const devSkipPayment =
  process.env.NEXT_PUBLIC_DEV_SKIP_PAYMENT === "true";
