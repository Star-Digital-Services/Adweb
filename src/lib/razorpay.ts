import Razorpay from "razorpay";
import crypto from "crypto";

type RazorpayEnvironment = "test" | "live";

interface RazorpayCredentials {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  environment: RazorpayEnvironment;
}

const MIN_ORDER_AMOUNT_PAISE = 100;

function getConfiguredEnvironment(): RazorpayEnvironment {
  const configured = (process.env.RAZORPAY_ENV || "live").toLowerCase();
  return configured === "test" ? "test" : "live";
}

function resolveCredentials(): RazorpayCredentials {
  const environment = getConfiguredEnvironment();
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
    );
  }

  const isTestKey = keyId.startsWith("rzp_test_");
  const isLiveKey = keyId.startsWith("rzp_live_");

  if (environment === "test" && !isTestKey) {
    throw new Error(
      "RAZORPAY_ENV is test but RAZORPAY_KEY_ID must start with rzp_test_."
    );
  }

  if (environment === "live" && !isLiveKey) {
    throw new Error(
      "RAZORPAY_ENV is live but RAZORPAY_KEY_ID must start with rzp_live_."
    );
  }

  return { keyId, keySecret, webhookSecret, environment };
}

function getRazorpayInstance(): Razorpay {
  const credentials = resolveCredentials();

  return new Razorpay({
    key_id: credentials.keyId,
    key_secret: credentials.keySecret,
  });
}

export function validateOrderAmount(amountInPaise: number): void {
  if (!Number.isInteger(amountInPaise) || amountInPaise < MIN_ORDER_AMOUNT_PAISE) {
    throw new Error(
      `Order amount must be at least ${MIN_ORDER_AMOUNT_PAISE} paise.`
    );
  }
}

export async function createRazorpayOrder(
  amountInPaise: number,
  receipt: string,
  setId: string,
  setName: string
) {
  validateOrderAmount(amountInPaise);

  const razorpay = getRazorpayInstance();

  return razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: receipt.slice(0, 40),
    notes: {
      source: "spicy-content-premium",
      setId,
      setName,
    },
  });
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const { keySecret: secret } = resolveCredentials();
  if (!secret) return false;

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const { webhookSecret: secret } = resolveCredentials();
  if (!secret) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

export function getRazorpayKeyId(): string {
  return resolveCredentials().keyId;
}

export function getRazorpayEnvironment(): RazorpayEnvironment {
  return resolveCredentials().environment;
}

export function getRazorpayHealthStatus(): {
  environment: RazorpayEnvironment | "unconfigured";
  credentials: "ok" | "missing";
} {
  try {
    return {
      environment: resolveCredentials().environment,
      credentials: "ok",
    };
  } catch {
    return {
      environment: "unconfigured",
      credentials: "missing",
    };
  }
}
