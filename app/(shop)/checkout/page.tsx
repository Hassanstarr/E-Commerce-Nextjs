"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    FiArrowLeft,
    FiCheckCircle,
    FiCreditCard,
    FiEdit2,
    FiMail,
    FiMapPin,
    FiPhone,
    FiShoppingBag,
    FiTruck,
    FiUser,
    FiAlertCircle,
    FiLoader,
} from "react-icons/fi";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { getCart } from "@/services/cart.api";
import { createOrder } from "@/services/order.api";
import type { Cart } from "@/types/cart";
import { useRouter } from "next/navigation";

const initialForm = {
    customerName: "",
    customerEmail: "",
    confirmEmail: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
};

export default function CheckoutPage() {
    return (
        <ProtectedRoute>
            <CheckoutContent />
        </ProtectedRoute>
    );
}

function CheckoutContent() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);

    const [formData, setFormData] =
        useState(initialForm);

    const [emailEditing, setEmailEditing] =
        useState(false);

    const [emailDraft, setEmailDraft] =
        useState("");

    const [error, setError] = useState("");
    const [stockError, setStockError] =
        useState("");

    useEffect(() => {
        if (!user) return;

        setFormData((previous) => ({
            ...previous,
            customerName: user.name,
            customerEmail: user.email,
            confirmEmail: user.email,
        }));

        setEmailDraft(user.email);
    }, [user]);

    useEffect(() => {
        const loadCart = async () => {
            try {
                setLoading(true);

                const result = await getCart();

                setCart(result);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Unable to load your cart"
                );
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && user) {
            loadCart();
        }
    }, [authLoading, user]);

    useEffect(() => {
        if (!cart) return;

        const unavailableItem = cart.items.find(
            (item) =>
                item.quantity > item.product.stock
        );

        if (unavailableItem) {
            setStockError(
                `${unavailableItem.product.name} only has ${unavailableItem.product.stock} item(s) available, but you requested ${unavailableItem.quantity}.`
            );
        } else {
            setStockError("");
        }
    }, [cart]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
    };

    const handleSaveEmail = () => {
        const email = emailDraft.trim();

        if (!email) {
            setError(
                "Please enter an email address"
            );
            return;
        }

        if (!email.includes("@")) {
            setError(
                "Please enter a valid email address"
            );
            return;
        }

        setFormData((previous) => ({
            ...previous,
            customerEmail: email,
            confirmEmail: email,
        }));

        setEmailEditing(false);
        setError("");
    };

    const handleCancelEmailEdit = () => {
        setEmailDraft(formData.customerEmail);
        setEmailEditing(false);
        setError("");
    };

    const handleSubmit = async ( e: React.FormEvent ) => {
        e.preventDefault();

        if (!cart || cart.items.length === 0) {
            setError(
                "Your cart is empty"
            );
            return;
        }

        if (stockError) {
            setError(
                "Please update your cart because some products do not have enough stock."
            );
            return;
        }

        if (
            formData.customerEmail.toLowerCase() !==
            formData.confirmEmail.toLowerCase()
        ) {
            setError(
                "Email addresses do not match"
            );
            return;
        }

        try {
            setPlacingOrder(true);
            setError("");

           const result = await createOrder({
                customerName: formData.customerName,
                customerEmail: formData.customerEmail,
                confirmEmail: formData.confirmEmail,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                postalCode: formData.postalCode,
                paymentMethod: "cod",
            });

            router.push(
                `/order-success/${result.data.orderId}`
            );
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to place your order"
            );
        } finally {
            setPlacingOrder(false);
        }
    };

    if (authLoading || loading) {
        return (
            <section className="flex min-h-[70vh] items-center justify-center">
                <FiLoader className="animate-spin text-2xl" />
            </section>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <section className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4 py-16">
                <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                    <FiShoppingBag className="mx-auto text-4xl text-gray-400" />

                    <h1 className="mt-4 text-2xl font-bold text-gray-900">
                        Your cart is empty
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Add some products before checking out.
                    </p>

                    <Link
                        href="/products"
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        <FiShoppingBag />
                        Continue Shopping
                    </Link>
                </div>
            </section>
        );
    }

    const subtotal = cart.items.reduce(
        (total, item) =>
            total +
            item.product.price * item.quantity,
        0
    );

    const deliveryFee = 200;
    const total = subtotal + deliveryFee;

    return (
        <section className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <Link
                    href="/cart"
                    className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                    <FiArrowLeft />
                    Back to Cart
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Checkout
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Complete your details to place your order.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <FiAlertCircle className="mt-0.5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {stockError && (
                    <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                        <FiAlertCircle className="mt-0.5 shrink-0" />

                        <div>
                            <p className="font-medium">
                                Stock needs your attention
                            </p>

                            <p className="mt-1">
                                {stockError}
                            </p>

                            <Link
                                href="/cart"
                                className="mt-2 inline-block font-medium underline"
                            >
                                Update your cart
                            </Link>
                        </div>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="grid gap-8 lg:grid-cols-[1fr_380px]"
                >
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="rounded-lg bg-gray-100 p-2 text-black">
                                    <FiUser />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        Contact Information
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Where should we send your order confirmation?
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Name
                                    </label>

                                    <div className="relative">
                                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                        <input
                                            name="customerName"
                                            value={
                                                formData.customerName
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-gray-900"
                                            placeholder="Your name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Email
                                        </label>

                                        {!emailEditing && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEmailDraft(
                                                        formData.customerEmail
                                                    );
                                                    setEmailEditing(
                                                        true
                                                    );
                                                }}
                                                className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-black"
                                            >
                                                <FiEdit2 />
                                                Edit
                                            </button>
                                        )}
                                    </div>

                                    {!emailEditing ? (
                                        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                            <FiMail className="text-gray-500" />

                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {
                                                        formData.customerEmail
                                                    }
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    Order confirmation will be sent here.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <input
                                                type="email"
                                                value={
                                                    emailDraft
                                                }
                                                onChange={(e) =>
                                                    setEmailDraft(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                                                placeholder="Email address"
                                            />

                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleSaveEmail
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                                                >
                                                    <FiCheckCircle />
                                                    Save Email
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleCancelEmailEdit
                                                    }
                                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Confirm Email
                                    </label>

                                    <input
                                        type="email"
                                        name="confirmEmail"
                                        value={
                                            formData.confirmEmail
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                                        placeholder="Confirm email address"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Phone
                                    </label>

                                    <div className="relative">
                                        <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                        <input
                                            type="tel"
                                            name="phone"
                                            value={
                                                formData.phone
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-gray-900"
                                            placeholder="03XX XXXXXXX"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="text-black rounded-lg bg-gray-100 p-2">
                                    <FiMapPin />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        Shipping Information
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Where should we deliver your order?
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Address
                                    </label>

                                    <textarea
                                        name="address"
                                        value={
                                            formData.address
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows={3}
                                        className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                                        placeholder="House, street, area..."
                                    />
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            City
                                        </label>

                                        <input
                                            name="city"
                                            value={
                                                formData.city
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                                            placeholder="Lahore"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Postal Code
                                        </label>

                                        <input
                                            name="postalCode"
                                            value={
                                                formData.postalCode
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                                            placeholder="54000"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="text-black rounded-lg bg-gray-100 p-2">
                                    <FiCreditCard />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        Payment Method
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Choose how you want to pay.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 rounded-xl border-2 border-black bg-gray-50 p-4">
                                <div className="mt-1">
                                    <FiTruck className="text-black text-xl" />
                                </div>

                                <div>
                                    <p className="font-semibold text-gray-900">
                                        Cash on Delivery
                                    </p>

                                    <p className="mt-1 text-sm text-gray-600">
                                        Pay when your order is delivered.
                                    </p>
                                </div>

                                <FiCheckCircle className="ml-auto text-xl" />
                            </div>
                        </div>
                    </div>

                    <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
                        <h2 className="text-xl font-bold text-gray-900">
                            Order Summary
                        </h2>

                        <div className="mt-6 space-y-5">
                            {cart.items.map((item) => (
                                <div
                                    key={item.product._id}
                                    className="flex gap-3"
                                >
                                    <img
                                        src={item.product.image}
                                        alt={
                                            item.product.name
                                        }
                                        className="h-16 w-16 rounded-lg object-cover"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-gray-900">
                                            {
                                                item.product
                                                    .name
                                            }
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Qty:{" "}
                                            {
                                                item.quantity
                                            }
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                            Rs.{" "}
                                            {(
                                                item.product
                                                    .price *
                                                item.quantity
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="my-6 border-t border-gray-200" />

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-700">
                                    Subtotal
                                </span>

                                <span className="font-medium text-gray-700">
                                    Rs.{" "}
                                    {subtotal.toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-700">
                                    Delivery
                                </span>

                                <span className="font-medium text-gray-700">
                                    Rs.{" "}
                                    {deliveryFee.toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between border-t border-gray-200 pt-3 text-base text-gray-700">
                                <span className="font-semibold">
                                    Total
                                </span>

                                <span className="font-bold">
                                    Rs.{" "}
                                    {total.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={
                                placingOrder ||
                                Boolean(stockError)
                            }
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {placingOrder ? (
                                <>
                                    <FiLoader className="animate-spin" />
                                    Placing Order...
                                </>
                            ) : (
                                <>
                                    <FiCheckCircle />
                                    Place Order
                                </>
                            )}
                        </button>

                        <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
                            <FiTruck className="mt-0.5 shrink-0" />

                            <p>
                                Your order will be delivered to
                                the address provided above.
                                Payment will be collected on
                                delivery.
                            </p>
                        </div>
                    </aside>
                </form>
            </div>
        </section>
    );
}