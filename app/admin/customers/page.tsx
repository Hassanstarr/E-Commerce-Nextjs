"use client";

import { useEffect, useState } from "react";
import CustomerTable, { AdminCustomer } from "@/components/admin/CustomerTable";
import { adminFetch } from "@/lib/admin-api";

type CustomersResponse = {
    success: boolean;
    data: {
        customers: AdminCustomer[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
};

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState< AdminCustomer[] >([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadCustomers = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await adminFetch<CustomersResponse>(
                        "/api/admin/customers"
                    );

                setCustomers(response.data.customers);

            } catch (error: any) {
                console.error("Failed to load customers:", error);

                setError(error?.message || "Failed to load customers");
            } finally {
                setLoading(false);
            }
        };

        loadCustomers();
    }, []);

    const totalCustomers = customers.length;

    const activeCustomers =customers.filter((customer) =>
            customer.status === "Active"
        ).length;

    const inactiveCustomers = customers.filter((customer) =>
            customer.status === "Inactive"
        ).length;

    const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);

    const averageSpent = totalCustomers > 0
                        ? Math.round(totalRevenue / totalCustomers)
                        : 0;

    if (loading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 mx-auto max-w-7xl">
                <div className="flex min-h-100 items-center justify-center">
                    <p className="text-sm text-gray-500">
                        Loading customers...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 mx-auto max-w-7xl">
                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <p className="text-sm text-red-600">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 mx-auto max-w-7xl">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Customers
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Manage and view your customers
                </p>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-500">
                        Total Customers
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        {totalCustomers}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-500">
                        Active Customers
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-green-600">
                        {activeCustomers}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-500">
                        Inactive Customers
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-gray-600">
                        {inactiveCustomers}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-500">
                        Average Spent
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        Rs.{" "}
                        {averageSpent.toLocaleString(
                            "en-PK"
                        )}
                    </p>
                </div>
            </div>

            <CustomerTable customers={customers} />
        </div>
    );
}