import Link from "next/link";

interface RecentOrder {
    _id: string;
    customerName: string;
    items: {
        quantity: number;
    }[];
    total: number;
    orderStatus: string;
    createdAt: string;
}

interface RecentOrdersProps {
    orders: RecentOrder[];
}

function getStatusClass(status: string) {
    switch (status) {
        case "delivered":
            return "bg-green-50 text-green-700";

        case "shipped":
            return "bg-blue-50 text-blue-700";

        case "confirmed":
            return "bg-purple-50 text-purple-700";

        case "pending":
            return "bg-yellow-50 text-yellow-700";

        case "cancelled":
            return "bg-red-50 text-red-700";

        default:
            return "bg-gray-100 text-gray-600";
    }
}

function formatStatus(status: string) {
    return (
        status.charAt(0).toUpperCase() +
        status.slice(1)
    );
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                    <h2 className="font-semibold text-gray-900">
                        Recent Orders
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Latest orders from your store.
                    </p>
                </div>

                <Link
                    href="/admin/orders"
                    className="text-sm font-medium text-gray-700 hover:text-black"
                >
                    View all
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-162.5">
                    <thead>
                        <tr className="border-b border-gray-100 text-left">
                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Order
                            </th>

                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Customer
                            </th>

                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Items
                            </th>

                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Total
                            </th>

                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Status
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-5 py-8 text-center text-sm text-gray-500"
                                >
                                    No orders found.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => {
                                const itemCount =
                                    order.items.reduce(
                                        (
                                            total,
                                            item
                                        ) =>
                                            total +
                                            item.quantity,
                                        0
                                    );

                                return (
                                    <tr
                                        key={order._id}
                                        className="border-b border-gray-50 last:border-b-0"
                                    >
                                        <td className="px-5 py-4 text-sm font-medium text-gray-900">
                                            #{order._id.slice(-6)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="text-sm font-medium text-gray-900">
                                                {order.customerName}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-400">
                                                {new Date(
                                                    order.createdAt
                                                ).toLocaleDateString()}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-500">
                                            {itemCount}
                                        </td>

                                        <td className="px-5 py-4 text-sm font-medium text-gray-900">
                                            Rs.{" "}
                                            {order.total.toLocaleString()}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                                    order.orderStatus
                                                )}`}
                                            >
                                                {formatStatus(
                                                    order.orderStatus
                                                )}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}