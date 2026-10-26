"use client";

import { getProductPricing, type ProductDiscount } from "@/lib/product-pricing";
import useDiscountExpiry from "@/hooks/useDiscountExpiry";
import { useAuth } from "@/context/AuthContext";

export default function ProductPrice({ product, preview = false }: { product: ProductDiscount & { price: number }; preview?: boolean }) {
    const { user } = useAuth();
    useDiscountExpiry([product]);
    const pricing = getProductPricing(product, undefined, preview ? "member" : user?.role);

    return (
        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Rs. {pricing.price.toLocaleString()}</span>
            {pricing.discountPercent > 0 && <>
                <span className="text-xs font-normal text-gray-400 line-through"><span className="sr-only">Original price: </span>Rs. {pricing.originalPrice.toLocaleString()}</span>
            </>}
            {pricing.offers.map((offer) => <span key={offer.discountAudience} className={`rounded px-1.5 py-0.5 text-xs font-semibold ${offer.discountAudience === "members" ? "bg-gray-900 text-white" : "bg-red-50 text-red-600"}`}>
                {offer.discountPercent}% off · {offer.discountAudience === "members" ? "Members only" : "Everyone"}
            </span>)}
        </span>
    );
}
