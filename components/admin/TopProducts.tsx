"use client";

import Image from "next/image";
import Spinner from "@/components/ui/Spinner";

export interface TopProductItem {
    name: string;
    category?: string;
    image?: string;
    quantity: number;
    revenue: number;
}

interface TopProductsProps {
    products?: TopProductItem[];
    loading?: boolean;
    error?: string;
}

const formatCurrency = (value: number) => `Rs. ${Math.round(value).toLocaleString("en-PK")}`;

export default function TopProducts({
    products = [],
    loading = false,
    error = "",
}: TopProductsProps) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div>
                <h2 className="font-semibold text-gray-900">
                    Top Products
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Best performing products by units sold.
                </p>
            </div>

            {loading && (
                <div className="mt-5 flex min-h-56 items-center justify-center rounded-xl bg-gray-50/50">
                    <div className="flex flex-col items-center gap-2">
                        <Spinner />
                        <p className="text-xs text-gray-500">Loading top products...</p>
                    </div>
                </div>
            )}

            {!loading && error && (
                <div className="mt-5 flex min-h-56 items-center justify-center rounded-xl border border-red-100 bg-red-50/50 px-4 text-center">
                    <p className="text-sm font-medium text-red-600">{error}</p>
                </div>
            )}

            {!loading && !error && products.length === 0 && (
                <div className="mt-5 flex min-h-56 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 text-center">
                    <p className="text-sm text-gray-500">No product sales recorded for this period.</p>
                </div>
            )}

            {!loading && !error && products.length > 0 && (
                <div className="mt-5 space-y-4">
                    {products.map((product, index) => (
                        <div
                            key={`${product.name}-${index}`}
                            className="flex items-center gap-3"
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-700">
                                {index + 1}
                            </div>

                            {product.image && (
                                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        sizes="40px"
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900">
                                    {product.name}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    {product.category || "Uncategorized"}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                    {product.quantity} sold
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    {formatCurrency(product.revenue)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}