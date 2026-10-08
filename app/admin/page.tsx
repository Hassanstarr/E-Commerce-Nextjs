"use client";

import { useEffect, useState } from "react";
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

import { adminFetch } from "@/lib/admin-api";

interface DashboardData {
    summary: {
        totalRevenue: number;
        totalOrders: number;
        productsSold: number;
        totalCustomers: number;
    };

    orderSummary: {
        pending: number;
        confirmed: number;
        shipped: number;
        delivered: number;
        cancelled: number;
    };

    recentOrders: any[];
    lowStockProducts: any[];
}

export default function AdminPage() {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await adminFetch<{
                        success: boolean;
                        data: DashboardData;
                    }>("/api/admin/dashboard");

                setDashboardData(
                    response.data
                );
            } catch (error: any) {
                setError(
                    error?.message ||
                    "Failed to load dashboard"
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (loading) {
        return (
            <section className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <p className="text-sm text-gray-500">
                        Loading dashboard...
                    </p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                        <p className="text-sm font-medium text-red-600">
                            {error}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    if (!dashboardData) {
        return null;
    }

    const stats = [
        {
            title: "Total Revenue",
            value: `Rs. ${dashboardData.summary.totalRevenue.toLocaleString()}`,
            description: "from delivered orders",
            icon: HiOutlineArrowTrendingUp,
        },
        {
            title: "Total Orders",
            value: dashboardData.summary.totalOrders.toLocaleString(),
            description: "all orders",
            icon: HiOutlineShoppingCart,
        },
        {
            title: "Products Sold",
            value: dashboardData.summary.productsSold.toLocaleString(),
            description: "from delivered orders",
            icon: HiOutlineCube,
        },
        {
            title: "Customers",
            value: dashboardData.summary.totalCustomers.toLocaleString(),
            description: "registered users",
            icon: HiOutlineUsers,
        },
    ];

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

                                <div className="mt-4">
                                    <span className="text-sm text-gray-400">
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
                                    {dashboardData.orderSummary.pending}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Confirmed
                                </span>

                                <span className="font-semibold text-gray-900">
                                    {dashboardData.orderSummary.confirmed}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Shipped
                                </span>

                                <span className="font-semibold text-gray-900">
                                    {dashboardData.orderSummary.shipped}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Delivered
                                </span>

                                <span className="font-semibold text-gray-900">
                                    {dashboardData.orderSummary.delivered}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Cancelled
                                </span>

                                <span className="font-semibold text-gray-900">
                                    {dashboardData.orderSummary.cancelled}
                                </span>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <RecentOrders
                        orders={dashboardData.recentOrders}
                    />
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <TopProducts />
                    <LowStockProducts
                        products={
                            dashboardData.lowStockProducts
                        }
                    />
                </div>

            </div>
        </section>
    );
}