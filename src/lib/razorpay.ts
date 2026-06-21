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
  const configured = (
    process.env.RAZORPAY_ENV || process.env.NEXT_PUBLIC_RAZORPAY_ENV || "test"
  ).toLowerCase();

  return configured === "live" ? "live" : "test";
}

function pickCredentialPair(
  environment: RazorpayEnvironment
): { keyId?: string; keySecret?: string; webhookSecret?: string } {
  if (environment === "test") {
    return {
      keyId: process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_TEST_KEY_ID,
      keySecret:
        process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_TEST_KEY_SECRET,
      webhookSecret:
        process.env.RAZORPAY_WEBHOOK_SECRET ||
        process.env.RAZORPAY_TEST_WEBHOOK_SECRET,
    };
  }

  return {
    keyId: process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_LIVE_KEY_ID,
    keySecret:
      process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_LIVE_KEY_SECRET,
    webhookSecret:
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      process.env.RAZORPAY_LIVE_WEBHOOK_SECRET,
  };
}

function assertKeyMatchesEnvironment(
  keyId: string,
  environment: RazorpayEnvironment
): void {
  const isTestKey = keyId.startsWith("rzp_test_");
  const isLiveKey = keyId.startsWith("rzp_live_");

  if (environment === "test" && !isTestKey) {
    throw new Error(
      "RAZORPAY_ENV is test but KEY_ID is not a test key (must start with rzp_test_)."
    );
  }

  if (environment === "live" && !isLiveKey) {
    throw new Error(
      "RAZORPAY_ENV is live but KEY_ID is not a live key (must start with rzp_live_)."
    );
  }
}

function resolveCredentials(): RazorpayCredentials {
  const environment = getConfiguredEnvironment();
  const { keyId, keySecret, webhookSecret } = pickCredentialPair(environment);

  if (!keyId || !keySecret) {
    throw new Error(
      environment === "test"
        ? "Razorpay test credentials missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
        : "Razorpay live credentials missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
    );
  }

  assertKeyMatchesEnvironment(keyId, environment);

  return {
    keyId,
    keySecret,
    webhookSecret: webhookSecret || "",
    environment,
  };
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
  devSkipPayment: boolean;
} {
  try {
    return {
      environment: resolveCredentials().environment,
      credentials: "ok",
      devSkipPayment: process.env.NEXT_PUBLIC_DEV_SKIP_PAYMENT === "true",
    };
  } catch {
    return {
      environment: "unconfigured",
      credentials: "missing",
      devSkipPayment: process.env.NEXT_PUBLIC_DEV_SKIP_PAYMENT === "true",
    };
  }
}
