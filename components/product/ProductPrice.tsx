"use client";

import { getProductPricing, type ProductDiscount } from "@/lib/product-pricing";
import useDiscountExpiry from "@/hooks/useDiscountExpiry";
import { useAuth } from "@/context/AuthContext";
import { HiSparkles } from "react-icons/hi2";

export default function ProductPrice({ product, preview = false }: { product: ProductDiscount & { price: number }; preview?: boolean }) {
    const { user } = useAuth();
    useDiscountExpiry([product]);
    const pricing = getProductPricing(product, undefined, preview ? "member" : user?.role);
    const publicOffer = pricing.availableOffers.find((offer) => offer.discountAudience === "all");
    const memberOffer = pricing.availableOffers.find((offer) => offer.discountAudience === "members");
    const memberSelected = pricing.discountAudience === "members" && pricing.discountPercent > 0;

    return (
        <span className="inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1.5 align-middle leading-snug">
            <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
                <span className={`font-semibold ${memberSelected ? publicOffer ? "text-gray-500" : "text-gray-400 line-through" : publicOffer ? "text-emerald-700" : "text-gray-900"}`}>
                    <span className="sr-only">Everyone: </span>Rs. {(publicOffer?.price ?? pricing.originalPrice).toLocaleString()}{!memberSelected && <span className="sr-only">Your price</span>}
                </span>
                {publicOffer && <span className="text-[10px] font-medium text-emerald-700">−{publicOffer.discountPercent}%</span>}
                {publicOffer && <span className="text-xs font-normal text-gray-400 line-through"><span className="sr-only">Original price: </span>Rs. {pricing.originalPrice.toLocaleString()}</span>}
            </span>
            {memberOffer && <span className={`inline-flex max-w-full flex-wrap items-center gap-x-1 gap-y-0.5 rounded-md px-2 py-1 text-xs ring-1 ring-inset ${memberSelected ? "bg-violet-600 text-white shadow-sm ring-violet-600" : "bg-violet-50 text-violet-700 ring-violet-200"}`}>
                <span className="sr-only">Members only: </span>
                <HiSparkles aria-hidden="true" className="h-3 w-3 shrink-0" />
                <span className="text-[10px] font-semibold uppercase tracking-wide">Member</span>
                <span className="font-bold">Rs. {memberOffer.price.toLocaleString()}{memberSelected && <span className="sr-only">Your price</span>}</span>
                <span className={`text-[10px] font-medium ${memberSelected ? "text-violet-100" : "text-violet-500"}`}>−{memberOffer.discountPercent}%</span>
            </span>}
        </span>
    );
}
