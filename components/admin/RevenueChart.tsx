"use client";

import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import Spinner from "@/components/ui/Spinner";

interface RevenueChartProps {
    data?: { label: string; revenue: number }[];
    loading?: boolean;
    error?: string;
}

export default function RevenueChart({
    data = [],
    loading = false,
    error = "",
}: RevenueChartProps) {
    if (loading) {
        return (
            <div className="mt-6 flex h-72 w-full items-center justify-center rounded-xl bg-gray-50/50">
                <div className="flex flex-col items-center gap-2">
                    <Spinner />
                    <p className="text-xs text-gray-500">Loading revenue chart...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-6 flex h-72 w-full items-center justify-center rounded-xl border border-red-100 bg-red-50/50 px-4 text-center">
                <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="mt-6 flex h-72 w-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 text-center">
                <p className="text-sm text-gray-500">No revenue data available for this period.</p>
            </div>
        );
    }

    const chartData = data.map((item) => ({
        day: item.label,
        revenue: item.revenue,
    }));

    return (
        <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
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
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                    />

                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) =>
                            `Rs. ${value / 1000}k`
                        }
                    />

                    <Tooltip
                        formatter={(value) => [
                            `Rs. ${Number(value).toLocaleString()}`,
                            "Revenue",
                        ]}
                    />

                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="currentColor"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}