"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WishlistItem from "@/components/wishlist/WishlistItem";
import EmptyState from "@/components/ui/EmptyState";
import Spinner from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { addToCart } from "@/services/cart.api";
import { getWishlist, removeFromWishlist } from "@/services/wishlist.api";
import type { Wishlist } from "@/types/wishlist";

export default function WishlistPage() {
    return (
        <ProtectedRoute>
            <WishlistContent />
        </ProtectedRoute>
    );
}

function WishlistContent() {
    const { user } = useAuth();

    const [wishlist, setWishlist] = useState<Wishlist>({
        _id: null,
        products: [],
    });

    const [loading, setLoading] = useState(true);
    const [removingProduct, setRemovingProduct] = useState<
        string | null
    >(null);
    const [addingProduct, setAddingProduct] = useState<
        string | null
    >(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const loadWishlist = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getWishlist();

                setWishlist(data);
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Unable to load wishlist");
                }
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadWishlist();
        }
    }, [user]);

    const handleRemove = async (productId: string) => {
        try {
            setRemovingProduct(productId);
            setError("");
            setMessage("");

            const updatedWishlist =
                await removeFromWishlist(productId);

            setWishlist(updatedWishlist);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Unable to remove product");
            }
        } finally {
            setRemovingProduct(null);
        }
    };

    const handleAddToCart = async (productId: string) => {
        try {
            setAddingProduct(productId);
            setError("");
            setMessage("");

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
        } finally {
            setAddingProduct(null);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center">
                <Spinner />
            </main>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50 items-center justify-center">
            <main className="mx-auto max-w-7xl px-4 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        My Wishlist
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Products you want to keep for later.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {message}
                    </div>
                )}

                {wishlist.products.length === 0 ? (
                    <EmptyState
                        title="Your wishlist is empty"
                        message="Add products to your wishlist to see them here."
                    />
                ) : (
                    <section className="rounded-xl border border-gray-200 bg-white px-5">
                        {wishlist.products.map((product) => (
                            <WishlistItem
                                key={product._id}
                                product={product}
                                onRemove={handleRemove}
                                onAddToCart={handleAddToCart}
                                removing={
                                    removingProduct === product._id
                                }
                                addingToCart={
                                    addingProduct === product._id
                                }
                            />
                        ))}
                    </section>
                )}
            </main>
        </section>
    );
}