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

export const memberDiscountMessage = "Member discount must be equal to or greater than the everyone discount. Increase the member discount, lower the everyone discount, or remove the member offer.";

export function getDiscountValidationError(product: ProductDiscount) {
    const [publicOffer, memberOffer] = getProductDiscounts(product);
    return memberOffer.discountPercent > 0 && memberOffer.discountPercent < publicOffer.discountPercent ? memberDiscountMessage : "";
}

export function getProductPricing(product: ProductDiscount & { price: number }, now = Date.now(), role: UserRole = "user") {
    const availableOffers = getProductDiscounts(product).filter((offer) => {
        const percent = offer.discountPercent;
        return percent >= 1 && percent <= 99 && Number.isInteger(percent)
            && (!offer.discountEndsAt || new Date(offer.discountEndsAt).getTime() > now);
    }).map((offer) => ({ ...offer, price: Math.round(Math.round(product.price * 100) * (100 - offer.discountPercent) / 100) / 100 }));
    const offers = availableOffers.filter((offer) => offer.discountAudience === "all" || role === "member");
    const best = offers.reduce<(typeof offers)[number] | undefined>((best, offer) => !best || offer.discountPercent > best.discountPercent
        || (offer.discountPercent === best.discountPercent && offer.discountAudience === "members") ? offer : best, undefined);
    const percent = best?.discountPercent || 0;
    const price = best?.price ?? product.price;
    return { price, originalPrice: product.price, discountPercent: percent, offerPercent: percent,
        discountAudience: best?.discountAudience || "all", offers, availableOffers };
}
