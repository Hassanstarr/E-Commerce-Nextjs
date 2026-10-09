"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { adminFetch } from "@/lib/admin-api";

type Customer = {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
};

type CustomerOrder = {
    _id: string;
    createdAt: string;
    total: number;
    phone?: string;
    orderStatus:
        | "pending"
        | "confirmed"
        | "shipped"
        | "delivered"
        | "cancelled";
    paymentStatus: "pending" | "paid";
};

type CustomerDetailsResponse = {
    success: boolean;
    data: {
        customer: Customer;
        statistics: {
            totalOrders: number;
            totalSpent: number;
        };
        orders: CustomerOrder[];
    };
};

export default function CustomerDetailsPage() {
    const params = useParams<{ id: string }>();
    const id = params.id;

    const [customer, setCustomer] = useState<Customer | null>(null);

    const [statistics, setStatistics] = useState({
        totalOrders: 0,
        totalSpent: 0,
    });

    const [orders, setOrders] = useState<CustomerOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        let cancelled = false;

        const loadCustomer = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await adminFetch<CustomerDetailsResponse>(
                        `/api/admin/customers/${id}`
                    );

                if (cancelled) return;

                setCustomer(response.data.customer);
                setStatistics(response.data.statistics);
                setOrders(response.data.orders);

            } catch (error: unknown) {
                if (cancelled) return;

                console.error("Failed to load customer:", error);

                setError(error instanceof Error
                        ? error.message
                        : "Failed to load customer"
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadCustomer();

        return () => {
            cancelled = true;
        };
    }, [id]);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString(
            "en-PK",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );
    };

    const formatCurrency = (amount: number) => {
        return `Rs. ${amount.toLocaleString("en-PK")}`;
    };

    const latestOrder = orders[0] ?? null;
    const phone = latestOrder?.phone || "";

    const isActive = latestOrder
                    ? Date.now() - new Date(latestOrder.createdAt).getTime() <= 30 * 24 * 60 * 60 * 1000
                    : false;

    const customerStatus = isActive ? "Active" : "Inactive";

    const averageOrder = statistics.totalOrders > 0
                        ? Math.round(statistics.totalSpent / statistics.totalOrders)
                        : 0;

    const getStatusClass = (status: string) => {
        switch (status) {
            case "delivered":
                return "bg-green-100 text-green-700";
            case "cancelled":
                return "bg-red-100 text-red-700";
            case "shipped":
                return "bg-blue-100 text-blue-700";
            case "confirmed":
                return "bg-purple-100 text-purple-700";
            case "pending":
                return "bg-yellow-100 text-yellow-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
                <div className="flex min-h-100 items-center justify-center">
                    <p className="text-sm text-gray-500">
                        Loading customer...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
                <Link
                    href="/admin/customers"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                    ← Back to Customers
                </Link>

                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6">
                    <p className="text-sm text-red-600">
                        {error || "Customer not found"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
                <Link
                    href="/admin/customers"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                    ← Back to Customers
                </Link>
            </div>

            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl font-semibold text-gray-700">
                            {customer.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">
                                {customer.name}
                            </h1>

                            <p className="text-sm text-gray-500">
                                {customer.email}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                Customer ID: {customer._id}
                            </p>
                        </div>
                    </div>

                    <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                            isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        {customerStatus}
                    </span>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-500">
                        Total Orders
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        {statistics.totalOrders}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-500">
                        Total Spent
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        {formatCurrency(statistics.totalSpent)}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-500">
                        Average Order
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        {formatCurrency(averageOrder)}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-500">
                        Joined
                    </p>
                    <p className="mt-2 text-lg font-semibold text-gray-900">
                        {formatDate(customer.createdAt)}
                    </p>
                </div>
            </div>

            <div className="mb-6 rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-5 py-4">
                    <h2 className="font-semibold text-gray-900">
                        Customer Information
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Name
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                            {customer.name}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Email
                        </p>
                        <p className="mt-1 break-all text-sm text-gray-900">
                            {customer.email}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Phone
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                            {phone || "Not provided"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Last Order
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                            {latestOrder
                                ? formatDate(latestOrder.createdAt)
                                : "No orders yet"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-5 py-4">
                    <h2 className="font-semibold text-gray-900">
                        Purchase History
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        {orders.length} order(s), newest first
                    </p>
                </div>

                {orders.length === 0 ? (
                    <div className="p-6 text-center">
                        <p className="text-sm text-gray-500">
                            This customer has no orders yet.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-175">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    <th className="px-5 py-3">
                                        Order
                                    </th>
                                    <th className="px-5 py-3">
                                        Date
                                    </th>
                                    <th className="px-5 py-3">
                                        Total
                                    </th>
                                    <th className="px-5 py-3">
                                        Payment
                                    </th>
                                    <th className="px-5 py-3">
                                        Status
                                    </th>
                                    <th className="px-5 py-3 text-right">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders.map((order) => (
                                    <tr
                                        key={order._id}
                                        className="border-b border-gray-100 last:border-0"
                                    >
                                        <td className="px-5 py-4">
                                            <Link
                                                href={`/admin/orders/${order._id}`}
                                                className="text-sm font-medium text-gray-900 hover:text-blue-600"
                                            >
                                                {order._id}
                                            </Link>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {formatDate(order.createdAt)}
                                        </td>

                                        <td className="px-5 py-4 text-sm font-medium text-gray-900">
                                            {formatCurrency(order.total)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    order.paymentStatus === "paid"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                }`}
                                            >
                                                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                                    order.orderStatus
                                                )}`}
                                            >
                                                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-right">
                                            <Link
                                                href={`/admin/orders/${order._id}`}
                                                className="text-sm font-medium text-gray-700 hover:text-gray-900"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}