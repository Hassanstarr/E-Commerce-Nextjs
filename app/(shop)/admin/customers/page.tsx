import CustomerTable, {
    AdminCustomer,
} from "@/components/admin/CustomerTable";

const customers: AdminCustomer[] = [
    {
        _id: "CUS-1001",
        name: "Ali Raza",
        email: "ali.raza@example.com",
        phone: "+92 300 1234567",
        ordersCount: 8,
        totalSpent: 52400,
        lastOrder: "2026-10-03T10:30:00",
        status: "Active",
        joinedAt: "2026-05-12T10:30:00",
    },
    {
        _id: "CUS-1002",
        name: "Ahmed Khan",
        email: "ahmed.khan@example.com",
        phone: "+92 301 2345678",
        ordersCount: 5,
        totalSpent: 31800,
        lastOrder: "2026-10-02T14:20:00",
        status: "Active",
        joinedAt: "2026-06-18T12:00:00",
    },
    {
        _id: "CUS-1003",
        name: "Sara Malik",
        email: "sara.malik@example.com",
        phone: "+92 302 3456789",
        ordersCount: 11,
        totalSpent: 89600,
        lastOrder: "2026-10-01T16:45:00",
        status: "Active",
        joinedAt: "2026-04-22T09:15:00",
    },
    {
        _id: "CUS-1004",
        name: "Usman Ali",
        email: "usman.ali@example.com",
        phone: "+92 303 4567890",
        ordersCount: 3,
        totalSpent: 12600,
        lastOrder: "2026-09-28T11:20:00",
        status: "Active",
        joinedAt: "2026-07-04T15:30:00",
    },
    {
        _id: "CUS-1005",
        name: "Hina Ahmed",
        email: "hina.ahmed@example.com",
        phone: "+92 304 5678901",
        ordersCount: 7,
        totalSpent: 45700,
        lastOrder: "2026-09-26T13:10:00",
        status: "Active",
        joinedAt: "2026-05-29T11:00:00",
    },
    {
        _id: "CUS-1006",
        name: "Hamza Shah",
        email: "hamza.shah@example.com",
        phone: "+92 305 6789012",
        ordersCount: 2,
        totalSpent: 9800,
        lastOrder: "2026-09-20T17:30:00",
        status: "Active",
        joinedAt: "2026-08-15T10:45:00",
    },
    {
        _id: "CUS-1007",
        name: "Fatima Noor",
        email: "fatima.noor@example.com",
        phone: "+92 306 7890123",
        ordersCount: 6,
        totalSpent: 37600,
        lastOrder: "2026-09-15T12:40:00",
        status: "Inactive",
        joinedAt: "2026-05-10T14:00:00",
    },
    {
        _id: "CUS-1008",
        name: "Bilal Hassan",
        email: "bilal.hassan@example.com",
        phone: "+92 307 8901234",
        ordersCount: 9,
        totalSpent: 68300,
        lastOrder: "2026-09-30T18:00:00",
        status: "Active",
        joinedAt: "2026-03-19T09:30:00",
    },
    {
        _id: "CUS-1009",
        name: "Ayesha Tariq",
        email: "ayesha.tariq@example.com",
        phone: "+92 308 9012345",
        ordersCount: 1,
        totalSpent: 4200,
        lastOrder: "2026-09-10T10:15:00",
        status: "Inactive",
        joinedAt: "2026-08-28T16:20:00",
    },
    {
        _id: "CUS-1010",
        name: "Zain Abbas",
        email: "zain.abbas@example.com",
        phone: "+92 309 0123456",
        ordersCount: 4,
        totalSpent: 22900,
        lastOrder: "2026-09-29T15:45:00",
        status: "Active",
        joinedAt: "2026-07-11T13:00:00",
    },
];

export default function AdminCustomersPage() {
    const totalCustomers = customers.length;

    const activeCustomers = customers.filter(
        (customer) => customer.status === "Active"
    ).length;

    const inactiveCustomers = customers.filter(
        (customer) => customer.status === "Inactive"
    ).length;

    const totalRevenue = customers.reduce(
        (sum, customer) => sum + customer.totalSpent,
        0
    );

    const averageSpent =
        totalCustomers > 0
            ? Math.round(totalRevenue / totalCustomers)
            : 0;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <p className="mb-2 text-sm font-medium text-gray-500">
                    Admin / Customers
                </p>

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Customers
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage customers and view their purchase history.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Total Customers
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {totalCustomers}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                        Registered customers
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Active Customers
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {activeCustomers}
                    </p>

                    <p className="mt-1 text-xs text-green-600">
                        Currently active
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Inactive Customers
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {inactiveCustomers}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                        No recent activity
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Average Customer Spend
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        Rs. {averageSpent.toLocaleString()}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                        Based on customer orders
                    </p>
                </div>
            </div>

            <CustomerTable customers={customers} />
        </div>
    );
}