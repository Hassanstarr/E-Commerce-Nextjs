"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type AdminOrder = {
    _id: string;
    customerName: string;
    customerEmail: string;
    total: number;
    paymentMethod: "COD" | "Card";
    paymentStatus: "Pending" | "Paid" | "Failed";
    orderStatus:
        | "Pending"
        | "Confirmed"
        | "Shipped"
        | "Delivered"
        | "Cancelled";
    itemsCount: number;
    createdAt: string;
};

type OrderTableProps = {
    orders: AdminOrder[];
};

export default function OrderTable({ orders }: OrderTableProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [paymentFilter, setPaymentFilter] = useState("all");

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const searchValue = search.toLowerCase();

            const matchesSearch =
                order._id.toLowerCase().includes(searchValue) ||
                order.customerName
                    .toLowerCase()
                    .includes(searchValue) ||
                order.customerEmail
                    .toLowerCase()
                    .includes(searchValue);

            const matchesStatus =
                statusFilter === "all" ||
                order.orderStatus === statusFilter;

            const matchesPayment =
                paymentFilter === "all" ||
                order.paymentStatus === paymentFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPayment
            );
        });
    }, [orders, search, statusFilter, paymentFilter]);

    const getOrderStatusClass = ( status: AdminOrder["orderStatus"] ) => {
        switch (status) {
            case "Delivered":
                return "border-green-200 bg-green-50 text-green-700";

            case "Shipped":
                return "border-blue-200 bg-blue-50 text-blue-700";

            case "Confirmed":
                return "border-indigo-200 bg-indigo-50 text-indigo-700";

            case "Pending":
                return "border-amber-200 bg-amber-50 text-amber-700";

            case "Cancelled":
                return "border-red-200 bg-red-50 text-red-700";

            default:
                return "border-gray-200 bg-gray-50 text-gray-700";
        }
    };

    const getPaymentStatusClass = ( status: AdminOrder["paymentStatus"] ) => {
        switch (status) {
            case "Paid":
                return "border-green-200 bg-green-50 text-green-700";

            case "Failed":
                return "border-red-200 bg-red-50 text-red-700";

            case "Pending":
                return "border-amber-200 bg-amber-50 text-amber-700";

            default:
                return "border-gray-200 bg-gray-50 text-gray-700";
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-PK", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div>
            
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row">
                    <div className="flex-1">
                        <label
                            htmlFor="order-search"
                            className="sr-only"
                        >
                            Search orders
                        </label>

                        <input
                            id="order-search"
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search by order ID, customer name or email..."
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                        className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    >
                        <option value="all">
                            All Order Status
                        </option>

                        <option value="Pending">
                            Pending
                        </option>

                        <option value="Confirmed">
                            Confirmed
                        </option>

                        <option value="Shipped">
                            Shipped
                        </option>

                        <option value="Delivered">
                            Delivered
                        </option>

                        <option value="Cancelled">
                            Cancelled
                        </option>
                    </select>

                    <select
                        value={paymentFilter}
                        onChange={(event) =>
                            setPaymentFilter(event.target.value)
                        }
                        className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    >
                        <option value="all">
                            All Payments
                        </option>

                        <option value="Paid">
                            Paid
                        </option>

                        <option value="Pending">
                            Pending
                        </option>

                        <option value="Failed">
                            Failed
                        </option>
                    </select>
                </div>
            </div>


            <div className="mb-3">
                <p className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-medium text-gray-900">
                        {filteredOrders.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-gray-900">
                        {orders.length}
                    </span>{" "}
                    orders
                </p>
            </div>


            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full min-w-250 text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Order
                            </th>

                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Customer
                            </th>

                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Total
                            </th>

                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Payment
                            </th>

                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Status
                            </th>

                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Date
                            </th>

                            <th className="px-5 py-4 text-right font-semibold text-gray-700">
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredOrders.map((order) => (
                            <tr
                                key={order._id}
                                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                            >
                                <td className="px-5 py-4">
                                    <p className="font-medium text-gray-900">
                                        #{order._id}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        {order.itemsCount}{" "}
                                        {order.itemsCount === 1
                                            ? "item"
                                            : "items"}
                                    </p>
                                </td>

                                <td className="px-5 py-4">
                                    <p className="font-medium text-gray-900">
                                        {order.customerName}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {order.customerEmail}
                                    </p>
                                </td>

                                <td className="px-5 py-4 font-semibold text-gray-900">
                                    Rs.{" "}
                                    {order.total.toLocaleString()}
                                </td>

                                <td className="px-5 py-4">
                                    <p className="font-medium text-gray-700">
                                        {order.paymentMethod}
                                    </p>

                                    <span
                                        className={`mt-1 inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getPaymentStatusClass(
                                            order.paymentStatus
                                        )}`}
                                    >
                                        {order.paymentStatus}
                                    </span>
                                </td>

                                <td className="px-5 py-4">
                                    <span
                                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getOrderStatusClass(
                                            order.orderStatus
                                        )}`}
                                    >
                                        {order.orderStatus}
                                    </span>
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                                    {formatDate(order.createdAt)}
                                </td>

                                <td className="px-5 py-4 text-right">
                                    <Link
                                        href={`/admin/orders/${order._id}`}
                                        className="text-sm font-medium text-gray-600 transition hover:text-black"
                                    >
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredOrders.length === 0 && (
                    <div className="px-6 py-16 text-center">
                        <p className="font-medium text-gray-900">
                            No orders found
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Try changing your search or filters.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}