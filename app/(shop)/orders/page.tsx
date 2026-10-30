"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Spinner from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { getMyOrders } from "@/services/order.api";
import type { MyOrdersData, Order } from "@/types/order";

const statusColors: Record<Order["orderStatus"], string> = {
    pending: "bg-yellow-50 text-yellow-700",
    confirmed: "bg-blue-50 text-blue-700",
    shipped: "bg-purple-50 text-purple-700",
    delivered: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-700",
};

function formatPrice(value: number) {
    return `Rs. ${value.toLocaleString("en-PK", { maximumFractionDigits: 2 })}`;
}

function OrdersContent() {
    const [data, setData] = useState<MyOrdersData | null>(null);
    const [page, setPage] = useState(1);
    const [attempt, setAttempt] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const loadOrders = async () => {
            try {
                const response = await getMyOrders(page, controller.signal);
                if (!controller.signal.aborted) setData(response.data);
            } catch (error) {
                if (!controller.signal.aborted) {
                    setError(error instanceof Error ? error.message : "Unable to fetch your orders");
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        loadOrders();
        return () => controller.abort();
    }, [page, attempt]);

    const changePage = (nextPage: number) => {
        setLoading(true);
        setError("");
        setPage(nextPage);
    };

    return (
        <section className="flex-1 bg-gray-50 px-4 py-12">
            <div className="mx-auto w-full max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                    <p className="mt-2 text-gray-500">View your past orders and their latest status.</p>
                </div>

                {loading ? (
                    <div role="status" className="py-16 text-center">
                        <Spinner />
                        <p className="mt-3 text-sm text-gray-500">Loading your orders...</p>
                    </div>
                ) : error ? (
                    <div role="alert" className="rounded-2xl border border-red-200 bg-white p-8 text-center">
                        <p className="text-sm text-red-600">{error}</p>
                        <button
                            type="button"
                            onClick={() => {
                                setLoading(true);
                                setError("");
                                setAttempt((value) => value + 1);
                            }}
                            className="mt-4 cursor-pointer rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            Try Again
                        </button>
                    </div>
                ) : data && (
                    <>
                        {data.orders.length === 0 ? (
                            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                                <HiOutlineShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                                    {data.pagination.total === 0 ? "No orders yet" : "No orders on this page"}
                                </h2>
                                <p className="mt-2 text-sm text-gray-500">Your placed orders will appear here.</p>
                                <Link
                                    href="/products"
                                    className="mt-6 inline-flex rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
                                >
                                    Start Shopping
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <p className="text-sm text-gray-500">{data.pagination.total} order(s)</p>
                                {data.orders.map((order) => (
                                    <article
                                        key={order._id}
                                        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                                            <div className="min-w-0">
                                                <h2 className="break-all text-sm font-semibold text-gray-900">
                                                    Order #{order._id}
                                                </h2>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString("en-PK", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                            <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColors[order.orderStatus]}`}>
                                                {order.orderStatus}
                                            </span>
                                        </div>

                                        <div className="px-6 py-5">
                                            <p className="font-medium text-gray-900">
                                                {order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}
                                            </p>
                                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                                <p className="text-lg font-semibold text-gray-900">{formatPrice(order.total)}</p>
                                                <p className="text-sm text-gray-500">
                                                    {order.paymentMethod === "stripe" ? "Stripe" : "Cash on Delivery"}
                                                    <span className={`ml-2 rounded-full px-3 py-1 text-xs font-medium ${order.paymentStatus === "paid" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                                                        {order.paymentStatus === "paid" ? "Paid" : order.paymentStatus === "refunded" ? "Refunded" : order.paymentStatus === "refund_pending" ? "Refund pending" : "Payment Pending"}
                                                    </span>
                                                </p>
                                            </div>

                                            <details className="mt-5 border-t border-gray-100 pt-4">
                                                <summary className="cursor-pointer text-sm font-medium text-gray-900">
                                                    View Order Details
                                                </summary>
                                                <div className="mt-5 divide-y divide-gray-100">
                                                    {order.items.map((item, index) => (
                                                        <div
                                                            key={`${item.product}-${index}`}
                                                            className="flex justify-between gap-4 py-3 text-sm"
                                                        >
                                                            <div className="min-w-0">
                                                                <p className="wrap-break-word font-medium text-gray-900">{item.name}</p>
                                                                <p className="mt-1 text-gray-500">{formatPrice(item.price)} × {item.quantity}</p>
                                                            </div>
                                                            <p className="shrink-0 text-gray-700">{formatPrice(item.price * item.quantity)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <dl className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
                                                    <div className="flex justify-between gap-4">
                                                        <dt>Subtotal</dt>
                                                        <dd>{formatPrice(order.subtotal)}</dd>
                                                    </div>
                                                    <div className="flex justify-between gap-4">
                                                        <dt>Delivery</dt>
                                                        <dd>{formatPrice(order.deliveryFee)}</dd>
                                                    </div>
                                                    <div className="flex justify-between gap-4 font-semibold text-gray-900">
                                                        <dt>Total</dt>
                                                        <dd>{formatPrice(order.total)}</dd>
                                                    </div>
                                                </dl>
                                                <div className="mt-5 border-t border-gray-100 pt-4 text-sm text-gray-600">
                                                    <h3 className="mb-2 font-semibold text-gray-900">Delivery Details</h3>
                                                    <p>{order.customerName}</p>
                                                    <p className="wrap-break-word">{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                                    <p className="mt-2 break-all">{order.customerEmail}</p>
                                                    <p>{order.phone}</p>
                                                </div>
                                            </details>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}

                        {(data.pagination.totalPages > 1 || page > 1) && (
                            <nav aria-label="Order history pagination" className="mt-8 flex items-center justify-between gap-3">
                                <button
                                    type="button"
                                    disabled={page <= 1}
                                    onClick={() => changePage(page - 1)}
                                    className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-500">
                                    Page {page} of {Math.max(page, data.pagination.totalPages)}
                                </span>
                                <button
                                    type="button"
                                    disabled={page >= data.pagination.totalPages}
                                    onClick={() => changePage(page + 1)}
                                    className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </nav>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

export default function MyOrdersPage() {
    const { user } = useAuth();

    return (
        <ProtectedRoute>
            <OrdersContent key={user?.id} />
        </ProtectedRoute>
    );
}
