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

const revenueData = [
    { day: "Sep 30", revenue: 42000 },
    { day: "Oct 1", revenue: 58000 },
    { day: "Oct 2", revenue: 46000 },
    { day: "Oct 3", revenue: 72000 },
    { day: "Oct 4", revenue: 65000 },
    { day: "Oct 5", revenue: 89000 },
    { day: "Oct 6", revenue: 97000 },
];

export default function RevenueChart() {
    return (
        <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={revenueData}
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