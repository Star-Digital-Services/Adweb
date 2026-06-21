import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getRazorpayHealthStatus } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function GET() {
  const razorpay = getRazorpayHealthStatus();

  const checks: Record<string, string> = {
    mongodbUri: process.env.MONGODB_URI ? "set" : "missing",
    jwtSecret:
      process.env.JWT_SECRET &&
      process.env.JWT_SECRET !== "change-me-in-production"
        ? "set"
        : "weak-or-missing",
    razorpayEnv: razorpay.environment,
    razorpayCredentials: razorpay.credentials,
    devSkipPayment: razorpay.devSkipPayment ? "true" : "false",
  };

  if (!process.env.MONGODB_URI) {
    return NextResponse.json(
      {
        ok: false,
        checks,
        error: "MONGODB_URI is not configured",
      },
      { status: 503 }
    );
  }

  if (razorpay.credentials === "missing" && !razorpay.devSkipPayment) {
    return NextResponse.json(
      {
        ok: false,
        checks,
        error: "Razorpay test credentials are not configured",
      },
      { status: 503 }
    );
  }

  try {
    await connectDB();
    return NextResponse.json({ ok: true, checks });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Database connection failed";

    console.error("Health check DB error:", error);

    return NextResponse.json(
      {
        ok: false,
        checks,
        error: message,
      },
      { status: 503 }
    );
  }
}
