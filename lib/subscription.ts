import { z } from "zod";

export const subscriptionSchema = z.object({
    wishlistRestock: z.boolean(),
    discounts: z.boolean(),
    discountScope: z.enum(["all", "categories"]),
    categories: z.array(z.string().regex(/^[a-f\d]{24}$/i, "Invalid category")).max(100),
    cartReminder: z.boolean(),
}).strict().refine((data) => !data.discounts || data.discountScope !== "categories" || data.categories.length > 0, {
    message: "Select at least one category for discount emails.",
    path: ["categories"],
});

export type SubscriptionPreferences = z.infer<typeof subscriptionSchema>;

export const defaultSubscription: SubscriptionPreferences = {
    wishlistRestock: false,
    discounts: false,
    discountScope: "all",
    categories: [],
    cartReminder: false,
};

export function subscriptionDeliveryDay(date: Date, eventsAfter: Date, allowRepeat = false) {
    const day = date.toISOString().slice(0, 10);
    return allowRepeat ? `${day}:local:${eventsAfter.getTime()}` : day;
}

export function subscriptionLoginRedirect(fallback: string) {
    const next = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null;
    if (next === "/subscription" || next === "/membership") {
        return next;
    }
    return fallback;
}
