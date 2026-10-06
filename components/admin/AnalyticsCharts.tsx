"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const revenueData = [
    { month: "May", revenue: 82000 },
    { month: "Jun", revenue: 105000 },
    { month: "Jul", revenue: 97000 },
    { month: "Aug", revenue: 138000 },
    { month: "Sep", revenue: 164000 },
    { month: "Oct", revenue: 192000 },
];

const orderData = [
    { month: "May", orders: 42 },
    { month: "Jun", orders: 56 },
    { month: "Jul", orders: 51 },
    { month: "Aug", orders: 73 },
    { month: "Sep", orders: 86 },
    { month: "Oct", orders: 104 },
];

const categoryData = [
    { name: "Electronics", sales: 186000 },
    { name: "Clothing", sales: 124000 },
    { name: "Accessories", sales: 86000 },
    { name: "Home", sales: 72000 },
    { name: "Shoes", sales: 58000 },
];

const topProducts = [
    { name: "Wireless Headphones", sales: 42800 },
    { name: "Smart Watch", sales: 36500 },
    { name: "Running Shoes", sales: 31200 },
    { name: "Laptop Backpack", sales: 24800 },
    { name: "Mechanical Keyboard", sales: 21900 },
];

const paymentData = [
    { name: "COD", value: 58 },
    { name: "Card", value: 42 },
];

const paymentColors = ["#111827", "#9CA3AF"];

const formatCurrency = (value: number) => {
    return `Rs. ${value.toLocaleString()}`;
};

export default function AnalyticsCharts() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Revenue Overview
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Revenue generated over the selected period.
                        </p>
                    </div>

                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                />

                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) =>
                                        `${value / 1000}k`
                                    }
                                />

                                <Tooltip
                                    formatter={(value) =>
                                        formatCurrency(Number(value))
                                    }
                                />

                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#111827"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Orders Overview
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Number of orders received each month.
                        </p>
                    </div>

                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={orderData}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                />

                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                />

                                <Tooltip />

                                <Bar
                                    dataKey="orders"
                                    fill="#111827"
                                    radius={[5, 5, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Sales by Category
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Revenue generated by product category.
                        </p>
                    </div>

                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={categoryData}
                                layout="vertical"
                                margin={{
                                    left: 20,
                                    right: 20,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    horizontal={false}
                                />

                                <XAxis
                                    type="number"
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) =>
                                        `${value / 1000}k`
                                    }
                                />

                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    width={90}
                                />

                                <Tooltip
                                    formatter={(value) =>
                                        formatCurrency(Number(value))
                                    }
                                />

                                <Bar
                                    dataKey="sales"
                                    fill="#111827"
                                    radius={[0, 5, 5, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Top Products
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Best performing products by revenue.
                        </p>
                    </div>

                    <div className="space-y-5">
                        {topProducts.map((product, index) => (
                            <div key={product.name}>
                                <div className="mb-2 flex items-center justify-between gap-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                                            {index + 1}
                                        </span>

                                        <span className="truncate text-sm font-medium text-gray-900">
                                            {product.name}
                                        </span>
                                    </div>

                                    <span className="whitespace-nowrap text-sm font-semibold text-gray-900">
                                        {formatCurrency(product.sales)}
                                    </span>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                    <div
                                        className="h-full rounded-full bg-gray-900"
                                        style={{
                                            width: `${(product.sales / topProducts[0].sales) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Payment Methods
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Order distribution by payment method.
                        </p>
                    </div>

                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={paymentData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={3}
                                >
                                    {paymentData.map((entry, index) => (
                                        <Cell
                                            key={entry.name}
                                            fill={paymentColors[index]}
                                        />
                                    ))}
                                </Pie>

                                <Tooltip
                                    formatter={(value) =>
                                        `${value}%`
                                    }
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-3">
                        {paymentData.map((payment, index) => (
                            <div
                                key={payment.name}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className="h-3 w-3 rounded-full"
                                        style={{
                                            backgroundColor:
                                                paymentColors[index],
                                        }}
                                    />

                                    <span className="text-sm text-gray-600">
                                        {payment.name}
                                    </span>
                                </div>

                                <span className="text-sm font-semibold text-gray-900">
                                    {payment.value}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Order Performance
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Current order status distribution.
                    </p>

                    <div className="mt-8 space-y-5">
                        <div>
                            <div className="mb-2 flex justify-between">
                                <span className="text-sm text-gray-600">
                                    Delivered
                                </span>

                                <span className="text-sm font-semibold text-gray-900">
                                    68%
                                </span>
                            </div>

                            <div className="h-2 rounded-full bg-gray-100">
                                <div className="h-full w-[68%] rounded-full bg-gray-900" />
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex justify-between">
                                <span className="text-sm text-gray-600">
                                    Shipped
                                </span>

                                <span className="text-sm font-semibold text-gray-900">
                                    14%
                                </span>
                            </div>

                            <div className="h-2 rounded-full bg-gray-100">
                                <div className="h-full w-[14%] rounded-full bg-gray-700" />
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex justify-between">
                                <span className="text-sm text-gray-600">
                                    Pending
                                </span>

                                <span className="text-sm font-semibold text-gray-900">
                                    11%
                                </span>
                            </div>

                            <div className="h-2 rounded-full bg-gray-100">
                                <div className="h-full w-[11%] rounded-full bg-gray-500" />
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex justify-between">
                                <span className="text-sm text-gray-600">
                                    Cancelled
                                </span>

                                <span className="text-sm font-semibold text-gray-900">
                                    7%
                                </span>
                            </div>

                            <div className="h-2 rounded-full bg-gray-100">
                                <div className="h-full w-[7%] rounded-full bg-gray-300" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Key Metrics
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Important business performance indicators.
                    </p>

                    <div className="mt-6 space-y-5">
                        <div>
                            <p className="text-sm text-gray-500">
                                Conversion Rate
                            </p>

                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                4.8%
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Average Order Value
                            </p>

                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                Rs. 8,420
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Repeat Customer Rate
                            </p>

                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                36.5%
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Cancellation Rate
                            </p>

                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                7.0%
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}