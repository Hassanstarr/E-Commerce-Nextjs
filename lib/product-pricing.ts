export type ProductDiscount = {
    discountPercent?: number;
    discountEndsAt?: string | Date | null;
};

export function getProductPricing(product: ProductDiscount & { price: number }, now = Date.now()) {
    const percent = product.discountPercent || 0;
    const endsAt = product.discountEndsAt ? new Date(product.discountEndsAt).getTime() : null;
    const active = percent >= 1 && percent <= 99 && Number.isInteger(percent)
        && (endsAt === null || endsAt > now);
    const price = active
        ? Math.round(Math.round(product.price * 100) * (100 - percent) / 100) / 100
        : product.price;

    return { price, originalPrice: product.price, discountPercent: active ? percent : 0 };
}
