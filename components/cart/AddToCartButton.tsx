"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/services/cart.api";
import { useAuth } from "@/context/AuthContext";
import { HiOutlineShoppingCart, HiOutlineCheck } from "react-icons/hi2";

type AddToCartButtonProps = {
    productId: string;
    stock: number;
    variant?: "default" | "card";
    productName?: string;
};

export default function AddToCartButton({
    productId,
    stock,
    variant = "default",
    productName,
}: AddToCartButtonProps) {
    const router = useRouter();
    const { user, loading } = useAuth();

    const [adding, setAdding] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleAddToCart = async () => {
        if (loading || adding || stock <= 0) return;
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
        <div className={variant === "card" ? "w-full" : "relative"}>
            <button
                type="button"
                disabled={stock <= 0 || loading || adding}
                aria-busy={adding}
                aria-label={variant === "card" && productName ? `Add ${productName} to cart` : undefined}
                onClick={handleAddToCart}
                className={`rounded-lg bg-black text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 ${variant === "card" ? "flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 px-4 py-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900" : "px-6 py-3"}`}
            >
                {variant === "card" && stock > 0 && (adding ? <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" /> : message ? <HiOutlineCheck aria-hidden="true" className="h-4 w-4" /> : <HiOutlineShoppingCart aria-hidden="true" className="h-4 w-4" />)}
                {stock <= 0
                    ? "Out of Stock"
                    : adding
                    ? "Adding..."
                    : variant === "card" && message
                    ? "Added"
                    : "Add to Cart"}
            </button>

            {message && (
                <p role="status" className={variant === "card" ? "sr-only" : "absolute left-0 top-full mt-2 whitespace-nowrap text-sm text-green-600"}>
                    {message}
                </p>
            )}

            {error && (
                <p role="alert" className={variant === "card" ? "mt-2 break-words text-xs leading-5 text-red-600" : "absolute left-0 top-full mt-2 whitespace-nowrap text-sm text-red-600"}>
                    {error}
                </p>
            )}
        </div>
    );
}
