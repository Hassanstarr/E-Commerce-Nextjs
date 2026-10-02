"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { addToWishlist } from "@/services/wishlist.api";

type AddToWishlistButtonProps = {
    productId: string;
};

export default function AddToWishlistButton({
    productId,
}: AddToWishlistButtonProps) {
    const router = useRouter();
    const { user, loading } = useAuth();

    const [adding, setAdding] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleAdd = async () => {
        if (!user) {
            router.push("/auth/login");
            return;
        }

        try {
            setAdding(true);
            setMessage("");
            setError("");

            await addToWishlist(productId);

            setMessage("Added to wishlist");

            setTimeout(() => {
                setMessage("");
            }, 2000);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Unable to add to wishlist");
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
                disabled={loading || adding}
                onClick={handleAdd}
                className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {adding ? "Adding..." : "Add to Wishlist"}
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