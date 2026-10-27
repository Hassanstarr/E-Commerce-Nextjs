"use client";

import { getProductPricing, type ProductDiscount } from "@/lib/product-pricing";
import useDiscountExpiry from "@/hooks/useDiscountExpiry";
import { useAuth } from "@/context/AuthContext";
import { HiSparkles } from "react-icons/hi2";

export default function ProductPrice({ product, preview = false, variant = "compact" }: { product: ProductDiscount & { price: number }; preview?: boolean; variant?: "compact" | "detail" | "applied" }) {
    const { user } = useAuth();
    useDiscountExpiry([product]);
    const pricing = getProductPricing(product, undefined, preview ? "member" : user?.role);
    const publicOffer = pricing.availableOffers.find((offer) => offer.discountAudience === "all");
    const memberOffer = pricing.availableOffers.find((offer) => offer.discountAudience === "members");
    const memberSelected = pricing.discountAudience === "members" && pricing.discountPercent > 0;

    if (variant !== "compact") {
        return (
            <span className="inline-flex max-w-full flex-col items-start gap-2">
                <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className={`font-bold ${memberSelected ? "text-violet-700" : pricing.discountPercent ? "text-emerald-700" : "text-gray-900"}`}>
                        <span className="sr-only">Your price: </span>Rs. {pricing.price.toLocaleString()}
                    </span>
                    {pricing.discountPercent > 0 && <>
                        <span className={`rounded-md px-2 py-1 text-xs font-medium ${memberSelected ? "bg-violet-100 text-violet-700" : "bg-emerald-50 text-emerald-700"}`}>
                            {memberSelected ? "Member price" : "Everyone discount"} · −{pricing.discountPercent}%
                        </span>
                        <span className="text-sm font-normal text-gray-400 line-through"><span className="sr-only">Original price: </span>Rs. {pricing.originalPrice.toLocaleString()}</span>
                    </>}
                </span>
                {variant === "detail" && pricing.availableOffers.filter((offer) => offer.discountAudience !== pricing.discountAudience
                    && (offer.discountAudience === "all" || offer.price <= pricing.price)).map((offer) => (
                    <span key={offer.discountAudience} className={`inline-flex flex-wrap items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium ${offer.discountAudience === "members" ? "bg-violet-50 text-violet-700" : "bg-gray-100 text-gray-600"}`}>
                        {offer.discountAudience === "members" && <HiSparkles aria-hidden="true" className="h-3.5 w-3.5" />}
                        {offer.discountAudience === "members" ? "Member price" : "Everyone price"}: Rs. {offer.price.toLocaleString()} · −{offer.discountPercent}%
                    </span>
                ))}
            </span>
        );
    }

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
