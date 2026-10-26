import type { UserRole } from "@/types";

// Default for NEW subscriptions. Existing Stripe subscriptions keep their agreed price.
export const membershipPlan = { name: "ShopEase Membership", monthlyPrice: 5000, currency: "pkr" };

export function getUserRole(user: { role: UserRole; memberUntil?: Date | null }): UserRole {
    if (user.role === "member" && (!user.memberUntil || new Date(user.memberUntil).getTime() <= Date.now())) return "user";
    return user.role;
}
