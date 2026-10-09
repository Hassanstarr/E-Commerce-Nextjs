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

type AnalyticsData = {
    summary: {
        totalRevenue: number;
        totalOrders: number;
        productsSold: number;
        averageOrderValue: number;
    };
    revenueTrend: {
        label: string;
        revenue: number;
        orders: number;
    }[];
    topProducts: {
        name: string;
        quantity: number;
        revenue: number;
    }[];
    salesByCategory: {
        name: string;
        sales: number;
    }[];
    paymentStatusDistribution: {
        name: string;
        count: number;
    }[];
    orderStatusDistribution: {
        status: string;
        count: number;
    }[];
};

interface AnalyticsChartsProps {
    data: AnalyticsData;
}

const formatCurrency = (value: number) => `Rs. ${Math.round(value).toLocaleString("en-PK")}`;

const statusColors: Record<string, string> = {
    pending: "#9CA3AF",
    confirmed: "#6B7280",
    shipped: "#4B5563",
    delivered: "#111827",
    cancelled: "#D1D5DB",
};

const paymentColors = ["#111827", "#9CA3AF"];

const chartTooltipStyle = {
    borderRadius: "8px",
    border: "1px solid #E5E7EB",
};

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
    const maxProductRevenue = Math.max(
        ...data.topProducts.map((product) => product.revenue),
        1
    );

    const totalPaymentOrders = data.paymentStatusDistribution.reduce(
        (sum, item) => sum + item.count,
        0
    );

    const totalStatusOrders = data.orderStatusDistribution.reduce(
        (sum, item) => sum + item.count,
        0
    );

    const cancelledOrders = data.orderStatusDistribution.find(
            (item) => item.status === "cancelled"
        )?.count || 0;

    const cancellationRate = totalStatusOrders > 0
            ? (cancelledOrders / totalStatusOrders) * 100
            : 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Revenue Overview
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Revenue from delivered and paid orders.
                        </p>
                    </div>

                    <div className="h-80">
                        {data.revenueTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={data.revenueTrend}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: 5,
                                        bottom: 0,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12 }}
                                        minTickGap={20}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) =>
                                            `${value / 1000}k`
                                        }
                                    />
                                    <Tooltip
                                        contentStyle={chartTooltipStyle}
                                        formatter={(value) => [
                                            formatCurrency(Number(value)),
                                            "Revenue",
                                        ]}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        name="Revenue"
                                        stroke="#111827"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart message="No revenue data available." />
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Orders Overview
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Delivered and paid orders over the selected period.
                        </p>
                    </div>

                    <div className="h-80">
                        {data.revenueTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data.revenueTrend}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12 }}
                                        minTickGap={20}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        contentStyle={chartTooltipStyle}
                                    />
                                    <Bar
                                        dataKey="orders"
                                        name="Delivered and paid orders"
                                        fill="#111827"
                                        radius={[5, 5, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart message="No order data available." />
                        )}
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
                            Revenue from delivered and paid orders, grouped by category.
                        </p>
                    </div>

                    <div className="h-80">
                        {data.salesByCategory.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data.salesByCategory}
                                    layout="vertical"
                                    margin={{
                                        top: 5,
                                        right: 15,
                                        left: 15,
                                        bottom: 5,
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
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) =>
                                            `${value / 1000}k`
                                        }
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12 }}
                                        width={100}
                                    />
                                    <Tooltip
                                        contentStyle={chartTooltipStyle}
                                        formatter={(value) => [
                                            formatCurrency(Number(value)),
                                            "Sales",
                                        ]}
                                    />
                                    <Bar
                                        dataKey="sales"
                                        name="Sales"
                                        fill="#111827"
                                        radius={[0, 5, 5, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart message="No category sales available." />
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Top Products
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Best-selling products by quantity sold.
                        </p>
                    </div>

                    {data.topProducts.length > 0 ? (
                        <div className="space-y-5">
                            {data.topProducts.map((product, index) => (
                                <div key={`${product.name}-${index}`}>
                                    <div className="mb-2 flex items-center justify-between gap-4">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                                                {index + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-gray-900">
                                                    {product.name}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {product.quantity} sold
                                                </p>
                                            </div>
                                        </div>
                                        <span className="whitespace-nowrap text-sm font-semibold text-gray-900">
                                            {formatCurrency(product.revenue)}
                                        </span>
                                    </div>

                                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                        <div
                                            className="h-full rounded-full bg-gray-900"
                                            style={{
                                                width: `${
                                                    (product.revenue /
                                                        maxProductRevenue) *
                                                    100
                                                }%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyChart message="No product sales available." />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Payment Status
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Paid versus pending payments.
                        </p>
                    </div>

                    {totalPaymentOrders > 0 ? (
                        <>
                            <div className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.paymentStatusDistribution}
                                            dataKey="count"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={78}
                                            paddingAngle={3}
                                        >
                                            {data.paymentStatusDistribution.map(
                                                (item, index) => (
                                                    <Cell
                                                        key={item.name}
                                                        fill={
                                                            paymentColors[
                                                                index %
                                                                    paymentColors.length
                                                            ]
                                                        }
                                                    />
                                                )
                                            )}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={chartTooltipStyle}
                                            formatter={(value) => [
                                                Number(value).toLocaleString(),
                                                "Orders",
                                            ]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="space-y-3">
                                {data.paymentStatusDistribution.map(
                                    (payment, index) => (
                                        <div
                                            key={payment.name}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="h-3 w-3 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            paymentColors[
                                                                index %
                                                                    paymentColors.length
                                                            ],
                                                    }}
                                                />
                                                <span className="text-sm text-gray-600">
                                                    {payment.name}
                                                </span>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {payment.count} (
                                                {(
                                                    (payment.count /
                                                        totalPaymentOrders) *
                                                    100
                                                ).toFixed(1)}
                                                %)
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>
                        </>
                    ) : (
                        <EmptyChart message="No payment data available." />
                    )}
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Order Performance
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Order counts by current status.
                    </p>

                    {totalStatusOrders > 0 ? (
                        <div className="mt-8 space-y-5">
                            {data.orderStatusDistribution.map((item) => (
                                <div key={item.status}>
                                    <div className="mb-2 flex justify-between gap-3">
                                        <span className="text-sm capitalize text-gray-600">
                                            {item.status}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {item.count} (
                                            {(
                                                (item.count /
                                                    totalStatusOrders) *
                                                100
                                            ).toFixed(1)}
                                            %)
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-gray-100">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${
                                                    (item.count /
                                                        totalStatusOrders) *
                                                    100
                                                }%`,
                                                backgroundColor:
                                                    statusColors[item.status] ||
                                                    "#111827",
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyChart message="No orders in this period." />
                    )}
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Key Metrics
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Business indicators for the selected period.
                    </p>

                    <div className="mt-6 space-y-6">
                        <div>
                            <p className="text-sm text-gray-500">
                                Average Order Value
                            </p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {formatCurrency(data.summary.averageOrderValue)}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                Revenue divided by delivered and paid orders
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Cancellation Rate
                            </p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {cancellationRate.toFixed(1)}%
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                {cancelledOrders} cancelled out of{" "}
                                {totalStatusOrders} total orders
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Total Revenue
                            </p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {formatCurrency(data.summary.totalRevenue)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Products Sold
                            </p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {data.summary.productsSold.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyChart({ message }: { message: string }) {
    return (
        <div className="flex h-full min-h-40 items-center justify-center rounded-lg bg-gray-50 px-4 text-center">
            <p className="text-sm text-gray-500">{message}</p>
        </div>
    );
}