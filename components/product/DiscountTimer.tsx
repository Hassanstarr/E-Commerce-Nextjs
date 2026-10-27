"use client";

import { useEffect, useState } from "react";
import { FiClock } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { getProductPricing, type ProductDiscount } from "@/lib/product-pricing";
import { formatDiscountTime } from "@/lib/discount-time";

export default function DiscountTimer({ product }: { product: ProductDiscount & { price: number } }) {
    const { user } = useAuth();
    const [now, setNow] = useState(0);
    const pricing = getProductPricing(product, now || undefined, user?.role);
    const hasDeadline = pricing.availableOffers.some((offer) => offer.discountEndsAt);

    useEffect(() => {
        if (!hasDeadline) return;
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [hasDeadline]);

    if (!pricing.availableOffers.length) return null;

    return (
        <div className="mt-4 space-y-2 text-sm">
            {pricing.availableOffers.map((offer) => (
                <div key={offer.discountAudience} className={`flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg px-3 py-2 ${offer.discountAudience === "members" ? "bg-violet-50 text-violet-700" : "bg-emerald-50 text-emerald-700"}`}>
                    <FiClock aria-hidden="true" className="shrink-0" />
                    <span className="font-medium">{offer.discountAudience === "members" ? "Member offer" : "Everyone offer"}</span>
                    <span className="tabular-nums">{offer.discountEndsAt
                        ? now ? `Ends in ${formatDiscountTime(offer.discountEndsAt, now) || "00:00:00"}` : "Calculating time…"
                        : "No end date set"}</span>
                </div>
            ))}
        </div>
    );
}
