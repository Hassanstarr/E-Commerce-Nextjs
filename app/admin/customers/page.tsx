
"use client";

import { useCallback, useEffect, useState } from "react";
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

const PAGE_SIZE = 10;

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<AdminCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: PAGE_SIZE,
        total: 0,
        totalPages: 0,
    });

    const loadCustomers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await adminFetch<CustomersResponse>(
                `/api/admin/customers?page=${page}&limit=${PAGE_SIZE}`
            );

            setCustomers(response.data.customers);
            setPagination(response.data.pagination);
        } catch (error: unknown) {
            console.error("Failed to load customers:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load customers"
            );
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    
    const totalCustomers = customers.length;

    const activeCustomers = customers.filter(
        (customer) => customer.status === "Active"
    ).length;

    const inactiveCustomers = customers.filter(
        (customer) => customer.status === "Inactive"
    ).length;

    const totalRevenue = customers.reduce(
        (sum, customer) => sum + customer.totalSpent,
        0
    );

    const averageSpent =
        totalCustomers > 0
            ? Math.round(totalRevenue / totalCustomers)
            : 0;

    const startCustomer =
        pagination.total === 0
            ? 0
            : (pagination.page - 1) * pagination.limit + 1;

    const endCustomer = Math.min(
        pagination.page * pagination.limit,
        pagination.total
    );

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
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
            <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <p className="text-sm text-red-600">{error}</p>

                    <button
                        type="button"
                        onClick={loadCustomers}
                        className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
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
                        {pagination.total.toLocaleString("en-PK")}
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
                        Rs. {averageSpent.toLocaleString("en-PK")}
                    </p>
                </div>
            </div>

            <CustomerTable customers={customers} />

            <div className="mt-5 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-medium text-gray-900">
                        {startCustomer}-{endCustomer}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-gray-900">
                        {pagination.total}
                    </span>{" "}
                    customers
                </p>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <button
                        type="button"
                        onClick={() => setPage((current) => current - 1)}
                        disabled={pagination.page <= 1}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Previous
                    </button>

                    <span className="whitespace-nowrap text-sm text-gray-600">
                        Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
                    </span>

                    <button
                        type="button"
                        onClick={() => setPage((current) => current + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}