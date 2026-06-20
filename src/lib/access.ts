import connectDB from "@/lib/db";
import User from "@/models/User";

/** Resolve purchased sets, including legacy hasAccess → set1 migration. */
export function resolvePurchasedSets(user: {
  purchasedSets?: string[];
  hasAccess?: boolean;
}): string[] {
  if (user.purchasedSets && user.purchasedSets.length > 0) {
    return user.purchasedSets;
  }
  if (user.hasAccess) {
    return ["set1"];
  }
  return [];
}

export function userOwnsSet(
  user: { purchasedSets?: string[]; hasAccess?: boolean },
  setId: string
): boolean {
  return resolvePurchasedSets(user).includes(setId);
}

export async function grantSetAccess(
  userId: string,
  setId: string
): Promise<void> {
  await connectDB();
  await User.findByIdAndUpdate(userId, {
    $addToSet: { purchasedSets: setId },
  });
}

export async function getUserPurchasedSets(userId: string): Promise<string[]> {
  await connectDB();
  const user = await User.findById(userId).select("purchasedSets hasAccess");
  if (!user) return [];
  return resolvePurchasedSets(user);
}
