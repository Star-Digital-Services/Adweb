import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { grantAccessForPayment } from "@/lib/payments";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing webhook signature" },
        { status: 400 }
      );
    }

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event as string;

    if (eventType === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      const orderId = payment?.order_id as string | undefined;
      const paymentId = payment?.id as string | undefined;

      if (orderId && paymentId) {
        await grantAccessForPayment(orderId, paymentId);
      }
    }

    if (eventType === "payment.failed") {
      const payment = event.payload?.payment?.entity;
      const orderId = payment?.order_id as string | undefined;

      if (orderId) {
        await connectDB();
        await Order.findOneAndUpdate(
          { razorpayOrderId: orderId },
          { status: "failed", updatedAt: new Date() }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
