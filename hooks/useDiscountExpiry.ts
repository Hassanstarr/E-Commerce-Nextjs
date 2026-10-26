"use client";

import { useEffect, useState } from "react";
import { getProductDiscounts, type ProductDiscount } from "@/lib/product-pricing";

export default function useDiscountExpiry(products: ProductDiscount[]) {
    const [revision, setRevision] = useState(0);
    const deadlines = products.flatMap(getProductDiscounts).filter((product) => product.discountPercent && product.discountEndsAt)
        .map((product) => new Date(product.discountEndsAt!).getTime()).join(",");

    useEffect(() => {
        const next = deadlines.split(",").map(Number).filter((time) => time > Date.now()).sort((a, b) => a - b)[0];
        if (!next) return;
        const timer = setTimeout(() => setRevision((value) => value + 1), Math.min(next - Date.now() + 50, 2147483647));
        return () => clearTimeout(timer);
    }, [deadlines, revision]);
}
