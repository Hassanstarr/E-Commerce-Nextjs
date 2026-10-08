"use client";

import { useEffect, useState } from "react";
import CustomerTable, {
    AdminCustomer,
} from "@/components/admin/CustomerTable";

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<AdminCustomer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/admin/customers");
                const result = await res.json();

                if (!res.ok || !result.success) {
                    throw new Error(result.message || "Failed to fetch customers");
                }

                const rawCustomers = result.data?.customers || [];
                const formattedCustomers: AdminCustomer[] = rawCustomers.map((cust: any) => {
                    
                    const hasOrders = (cust.totalOrders ?? 0) > 0;

                        return {
                            _id: cust._id,
                            name: cust.name || "N/A",
                            email: cust.email,
                            phone: cust.phone || cust.lastOrderPhone || "-",
                            ordersCount: cust.totalOrders ?? 0,
                            totalSpent: cust.totalSpent ?? 0,
                            lastOrder: hasOrders
                                ? cust.lastOrder || cust.updatedAt || cust.createdAt
                                : "-",
                            status: cust.status || (hasOrders ? "Active" : "Inactive"),
                            joinedAt: cust.createdAt,
                        };
                    }
                );

                setCustomers(formattedCustomers);
            } catch (err: any) {
                setError(err.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    const totalCustomers = customers.length;

    const activeCustomers = customers.filter(
        (customer) => customer.status === "Active"
    ).length;

    const inactiveCustomers = customers.filter(
        (customer) => customer.status === "Inactive"
    ).length;

    const totalRevenue = customers.reduce(
        (sum, customer) => sum + (customer.totalSpent || 0),
        0
    );

    const averageSpent = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;

    return (
        <div className="p-4 sm:p-6 lg:p-8 mx-auto max-w-7xl">
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
                        {loading ? "..." : totalCustomers}
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
                        {loading ? "..." : activeCustomers}
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
                        {loading ? "..." : inactiveCustomers}
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
                        {loading ? "..." : `Rs. ${averageSpent.toLocaleString()}`}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                        Based on customer orders
                    </p>
                </div>
            </div>

            {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-600">
                    {error}
                </div>
            ) : (
                <CustomerTable customers={customers} />
            )}
        </div>
    );
}