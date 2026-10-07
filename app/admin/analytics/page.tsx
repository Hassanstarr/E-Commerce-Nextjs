import AnalyticsCharts from "@/components/admin/AnalyticsCharts";

export default function AdminAnalyticsPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8 mx-auto max-w-7xl">
            <div className="mb-8">
                <p className="mb-2 text-sm font-medium text-gray-500">
                    Admin / Analytics
                </p>

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Analytics
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Analyze sales, orders, customers and product
                            performance.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <select className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-black focus:ring-1 focus:ring-black">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>Last 3 Months</option>
                            <option>Last 6 Months</option>
                            <option>This Year</option>
                        </select>

                        <button
                            type="button"
                            className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                            Export Report
                        </button>
                    </div>
                </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Total Revenue
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        Rs. 778,000
                    </p>

                    <p className="mt-1 text-xs text-green-600">
                        +18.4% compared to previous period
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Total Orders
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        412
                    </p>

                    <p className="mt-1 text-xs text-green-600">
                        +12.8% compared to previous period
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Products Sold
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        687
                    </p>

                    <p className="mt-1 text-xs text-green-600">
                        +15.2% compared to previous period
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Average Order Value
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        Rs. 8,420
                    </p>

                    <p className="mt-1 text-xs text-green-600">
                        +4.7% compared to previous period
                    </p>
                </div>
            </div>

            <AnalyticsCharts />
        </div>
    );
}