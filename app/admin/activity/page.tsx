import ActivityTable, { AdminActivity } from "@/components/admin/ActivityTable";

const activities: AdminActivity[] = [
    {
        _id: "ACT-1001",
        type: "Order",
        action: "New order created",
        description:
            "A new COD order was placed by Ali Raza for Rs. 12,500.",
        performedBy: "Ali Raza",
        reference: "ORD-1001",
        createdAt: "2026-10-06T21:45:00",
    },
    {
        _id: "ACT-1002",
        type: "Order",
        action: "Order status updated",
        description:
            "Order status was changed from Confirmed to Shipped.",
        performedBy: "Admin",
        reference: "ORD-1003",
        createdAt: "2026-10-06T20:30:00",
    },
    {
        _id: "ACT-1003",
        type: "Product",
        action: "Product added",
        description:
            "A new Wireless Mechanical Keyboard product was added.",
        performedBy: "Admin",
        reference: "PROD-1024",
        createdAt: "2026-10-06T19:20:00",
    },
    {
        _id: "ACT-1004",
        type: "Stock",
        action: "Stock updated",
        description:
            "Stock quantity was updated from 12 to 28 units.",
        performedBy: "Admin",
        reference: "PROD-1018",
        createdAt: "2026-10-06T18:15:00",
    },
    {
        _id: "ACT-1005",
        type: "Customer",
        action: "New customer registered",
        description:
            "A new customer account was successfully created.",
        performedBy: "Ayesha Tariq",
        reference: "CUS-1009",
        createdAt: "2026-10-06T17:40:00",
    },
    {
        _id: "ACT-1006",
        type: "Category",
        action: "Category created",
        description:
            "A new product category named Smart Home was created.",
        performedBy: "Admin",
        reference: "CAT-1012",
        createdAt: "2026-10-06T16:25:00",
    },
    {
        _id: "ACT-1007",
        type: "Product",
        action: "Product updated",
        description:
            "Product price and description were updated.",
        performedBy: "Admin",
        reference: "PROD-1007",
        createdAt: "2026-10-06T15:50:00",
    },
    {
        _id: "ACT-1008",
        type: "Order",
        action: "Order cancelled",
        description:
            "Order was cancelled after customer cancellation request.",
        performedBy: "Admin",
        reference: "ORD-1007",
        createdAt: "2026-10-06T14:30:00",
    },
    {
        _id: "ACT-1009",
        type: "Customer",
        action: "Customer registered",
        description:
            "A new customer account was successfully created.",
        performedBy: "Zain Abbas",
        reference: "CUS-1010",
        createdAt: "2026-10-05T21:10:00",
    },
    {
        _id: "ACT-1010",
        type: "Stock",
        action: "Low stock detected",
        description:
            "Wireless Headphones stock dropped below the configured threshold.",
        performedBy: "System",
        reference: "PROD-1002",
        createdAt: "2026-10-05T19:45:00",
    },
    {
        _id: "ACT-1011",
        type: "Product",
        action: "Product deleted",
        description:
            "An outdated product was removed from the store.",
        performedBy: "Admin",
        reference: "PROD-0991",
        createdAt: "2026-10-05T17:20:00",
    },
    {
        _id: "ACT-1012",
        type: "System",
        action: "Admin login",
        description:
            "An administrator successfully logged into the admin panel.",
        performedBy: "Admin",
        reference: "SESSION-8821",
        createdAt: "2026-10-05T16:05:00",
    },
];

export default function AdminActivityPage() {
    const totalActivities = activities.length;

    const orderActivities = activities.filter(
        (activity) => activity.type === "Order"
    ).length;

    const productActivities = activities.filter(
        (activity) => activity.type === "Product"
    ).length;

    const customerActivities = activities.filter(
        (activity) => activity.type === "Customer"
    ).length;

    return (
        <div className="p-4 sm:p-6 lg:p-8 mx-auto max-w-7xl">
            <div className="mb-8">
                <p className="mb-2 text-sm font-medium text-gray-500">
                    Admin / Activity
                </p>

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Activity
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Track important actions and changes across the
                        admin panel.
                    </p>
                </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Total Activities
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {totalActivities}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                        Recent recorded events
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Order Activities
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {orderActivities}
                    </p>

                    <p className="mt-1 text-xs text-blue-600">
                        Order-related events
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Product Activities
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {productActivities}
                    </p>

                    <p className="mt-1 text-xs text-purple-600">
                        Product-related events
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Customer Activities
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {customerActivities}
                    </p>

                    <p className="mt-1 text-xs text-green-600">
                        Customer-related events
                    </p>
                </div>
            </div>

            <ActivityTable activities={activities} />
        </div>
    );
}