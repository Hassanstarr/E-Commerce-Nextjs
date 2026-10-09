"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CartItem from "@/components/cart/CartItem";
import EmptyState from "@/components/ui/EmptyState";
import Spinner from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { getCart, updateCartItem, removeFromCart, clearCart } from "@/services/cart.api";
import type { Cart } from "@/types/cart";
import { FiArrowRight, FiShoppingBag } from "react-icons/fi";

export default function CartPage() {
    return (
        <ProtectedRoute>
            <CartContent />
        </ProtectedRoute>
    );
}

function CartContent() {
    const router = useRouter();
    const { user } = useAuth();

    const [cart, setCart] = useState<Cart>({
        _id: null,
        items: [],
    });

    const [loading, setLoading] = useState(true);
    const [updatingProduct, setUpdatingProduct] = useState<string | null>(
        null
    );
    const [clearing, setClearing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadCart = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getCart();

                setCart(data);
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Unable to load cart");
                }
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadCart();
        }
    }, [user]);

    const handleUpdate = async (
        productId: string,
        quantity: number
    ) => {
        try {
            setUpdatingProduct(productId);
            setError("");

            const updatedCart = await updateCartItem(
                productId,
                quantity
            );

            setCart(updatedCart);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Unable to update cart");
            }
        } finally {
            setUpdatingProduct(null);
        }
    };

    const handleRemove = async (productId: string) => {
        try {
            setUpdatingProduct(productId);
            setError("");

            const updatedCart = await removeFromCart(productId);

            setCart(updatedCart);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Unable to remove product");
            }
        } finally {
            setUpdatingProduct(null);
        }
    };

    const handleClearCart = async () => {
        try {
            setClearing(true);
            setError("");

            const updatedCart = await clearCart();

            setCart(updatedCart);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Unable to clear cart");
            }
        } finally {
            setClearing(false);
        }
    };

    const subtotal = cart.items.reduce(
        (total, item) =>
            total + item.product.price * item.quantity,
        0
    );

    if (loading) {
        return (
            <section className="flex min-h-screen w-full bg-white items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center gap-3">
                    <Spinner />
                    <p className="text-sm text-gray-500">
                        Loading cart...
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-155 bg-gray-50">   
            <main className="mx-auto max-w-7xl px-4 py-12">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Shopping Cart
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Review your items before checkout.
                        </p>
                    </div>

                    {cart.items.length > 0 && (
                        <button
                            type="button"
                            disabled={clearing}
                            onClick={handleClearCart}
                            className="self-start rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {clearing
                                ? "Clearing..."
                                : "Clear Cart"}
                        </button>
                    )}
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {cart.items.length === 0 ? (
                    <EmptyState
                        title="Your cart is empty"
                        message="Add some products to your cart to see them here."
                    />
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
                        <section className="rounded-xl border border-gray-200 bg-white px-5">
                            {cart.items.map((item) => (
                                <CartItem
                                    key={item.product._id}
                                    item={item}
                                    onUpdate={handleUpdate}
                                    onRemove={handleRemove}
                                    updating={
                                        updatingProduct ===
                                        item.product._id
                                    }
                                />
                            ))}
                        </section>

                        <aside className="h-fit rounded-xl border border-gray-200 bg-white p-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Order Summary
                            </h2>

                            <div className="mt-6 space-y-4">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>
                                        Items (
                                        {cart.items.reduce(
                                            (total, item) =>
                                                total + item.quantity,
                                            0
                                        )}
                                        )
                                    </span>

                                    <span>
                                        Rs.{" "}
                                        {subtotal.toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Shipping</span>

                                    <span>Calculated at checkout</span>
                                </div>

                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-900">
                                            Subtotal
                                        </span>

                                        <span className="font-bold text-gray-900">
                                            Rs.{" "}
                                            {subtotal.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <Link
                                    href="/checkout"
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                                >
                                    <FiShoppingBag />
                                    Proceed to Checkout
                                    <FiArrowRight />
                                </Link>

                                <Link
                                    href="/products"
                                    className="flex w-full items-center justify-center rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </aside>
                    </div>
                )}
            </main>
        </section>
    );
}