import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/middleware-auth";

import { verifyPaymentSignature } from "@/lib/razorpay";

import { grantAccessForPayment } from "@/lib/payments";

import { getUserPurchasedSets } from "@/lib/access";



export async function POST(request: NextRequest) {

  try {

    const auth = await requireAuth(request);

    if (auth.error) return auth.error;



    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =

      await request.json();



    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {

      return NextResponse.json(

        { error: "Missing payment verification fields" },

        { status: 400 }

      );

    }



    const isValid = verifyPaymentSignature(

      razorpay_order_id,

      razorpay_payment_id,

      razorpay_signature

    );



    if (!isValid) {

      return NextResponse.json(

        { error: "Invalid payment signature" },

        { status: 400 }

      );

    }



    await grantAccessForPayment(razorpay_order_id, razorpay_payment_id);

    const purchasedSets = await getUserPurchasedSets(auth.user.userId);



    return NextResponse.json({

      success: true,

      purchasedSets,

    });

  } catch (error) {

    console.error("Verify payment error:", error);

    return NextResponse.json(

      { error: "Payment verification failed" },

      { status: 500 }

    );

  }

}

