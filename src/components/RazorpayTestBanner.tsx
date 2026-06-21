import { isRazorpayTestMode } from "@/config/razorpay-public";
import { devSkipPayment } from "@/lib/dev";

export function RazorpayTestBanner() {
  if (devSkipPayment || !isRazorpayTestMode) return null;

  return (
    <div className="mb-6 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
      <p className="font-medium text-sky-50">Razorpay test mode</p>
      <p className="mt-1 text-sky-100/90">
        No real money is charged. Easiest test: choose <strong>UPI</strong> and
        enter <code className="text-sky-50">success@razorpay</code>.
      </p>
      <p className="mt-2 text-sky-100/90">
        For cards use Indian test numbers only —{" "}
        <code className="text-sky-50">5267 3181 8797 5449</code> (Mastercard) or{" "}
        <code className="text-sky-50">4111 1111 1111 1111</code> (Visa). Saved
        real bank cards will fail with &quot;International cards are not
        supported&quot;.
      </p>
    </div>
  );
}
