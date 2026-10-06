import Link from "next/link";

const recentOrders = [
    {
        id: "#1024",
        customer: "Muhammad Hassan",
        items: 3,
        total: "Rs. 45,200",
        status: "Delivered",
        date: "Oct 6, 2026",
    },
    {
        id: "#1023",
        customer: "Ali Ahmed",
        items: 1,
        total: "Rs. 12,500",
        status: "Shipped",
        date: "Oct 6, 2026",
    },
    {
        id: "#1022",
        customer: "Ahmed Khan",
        items: 4,
        total: "Rs. 32,800",
        status: "Pending",
        date: "Oct 5, 2026",
    },
    {
        id: "#1021",
        customer: "Usman Ali",
        items: 2,
        total: "Rs. 18,900",
        status: "Confirmed",
        date: "Oct 5, 2026",
    },
];

function getStatusClass(status: string) {
    switch (status) {
        case "Delivered":
            return "bg-green-50 text-green-700";

        case "Shipped":
            return "bg-blue-50 text-blue-700";

        case "Confirmed":
            return "bg-purple-50 text-purple-700";

        case "Pending":
            return "bg-yellow-50 text-yellow-700";

        case "Cancelled":
            return "bg-red-50 text-red-700";

        default:
            return "bg-gray-100 text-gray-600";
    }
}

export default function RecentOrders() {
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
                        {recentOrders.map((order) => (
                            <tr
                                key={order.id}
                                className="border-b border-gray-50 last:border-b-0"
                            >
                                <td className="px-5 py-4 text-sm font-medium text-gray-900">
                                    {order.id}
                                </td>

                                <td className="px-5 py-4">
                                    <p className="text-sm font-medium text-gray-900">
                                        {order.customer}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        {order.date}
                                    </p>
                                </td>

                                <td className="px-5 py-4 text-sm text-gray-500">
                                    {order.items}
                                </td>

                                <td className="px-5 py-4 text-sm font-medium text-gray-900">
                                    {order.total}
                                </td>

                                <td className="px-5 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                            order.status
                                        )}`}
                                    >
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}