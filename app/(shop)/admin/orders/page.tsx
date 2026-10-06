import OrderTable, {
    type AdminOrder,
} from "@/components/admin/OrderTable";

const mockOrders: AdminOrder[] = [
    {
        _id: "ORD-1001",
        customerName: "Ali Raza",
        customerEmail: "ali@example.com",
        total: 12500,
        paymentMethod: "COD",
        paymentStatus: "Pending",
        orderStatus: "Pending",
        itemsCount: 2,
        createdAt: "2026-10-05T10:30:00",
    },
    {
        _id: "ORD-1002",
        customerName: "Ahmed Khan",
        customerEmail: "ahmed@example.com",
        total: 8400,
        paymentMethod: "Card",
        paymentStatus: "Paid",
        orderStatus: "Confirmed",
        itemsCount: 1,
        createdAt: "2026-10-04T15:20:00",
    },
    {
        _id: "ORD-1003",
        customerName: "Sara Malik",
        customerEmail: "sara@example.com",
        total: 21900,
        paymentMethod: "Card",
        paymentStatus: "Paid",
        orderStatus: "Shipped",
        itemsCount: 3,
        createdAt: "2026-10-03T11:45:00",
    },
    {
        _id: "ORD-1004",
        customerName: "Usman Ali",
        customerEmail: "usman@example.com",
        total: 5600,
        paymentMethod: "COD",
        paymentStatus: "Paid",
        orderStatus: "Delivered",
        itemsCount: 2,
        createdAt: "2026-10-02T09:15:00",
    },
    {
        _id: "ORD-1005",
        customerName: "Hina Ahmed",
        customerEmail: "hina@example.com",
        total: 15700,
        paymentMethod: "Card",
        paymentStatus: "Paid",
        orderStatus: "Delivered",
        itemsCount: 4,
        createdAt: "2026-10-01T14:10:00",
    },
    {
        _id: "ORD-1006",
        customerName: "Hamza Shah",
        customerEmail: "hamza@example.com",
        total: 7200,
        paymentMethod: "COD",
        paymentStatus: "Pending",
        orderStatus: "Confirmed",
        itemsCount: 1,
        createdAt: "2026-09-30T16:40:00",
    },
    {
        _id: "ORD-1007",
        customerName: "Fatima Noor",
        customerEmail: "fatima@example.com",
        total: 9300,
        paymentMethod: "Card",
        paymentStatus: "Paid",
        orderStatus: "Cancelled",
        itemsCount: 2,
        createdAt: "2026-09-29T12:25:00",
    },
    {
        _id: "ORD-1008",
        customerName: "Bilal Hassan",
        customerEmail: "bilal@example.com",
        total: 18200,
        paymentMethod: "COD",
        paymentStatus: "Pending",
        orderStatus: "Shipped",
        itemsCount: 3,
        createdAt: "2026-09-28T10:05:00",
    },
];

export default function AdminOrdersPage() {
    const totalOrders = mockOrders.length;

    const pendingOrders = mockOrders.filter(
        (order) => order.orderStatus === "Pending"
    ).length;

    const activeOrders = mockOrders.filter(
        (order) =>
            order.orderStatus === "Confirmed" ||
            order.orderStatus === "Shipped"
    ).length;

    const deliveredOrders = mockOrders.filter(
        (order) => order.orderStatus === "Delivered"
    ).length;

    const cancelledOrders = mockOrders.filter(
        (order) => order.orderStatus === "Cancelled"
    ).length;

    return (
        <section className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
            <main className="mx-auto max-w-7xl">

                <div className="mb-8">
                    <p className="mb-2 text-sm font-medium text-gray-500">
                        Store Management
                    </p>

                    <h1 className="text-3xl font-bold text-gray-900">
                        Orders
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-gray-500">
                        View and manage customer orders, payments and
                        delivery status.
                    </p>
                </div>
                

                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Orders
                        </p>

                        <p className="mt-2 text-2xl font-bold text-gray-900">
                            {totalOrders}
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Pending
                        </p>

                        <p className="mt-2 text-2xl font-bold text-amber-600">
                            {pendingOrders}
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Active
                        </p>

                        <p className="mt-2 text-2xl font-bold text-blue-600">
                            {activeOrders}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            Confirmed + shipped
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Delivered
                        </p>

                        <p className="mt-2 text-2xl font-bold text-green-600">
                            {deliveredOrders}
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Cancelled
                        </p>

                        <p className="mt-2 text-2xl font-bold text-red-600">
                            {cancelledOrders}
                        </p>
                    </div>
                </div>

                <OrderTable orders={mockOrders} />
            </main>
        </section>
    );
}