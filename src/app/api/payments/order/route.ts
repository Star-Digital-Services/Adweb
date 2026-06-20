import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db";

import Order from "@/models/Order";

import User from "@/models/User";

import { requireAuth } from "@/lib/middleware-auth";

import { userOwnsSet } from "@/lib/access";

import { createRazorpayOrder, getRazorpayKeyId } from "@/lib/razorpay";

import { getSetById } from "@/config/sets";



export async function POST(request: NextRequest) {

  try {

    const auth = await requireAuth(request);

    if (auth.error) return auth.error;



    const { setId } = await request.json();



    if (!setId || typeof setId !== "string") {

      return NextResponse.json(

        { error: "setId is required" },

        { status: 400 }

      );

    }



    const photoSet = getSetById(setId);

    if (!photoSet) {

      return NextResponse.json({ error: "Photo set not found" }, { status: 404 });

    }



    await connectDB();

    const dbUser = await User.findById(auth.user.userId).select(

      "purchasedSets hasAccess"

    );



    if (dbUser && userOwnsSet(dbUser, setId)) {

      return NextResponse.json(

        { error: "You already have access to this set" },

        { status: 400 }

      );

    }



    const receipt = `${setId}_${Date.now().toString(36)}`;

    const razorpayOrder = await createRazorpayOrder(

      photoSet.pricePaise,

      receipt,

      setId,

      photoSet.name

    );



    await Order.create({

      userId: auth.user.userId,

      setId,

      razorpayOrderId: razorpayOrder.id,

      amount: photoSet.pricePaise,

      status: "pending",

    });



    return NextResponse.json({

      orderId: razorpayOrder.id,

      amount: photoSet.pricePaise,

      currency: "INR",

      keyId: getRazorpayKeyId(),

      setId,

    });

  } catch (error) {

    console.error("Create order error:", error);

    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "Failed to create payment order";

    return NextResponse.json(

      { error: message },

      { status: 500 }

    );

  }

}

