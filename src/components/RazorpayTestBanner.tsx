import { isRazorpayTestMode } from "@/config/razorpay-public";
import { devSkipPayment } from "@/lib/dev";

export function RazorpayTestBanner() {
  if (devSkipPayment || !isRazorpayTestMode) return null;

  return (
    <div className="mb-6 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
      <p className="font-medium text-sky-50">Razorpay test mode</p>
      <p className="mt-1 text-sky-100/90">
        Payments use sandbox credentials — no real money is charged. Use Razorpay
        test card <code className="text-sky-50">5241 8100 0000 0000</code>, any
        future expiry, and any CVV.
      </p>
    </div>
  );
}
