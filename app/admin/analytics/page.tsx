"use client";

import { useEffect, useState } from "react";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";
import { adminFetch } from "@/lib/admin-api";
import Spinner from "@/components/ui/Spinner";

type AnalyticsData = {
    period: string;
    dateRange: { start: string; end: string };
    summary: {
        totalRevenue: number;
        totalOrders: number;
        productsSold: number;
        averageOrderValue: number;
        revenueChange: number;
        ordersChange: number;
        productsSoldChange: number;
        averageOrderValueChange: number;
    };
    revenueTrend: { label: string; revenue: number; orders: number }[];
    topProducts: { name: string; quantity: number; revenue: number }[];
    salesByCategory: { name: string; sales: number }[];
    paymentStatusDistribution: { name: string; count: number }[];
    orderStatusDistribution: { status: string; count: number }[];
};

type AnalyticsResponse = {
    success: boolean;
    data: AnalyticsData;
};

const formatCurrency = (value: number) => `Rs. ${Math.round(value).toLocaleString("en-PK")}`;

const formatChange = (value: number) => {
    const prefix = value > 0 ? "+" : "";
    return `${prefix}${value}% compared to previous period`;
};

export default function AdminAnalyticsPage() {
    const [period, setPeriod] = useState("30");
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadAnalytics = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await adminFetch<AnalyticsResponse>(
                    `/api/admin/analytics?period=${period}`
                );

                if (!cancelled) {
                    setAnalytics(response.data);
                }
            } catch (err: unknown) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load analytics"
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadAnalytics();

        return () => {
            cancelled = true;
        };
    }, [period]);

    const exportReport = () => {
        if (!analytics) return;

        const rows = [
            ["ShopEase Analytics Report"],
            ["Period", period === "year" ? "This Year" : `Last ${period} Days`],
            ["Start Date", new Date(analytics.dateRange.start).toLocaleDateString()],
            ["End Date", new Date(analytics.dateRange.end).toLocaleDateString()],
            [],
            ["Metric", "Value"],
            ["Total Revenue", analytics.summary.totalRevenue],
            ["Total Orders", analytics.summary.totalOrders],
            ["Products Sold", analytics.summary.productsSold],
            ["Average Order Value", analytics.summary.averageOrderValue],
            [],
            ["Revenue Trend"],
            ["Date", "Revenue", "Delivered and Paid Orders"],
            ...analytics.revenueTrend.map((item) => [
                item.label,
                item.revenue,
                item.orders,
            ]),
            [],
            ["Top Products"],
            ["Product", "Quantity Sold", "Revenue"],
            ...analytics.topProducts.map((item) => [
                item.name,
                item.quantity,
                item.revenue,
            ]),
            [],
            ["Sales by Category"],
            ["Category", "Revenue"],
            ...analytics.salesByCategory.map((item) => [
                item.name,
                item.sales,
            ]),
        ];

        const csv = rows.map((row) =>
            row.map((cell) => {
                const value = String(cell ?? "");
                return `"${value.replace(/"/g, '""')}"`;
            }).join(",")
        ).join("\r\n");

        const blob = new Blob(["\uFEFF", csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `shopease-analytics-${period}.csv`;
        link.click();

        URL.revokeObjectURL(url);
    };

    const stats = analytics
        ? [
              {
                  title: "Total Revenue",
                  value: formatCurrency(analytics.summary.totalRevenue),
                  change: analytics.summary.revenueChange,
              },
              {
                  title: "Total Orders",
                  value: analytics.summary.totalOrders.toLocaleString(),
                  change: analytics.summary.ordersChange,
              },
              {
                  title: "Products Sold",
                  value: analytics.summary.productsSold.toLocaleString(),
                  change: analytics.summary.productsSoldChange,
              },
              {
                  title: "Average Order Value",
                  value: formatCurrency(analytics.summary.averageOrderValue),
                  change: analytics.summary.averageOrderValueChange,
              },
          ]
        : [];

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
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
                            Analyze sales, orders, customers and product performance.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <select
                            value={period}
                            onChange={(event) => setPeriod(event.target.value)}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-black focus:ring-1 focus:ring-black"
                        >
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 3 Months</option>
                            <option value="180">Last 6 Months</option>
                            <option value="year">This Year</option>
                        </select>

                        <button
                            type="button"
                            onClick={exportReport}
                            disabled={!analytics || loading}
                            className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Export Report
                        </button>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="flex min-h-60 flex-col items-center justify-center gap-3">
                    <Spinner />
                    <p className="text-sm text-gray-500">
                        Loading analytics...
                    </p>
                </div>
            )}

            {!loading && error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <p className="text-sm font-medium text-red-700">{error}</p>
                    <button
                        type="button"
                        onClick={() => setPeriod((current) => current)}
                        className="mt-3 text-sm font-semibold text-red-800 underline"
                    >
                        Select a date range to retry
                    </button>
                </div>
            )}

            {!loading && !error && analytics && (
                <>
                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {stats.map((stat) => (
                            <div
                                key={stat.title}
                                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                            >
                                <p className="text-sm text-gray-500">
                                    {stat.title}
                                </p>

                                <p className="mt-2 text-2xl font-bold text-gray-900">
                                    {stat.value}
                                </p>

                                <p
                                    className={`mt-1 text-xs ${
                                        stat.change > 0
                                            ? "text-green-600"
                                            : stat.change < 0
                                              ? "text-red-600"
                                              : "text-gray-500"
                                    }`}
                                >
                                    {formatChange(stat.change)}
                                </p>
                            </div>
                        ))}
                    </div>

                    <AnalyticsCharts data={analytics} />
                </>
            )}
        </div>
    );
}