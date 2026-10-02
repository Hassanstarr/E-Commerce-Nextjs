"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/services/cart.api";
import { useAuth } from "@/context/AuthContext";

type AddToCartButtonProps = {
    productId: string;
    stock: number;
};

export default function AddToCartButton({
    productId,
    stock,
}: AddToCartButtonProps) {
    const router = useRouter();
    const { user, loading } = useAuth();

    const [adding, setAdding] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleAddToCart = async () => {
        if (!user) {
            router.push("/auth/login");
            return;
        }

        try {
            setAdding(true);
            setMessage("");
            setError("");

            await addToCart(productId, 1);

            setMessage("Product added to cart");

            setTimeout(() => {
                setMessage("");
            }, 2000);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Unable to add product to cart");
            }

            setTimeout(() => {
                setError("");
            }, 2000);
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="relative">
            <button
                type="button"
                disabled={stock === 0 || loading || adding}
                onClick={handleAddToCart}
                className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
                {stock === 0
                    ? "Out of Stock"
                    : adding
                    ? "Adding..."
                    : "Add to Cart"}
            </button>

            {message && (
                <p className="absolute left-0 top-full mt-2 whitespace-nowrap text-sm text-green-600">
                    {message}
                </p>
            )}

            {error && (
                <p className="absolute left-0 top-full mt-2 whitespace-nowrap text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}