"use client";

import Image from "next/image";
import Link from "next/link";
import type { WishlistProduct } from "@/types/wishlist";

type WishlistItemProps = {
    product: WishlistProduct;
    onRemove: (productId: string) => void;
    onAddToCart: (productId: string) => void;
    removing: boolean;
    addingToCart: boolean;
};

export default function WishlistItem({
    product,
    onRemove,
    onAddToCart,
    removing,
    addingToCart
}: WishlistItemProps) {
    return (
        <div className="flex flex-col gap-5 border-b border-gray-200 py-6 sm:flex-row sm:items-center">
            <Link
                href={`/products/${product._id}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100"
            >
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                />
            </Link>

            <div className="min-w-0 flex-1">
                <Link
                    href={`/products/${product._id}`}
                    className="font-semibold text-gray-900 transition hover:text-gray-600"
                >
                    {product.name}
                </Link>

                {product.category && (
                    <p className="mt-1 text-sm text-gray-500">
                        {product.category.name}
                    </p>
                )}

                <p className="mt-2 text-sm font-medium text-gray-900">
                    Rs. {product.price.toLocaleString()}
                </p>

                <p
                    className={`mt-1 text-sm ${
                        product.stock > 0
                            ? "text-green-600"
                            : "text-red-600"
                    }`}
                >
                    {product.stock > 0
                        ? `${product.stock} available`
                        : "Out of stock"}
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    disabled={
                        product.stock === 0 ||
                        addingToCart ||
                        removing
                    }
                    onClick={() => onAddToCart(product._id)}
                    className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                    {addingToCart
                        ? "Adding..."
                        : "Add to Cart"}
                </button>

                <button
                    type="button"
                    disabled={removing || addingToCart}
                    onClick={() => onRemove(product._id)}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {removing ? "Removing..." : "Remove"}
                </button>
            </div>
        </div>
    );
}