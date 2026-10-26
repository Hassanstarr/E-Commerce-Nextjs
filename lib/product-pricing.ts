import type { UserRole } from "@/types";

export type ProductDiscount = {
    discountPercent?: number;
    discountEndsAt?: string | Date | null;
    discountAudience?: "all" | "members";
    memberDiscountPercent?: number;
    memberDiscountEndsAt?: string | Date | null;
};

export function getProductDiscounts(product: ProductDiscount) {
    const legacyMember = product.discountAudience === "members";
    return [
        { discountAudience: "all" as const, discountPercent: legacyMember ? 0 : product.discountPercent || 0, discountEndsAt: legacyMember ? null : product.discountEndsAt || null },
        { discountAudience: "members" as const, discountPercent: product.memberDiscountPercent || (legacyMember ? product.discountPercent || 0 : 0),
            discountEndsAt: product.memberDiscountPercent ? product.memberDiscountEndsAt || null : legacyMember ? product.discountEndsAt || null : null },
    ];
}

export function getProductPricing(product: ProductDiscount & { price: number }, now = Date.now(), role: UserRole = "user") {
    const offers = getProductDiscounts(product).filter((offer) => {
        const percent = offer.discountPercent;
        return (offer.discountAudience === "all" || role === "member")
            && percent >= 1 && percent <= 99 && Number.isInteger(percent)
            && (!offer.discountEndsAt || new Date(offer.discountEndsAt).getTime() > now);
    });
    const best = offers.reduce<(typeof offers)[number] | undefined>((best, offer) => !best || offer.discountPercent > best.discountPercent ? offer : best, undefined);
    const percent = best?.discountPercent || 0;
    const price = percent ? Math.round(Math.round(product.price * 100) * (100 - percent) / 100) / 100 : product.price;
    return { price, originalPrice: product.price, discountPercent: percent, offerPercent: percent,
        discountAudience: best?.discountAudience || "all", offers };
}
