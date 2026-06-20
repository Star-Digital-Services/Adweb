import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getAuthFromCookies } from "@/lib/auth";
import { resolvePurchasedSets } from "@/lib/access";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getAuthFromCookies();
    if (!payload) {
      return NextResponse.json({ user: null });
    }

    await connectDB();
    const user = await User.findById(payload.userId).select(
      "email purchasedSets hasAccess"
    );

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: payload.userId,
        email: user.email,
        purchasedSets: resolvePurchasedSets(user),
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ user: null });
  }
}
