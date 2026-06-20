import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { devSkipPayment } from "@/lib/dev";
import { resolvePurchasedSets, userOwnsSet } from "@/lib/access";
import { isValidSetId } from "@/config/sets";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  purchasedSets: string[];
}

export async function requireAuth(
  request: NextRequest
): Promise<
  | { user: AuthenticatedUser; error: null }
  | { user: null; error: NextResponse }
> {
  const payload = await getAuthFromRequest(request);

  if (!payload) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  await connectDB();
  const dbUser = await User.findById(payload.userId).select(
    "purchasedSets hasAccess email"
  );

  if (!dbUser) {
    return {
      user: null,
      error: NextResponse.json({ error: "User not found" }, { status: 401 }),
    };
  }

  return {
    user: {
      userId: payload.userId,
      email: dbUser.email,
      purchasedSets: resolvePurchasedSets(dbUser),
    },
    error: null,
  };
}

export async function requireSetAccess(
  request: NextRequest,
  setId: string
): Promise<
  | { user: AuthenticatedUser; error: null }
  | { user: null; error: NextResponse }
> {
  if (!isValidSetId(setId)) {
    return {
      user: null,
      error: NextResponse.json({ error: "Invalid photo set" }, { status: 404 }),
    };
  }

  if (devSkipPayment) {
    return {
      user: {
        userId: "dev",
        email: "dev@local",
        purchasedSets: [setId],
      },
      error: null,
    };
  }

  const result = await requireAuth(request);

  if (result.error) {
    return result;
  }

  await connectDB();
  const dbUser = await User.findById(result.user.userId).select(
    "purchasedSets hasAccess"
  );

  if (!dbUser || !userOwnsSet(dbUser, setId)) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Payment required to access this set" },
        { status: 403 }
      ),
    };
  }

  return result;
}
