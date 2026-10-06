import {
    HiOutlineArrowTrendingUp,
    HiOutlineCube,
    HiOutlineShoppingCart,
    HiOutlineUsers,
} from "react-icons/hi2";
import RevenueChart from "@/components/admin/RevenueChart";
import RecentOrders from "@/components/admin/RecentOrders";
import TopProducts from "@/components/admin/TopProducts";
import LowStockProducts from "@/components/admin/LowStockProducts";


const stats = [
    {
        title: "Total Revenue",
        value: "Rs. 1,245,500",
        change: "+12.5%",
        description: "from last month",
        icon: HiOutlineArrowTrendingUp,
    },
    {
        title: "Total Orders",
        value: "248",
        change: "+8.2%",
        description: "from last month",
        icon: HiOutlineShoppingCart,
    },
    {
        title: "Products Sold",
        value: "1,284",
        change: "+15.4%",
        description: "from last month",
        icon: HiOutlineCube,
    },
    {
        title: "Customers",
        value: "482",
        change: "+6.8%",
        description: "from last month",
        icon: HiOutlineUsers,
    },
];

export default function AdminPage() {
    return (
        <section className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                <div className="mb-8">
                    <p className="text-sm font-medium text-gray-500">
                        Overview
                    </p>

                    <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                        Dashboard
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Monitor your store performance and manage your
                        ecommerce operations.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;

                        return (
                            <div
                                key={stat.title}
                                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            {stat.title}
                                        </p>

                                        <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                                            {stat.value}
                                        </p>
                                    </div>

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                                        <Icon className="h-5 w-5 text-gray-700" />
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-2 text-sm">
                                    <span className="font-medium text-green-600">
                                        {stat.change}
                                    </span>

                                    <span className="text-gray-400">
                                        {stat.description}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-3">

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="font-semibold text-gray-900">
                                    Revenue Overview
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Track your store revenue over time.
                                </p>
                            </div>

                            <select
                                defaultValue="30"
                                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 outline-none"
                            >
                                <option value="7">
                                    Last 7 days
                                </option>

                                <option value="30">
                                    Last 30 days
                                </option>

                                <option value="90">
                                    Last 3 months
                                </option>
                            </select>
                        </div>

                        <RevenueChart />
                    </div>
                    

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div>
                            <h2 className="font-semibold text-gray-900">
                                Order Summary
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Current order status.
                            </p>
                        </div>

                        <div className="mt-6 space-y-4">

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Pending
                                </span>

                                <span className="font-semibold text-gray-900">
                                    24
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Confirmed
                                </span>

                                <span className="font-semibold text-gray-900">
                                    18
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Shipped
                                </span>

                                <span className="font-semibold text-gray-900">
                                    31
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Delivered
                                </span>

                                <span className="font-semibold text-gray-900">
                                    162
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Cancelled
                                </span>

                                <span className="font-semibold text-gray-900">
                                    13
                                </span>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <RecentOrders />
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <TopProducts />
                    <LowStockProducts />
                </div>

            </div>
        </section>
    );
}