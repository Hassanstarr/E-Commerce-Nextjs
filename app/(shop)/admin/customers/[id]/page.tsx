import Link from "next/link";

type CustomerDetails = {
    _id: string;
    name: string;
    email: string;
    phone: string;
    status: "Active" | "Inactive";
    joinedAt: string;
    totalSpent: number;
    ordersCount: number;
    address: string;
};

const customer: CustomerDetails = {
    _id: "CUS-1001",
    name: "Ali Raza",
    email: "ali.raza@example.com",
    phone: "+92 300 1234567",
    status: "Active",
    joinedAt: "2026-05-12T10:30:00",
    totalSpent: 52400,
    ordersCount: 8,
    address: "Johar Town, Lahore, Punjab, Pakistan",
};

const orders = [
    {
        id: "ORD-1001",
        date: "2026-10-03T10:30:00",
        total: 12500,
        status: "Pending",
    },
    {
        id: "ORD-0987",
        date: "2026-09-18T14:20:00",
        total: 8400,
        status: "Delivered",
    },
    {
        id: "ORD-0942",
        date: "2026-08-27T12:10:00",
        total: 21900,
        status: "Delivered",
    },
    {
        id: "ORD-0881",
        date: "2026-07-15T16:30:00",
        total: 5600,
        status: "Delivered",
    },
];

export default function CustomerDetailsPage() {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-PK", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case "Delivered":
                return "border-green-200 bg-green-50 text-green-700";
            case "Pending":
                return "border-amber-200 bg-amber-50 text-amber-700";
            case "Cancelled":
                return "border-red-200 bg-red-50 text-red-700";
            default:
                return "border-gray-200 bg-gray-50 text-gray-700";
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
                <Link
                    href="/admin/customers"
                    className="text-sm font-medium text-gray-500 transition hover:text-black"
                >
                    ← Back to Customers
                </Link>
            </div>

            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-700">
                        {customer.name.charAt(0)}
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {customer.name}
                            </h1>

                            <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                                {customer.status}
                            </span>
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                            Customer ID: #{customer._id}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Total Orders
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {customer.ordersCount}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Total Spent
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        Rs. {customer.totalSpent.toLocaleString()}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Average Order
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        Rs.{" "}
                        {Math.round(
                            customer.totalSpent / customer.ordersCount
                        ).toLocaleString()}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Joined
                    </p>

                    <p className="mt-2 text-lg font-bold text-gray-900">
                        {formatDate(customer.joinedAt)}
                    </p>
                </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-lg font-semibold text-gray-900">
                        Customer Information
                    </h2>

                    <div className="space-y-4">
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
                                {customer.phone}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Address
                            </p>

                            <p className="mt-1 text-sm leading-6 text-gray-900">
                                {customer.address}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-lg font-semibold text-gray-900">
                        Purchase History
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-150 text-left text-sm">
                            <thead className="border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-3 font-semibold text-gray-700">
                                        Order
                                    </th>

                                    <th className="px-3 py-3 font-semibold text-gray-700">
                                        Date
                                    </th>

                                    <th className="px-3 py-3 font-semibold text-gray-700">
                                        Total
                                    </th>

                                    <th className="px-3 py-3 font-semibold text-gray-700">
                                        Status
                                    </th>

                                    <th className="px-3 py-3 text-right font-semibold text-gray-700">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="border-b border-gray-100 last:border-0"
                                    >
                                        <td className="px-3 py-4 font-medium text-gray-900">
                                            #{order.id}
                                        </td>

                                        <td className="whitespace-nowrap px-3 py-4 text-gray-600">
                                            {formatDate(order.date)}
                                        </td>

                                        <td className="whitespace-nowrap px-3 py-4 font-medium text-gray-900">
                                            Rs. {order.total.toLocaleString()}
                                        </td>

                                        <td className="px-3 py-4">
                                            <span
                                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(order.status)}`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>

                                        <td className="px-3 py-4 text-right">
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="text-sm font-medium text-gray-600 hover:text-black"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">
                    Customer Notes
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                    Customer notes and activity will be connected to the
                    backend later.
                </p>
            </div> */}
        </div>
    );
}