"use client";

import Image from "next/image";
import type { CartItem as CartItemType } from "@/types/cart";

type CartItemProps = {
    item: CartItemType;
    onUpdate: (productId: string, quantity: number) => void;
    onRemove: (productId: string) => void;
    updating: boolean;
};

export default function CartItem({ item, onUpdate, onRemove, updating }: CartItemProps) {
    const { product, quantity } = item;

    const subtotal = product.price * quantity;

    return (
        <div className="flex flex-col gap-5 border-b border-gray-200 py-6 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                />
            </div>

            <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-gray-900">
                    {product.name}
                </h2>

                {product.category && (
                    <p className="mt-1 text-sm text-gray-500">
                        {product.category.name}
                    </p>
                )}

                <p className="mt-2 text-sm text-gray-600">
                    Rs. {product.price.toLocaleString()}
                </p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    disabled={updating || quantity <= 1}
                    onClick={() =>
                        onUpdate(product._id, quantity - 1)
                    }
                    className="flex h-9 w-9 items-center justify-center text-black rounded-lg border border-gray-300 text-lg transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    -
                </button>

                <span className="w-8 text-center font-medium text-black">
                    {quantity}
                </span>

                <button
                    type="button"
                    disabled={
                        updating ||
                        quantity >= product.stock
                    }
                    onClick={() =>
                        onUpdate(product._id, quantity + 1)
                    }
                    className="flex h-9 w-9 items-center justify-center text-black rounded-lg border border-gray-300 text-lg transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    +
                </button>
            </div>

            <div className="sm:w-32 sm:text-right">
                <p className="font-semibold text-gray-900">
                    Rs. {subtotal.toLocaleString()}
                </p>

                <button
                    type="button"
                    disabled={updating}
                    onClick={() => onRemove(product._id)}
                    className="mt-2 text-sm font-medium text-red-600 transition hover:text-red-700 disabled:opacity-50"
                >
                    Remove
                </button>
            </div>
        </div>
    );
}