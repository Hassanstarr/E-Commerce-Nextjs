"use client";

import { getProductPricing, type ProductDiscount } from "@/lib/product-pricing";
import useDiscountExpiry from "@/hooks/useDiscountExpiry";

export default function ProductPrice({ product }: { product: ProductDiscount & { price: number } }) {
    useDiscountExpiry([product]);
    const pricing = getProductPricing(product);

    return (
        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Rs. {pricing.price.toLocaleString()}</span>
            {pricing.discountPercent > 0 && <>
                <span className="text-xs font-normal text-gray-400 line-through"><span className="sr-only">Original price: </span>Rs. {pricing.originalPrice.toLocaleString()}</span>
                <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-600">{pricing.discountPercent}% off</span>
            </>}
        </span>
    );
}
