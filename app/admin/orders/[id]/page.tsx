"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-api";

type OrderItem = {
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
};

type OrderDetails = {
    _id: string;
    customerName: string;
    customerEmail: string;
    phone: string;
    shippingAddress: {
        address: string;
        city: string;
        province: string;
        postalCode: string;
    };
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    createdAt: string;
};

type OrderHistory = {
    _id: string;
    status: string;
    note: string;
    changedBy?: {
        name?: string;
        email?: string;
    };
    createdAt: string;
};

function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
        "en-PK",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
        }
    );
}

function formatStatus(status: string) {
    return (
        status.charAt(0).toUpperCase() + status.slice(1)
    );
}

function getStatusClass(status: string) {
    switch (status) {
        case "delivered":
            return "border-green-200 bg-green-50 text-green-700";

        case "shipped":
            return "border-blue-200 bg-blue-50 text-blue-700";

        case "confirmed":
            return "border-indigo-200 bg-indigo-50 text-indigo-700";

        case "pending":
            return "border-amber-200 bg-amber-50 text-amber-700";

        case "cancelled":
            return "border-red-200 bg-red-50 text-red-700";

        default:
            return "border-gray-200 bg-gray-50 text-gray-700";
    }
}

function getPaymentClass(status: string) {
    switch (status) {
        case "paid":
            return "border-green-200 bg-green-50 text-green-700";

        case "failed":
            return "border-red-200 bg-red-50 text-red-700";

        case "pending":
            return "border-amber-200 bg-amber-50 text-amber-700";

        default:
            return "border-gray-200 bg-gray-50 text-gray-700";
    }
}

export default function AdminOrderDetailsPage() {
    const params = useParams();
    const router = useRouter();

    const id = params.id as string;

    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [history, setHistory] = useState<OrderHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updating, setUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
    const [note, setNote] = useState("");

    const loadOrder = async () => {
        try {
            setLoading(true);
            setError("");

            const [ orderResponse, historyResponse ] = await Promise.all([
                adminFetch<{
                    success: boolean;
                    data: OrderDetails;
                }>(
                    `/api/admin/orders/${id}`
                ),

                adminFetch<{
                    success: boolean;
                    data: OrderHistory[];
                }>(
                    `/api/admin/orders/${id}/history`
                ),
            ]);

            setOrder(orderResponse.data);
            setHistory(historyResponse.data);
            setSelectedStatus(orderResponse.data.orderStatus);
            setSelectedPaymentStatus(orderResponse.data.paymentStatus);

        } catch (error: any) {
            setError(
                error?.message ||
                "Failed to load order"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadOrder();
        }
    }, [id]);

    const updateOrder = async () => {
        if (!order) return;

        const statusChanged = selectedStatus !== order.orderStatus;
        const paymentChanged = selectedPaymentStatus !== order.paymentStatus;

        if (!statusChanged && !paymentChanged) {
            return;
        }

        try {
            setUpdating(true);
            setError("");

            await adminFetch(
                `/api/admin/orders/${id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        orderStatus: statusChanged ? selectedStatus : undefined,
                        paymentStatus: paymentChanged ? selectedPaymentStatus : undefined,
                        note,
                    }),
                }
            );

            setNote("");

            await loadOrder();
        } catch (error: any) {
            setError(error?.message || "Failed to update order");
        } finally {
            setUpdating(false);
        }
    };

    const cancelOrder = async () => {
        if (!order) return;

        if (order.orderStatus === "cancelled") {
            return;
        }

        const confirmed = window.confirm("Are you sure you want to cancel this order?");

        if (!confirmed) {
            return;
        }

        try {
            setUpdating(true);
            setError("");

            await adminFetch(
                `/api/admin/orders/${id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        orderStatus: "cancelled",
                        note: "Order cancelled by admin",
                    }),
                }
            );

            await loadOrder();
        } catch (error: any) {
            setError(error?.message || "Failed to cancel order");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <section className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
                <main className="mx-auto max-w-7xl">
                    <p className="text-sm text-gray-500">
                        Loading order...
                    </p>
                </main>
            </section>
        );
    }

    if (error && !order) {
        return (
            <section className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
                <main className="mx-auto max-w-7xl">
                    <Link
                        href="/admin/orders"
                        className="text-sm font-medium text-gray-500 hover:text-black"
                    >
                        ← Back to Orders
                    </Link>

                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
                        <p className="text-sm font-medium text-red-600">
                            {error}
                        </p>
                    </div>
                </main>
            </section>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <section className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
            <main className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <Link
                        href="/admin/orders"
                        className="text-sm font-medium text-gray-500 transition hover:text-black"
                    >
                        ← Back to Orders
                    </Link>

                    <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Order Details
                            </p>

                            <h1 className="mt-1 break-all text-3xl font-bold text-gray-900">
                                #{order._id}
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                Placed on{" "}
                                {formatDate(order.createdAt)}
                            </p>
                        </div>

                        <span
                            className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-sm font-medium ${getStatusClass(
                                order.orderStatus
                            )}`}
                        >
                            {formatStatus(order.orderStatus)}
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-600">
                            {error}
                        </p>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 px-5 py-4">
                                <h2 className="font-semibold text-gray-900">
                                    Order Items
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {order.items.length}{" "}
                                    {order.items.length ===
                                    1
                                        ? "product"
                                        : "products"}
                                </p>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {order.items.map((item, index) => (
                                        <div
                                            key={`${item.productId}-${index}`}
                                            className="flex gap-4 px-5 py-5"
                                        >
                                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-medium text-gray-900">
                                                    {item.name}
                                                </h3>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    Rs.{" "}
                                                    {item.price.toLocaleString()}
                                                    {" x "}
                                                    {item.quantity}
                                                </p>
                                            </div>

                                            <p className="font-semibold text-gray-900">
                                                Rs.{" "}
                                                {( item.price * item.quantity ).toLocaleString()}
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="border-t border-gray-200 px-5 py-5">
                                <div className="ml-auto max-w-sm space-y-3">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>
                                            Subtotal
                                        </span>

                                        <span>
                                            Rs.{" "}
                                            {order.subtotal.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>
                                            Delivery Fee
                                        </span>

                                        <span>
                                            Rs.{" "}
                                            {order.deliveryFee.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-gray-900">
                                        <span>
                                            Total
                                        </span>

                                        <span>
                                            Rs.{" "}
                                            {order.total.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="font-semibold text-gray-900">
                                Order Timeline
                            </h2>

                            <div className="mt-6 space-y-5">
                                <div className="flex gap-4">
                                    <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-black" />

                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            Order placed
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {history.length === 0 ? (
                                    <p className="text-sm text-gray-500">
                                        No status history yet.
                                    </p>
                                ) : (
                                    history.map((item) => (
                                            <div
                                                key={item._id}
                                                className="flex gap-4"
                                            >
                                                <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-black" />

                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {formatStatus(item.status)}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {formatDate(item.createdAt)}
                                                    </p>

                                                    {item.note && (
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {item.note}
                                                        </p>
                                                    )}

                                                    {item.changedBy?.name && (
                                                        <p className="mt-1 text-xs text-gray-400">
                                                            Changed by{" "}
                                                            {item.changedBy.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="font-semibold text-gray-900">
                                Customer
                            </h2>

                            <div className="mt-4 space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Name
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-gray-900">
                                        {order.customerName}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Email
                                    </p>

                                    <p className="mt-1 break-all text-sm text-gray-700">
                                        {order.customerEmail}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Phone
                                    </p>

                                    <p className="mt-1 text-sm text-gray-700">
                                        {order.phone}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="font-semibold text-gray-900">
                                Shipping Address
                            </h2>

                            <div className="mt-4 text-sm leading-6 text-gray-600">
                                <p>
                                    {order.shippingAddress.address}
                                </p>

                                <p>
                                    {order.shippingAddress.city},
                                    {" "}
                                    {order.shippingAddress.province}
                                </p>

                                <p>
                                    {order.shippingAddress.postalCode}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="font-semibold text-gray-900">
                                Payment
                            </h2>

                            <div className="mt-4 space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-gray-500">
                                        Method
                                    </span>

                                    <span className="text-sm font-medium text-gray-900">
                                        {order.paymentMethod}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-gray-500">
                                        Status
                                    </span>

                                    <span
                                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getPaymentClass(
                                            order.paymentStatus
                                        )}`}
                                    >
                                        {formatStatus(order.paymentStatus)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="font-semibold text-gray-900">
                                Order Actions
                            </h2>

                            <div className="mt-4 space-y-4">
                                <div>
                                    <label
                                        htmlFor="order-status"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Order Status
                                    </label>

                                    <select
                                        id="order-status"
                                        value={selectedStatus}
                                        onChange={( event ) => setSelectedStatus(event.target.value)}
                                        disabled={updating}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-black focus:ring-1 focus:ring-black"
                                    >
                                        <option value="pending">
                                            Pending
                                        </option>

                                        <option value="confirmed">
                                            Confirmed
                                        </option>

                                        <option value="shipped">
                                            Shipped
                                        </option>

                                        <option value="delivered">
                                            Delivered
                                        </option>

                                        <option value="cancelled">
                                            Cancelled
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="payment-status"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Payment Status
                                    </label>

                                    <select
                                        id="payment-status"
                                        value={selectedPaymentStatus}
                                        onChange={( event ) => setSelectedPaymentStatus(event.target.value)}
                                        disabled={updating}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-black focus:ring-1 focus:ring-black"
                                    >
                                        <option value="pending">
                                            Pending
                                        </option>

                                        <option value="paid">
                                            Paid
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="order-note"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Note
                                    </label>

                                    <textarea
                                        id="order-note"
                                        value={note}
                                        onChange={( event) => setNote(event.target.value)}
                                        rows={3}
                                        placeholder="Optional note about this change..."
                                        disabled={updating}
                                        className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        updateOrder
                                    }
                                    disabled={
                                        updating ||
                                        (selectedStatus === order.orderStatus &&
                                            selectedPaymentStatus === order.paymentStatus)
                                    }
                                    className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {updating
                                        ? "Updating..."
                                        : "Update Order"}
                                </button>

                                <button
                                    type="button"
                                    onClick={cancelOrder}
                                    disabled={
                                        updating ||
                                        order.orderStatus === "cancelled"
                                    }
                                    className="w-full rounded-lg border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </section>
    );
}