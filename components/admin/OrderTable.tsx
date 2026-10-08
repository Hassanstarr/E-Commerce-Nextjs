"use client";

import Link from "next/link";

export type AdminOrder = {
    _id: string;
    customerName: string;
    customerEmail: string;
    total: number;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    items: {
        quantity: number;
    }[];
    createdAt: string;
};

type OrderTableProps = {
    orders: AdminOrder[];
    loading: boolean;
    total: number;
    page: number;
    totalPages: number;
    search: string;
    statusFilter: string;
    paymentFilter: string;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onPaymentChange: (value: string) => void;
    onPageChange: (page: number) => void;
};

function formatStatus( status: string ) {
    return (
        status.charAt(0).toUpperCase() +
        status.slice(1)
    );
}

function getOrderStatusClass( status: string ) {
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

function getPaymentStatusClass( status: string ) {
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

function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
        "en-PK",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    );
}

export default function OrderTable({
    orders,
    loading,
    total,
    page,
    totalPages,
    search,
    statusFilter,
    paymentFilter,
    onSearchChange,
    onStatusChange,
    onPaymentChange,
    onPageChange,
}: OrderTableProps) {
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
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder="Search by order ID, customer name or email..."
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                        />
                    </div>

                    <select
                        value={statusFilter || "all"}
                        onChange={(event) => onStatusChange(event.target.value === "all" ? "" : event.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    >
                        <option value="all">
                            All Order Status
                        </option>

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

                    <select
                        value={paymentFilter || "all"}
                        onChange={(event) => onPaymentChange(event.target.value === "all" ? "" : event.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    >
                        <option value="all">
                            All Payments
                        </option>

                        <option value="paid">
                            Paid
                        </option>

                        <option value="pending">
                            Pending
                        </option>
                    </select>
                </div>
            </div>

            <div className="mb-3">
                <p className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-medium text-gray-900">
                        {orders.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-gray-900">
                        {total}
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
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-6 py-16 text-center"
                                >
                                    <p className="text-sm text-gray-500">
                                        Loading orders...
                                    </p>
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-6 py-16 text-center"
                                >
                                    <p className="font-medium text-gray-900">
                                        No orders found
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Try changing your search or filters.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => {
                                    const itemsCount = order.items.reduce((total, item) =>
                                        total + item.quantity,
                                        0
                                    );

                                    return (
                                        <tr
                                            key={order._id}
                                            className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-gray-900">
                                                    #{order._id.slice(-6)}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-400">
                                                    {itemsCount}{" "}
                                                    {itemsCount === 1 ? "item" : "items"}
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
                                                    {formatStatus(order.paymentStatus)}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getOrderStatusClass(
                                                        order.orderStatus
                                                    )}`}
                                                >
                                                    {formatStatus(order.orderStatus)}
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
                                    );
                                }
                            )
                        )}
                    </tbody>
                </table>
            </div>

            {!loading && totalPages > 1 && (
                    <div className="mt-5 flex items-center justify-between gap-4">
                        <p className="text-sm text-gray-500">
                            Page {page} of{" "}
                            {totalPages}
                        </p>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={page === 1}
                                onClick={() => onPageChange(page - 1)}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Previous
                            </button>

                            <button
                                type="button"
                                disabled={page === totalPages}
                                onClick={() => onPageChange(page + 1)}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
        </div>
    );
}