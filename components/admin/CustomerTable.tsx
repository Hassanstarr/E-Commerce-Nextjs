"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type AdminCustomer = {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    ordersCount: number;
    totalSpent: number;
    lastOrder: string | null;
    status: "Active" | "Inactive";
    joinedAt: string;
};

type CustomerTableProps = {
    customers: AdminCustomer[];
    loading?: boolean;
};

export default function CustomerTable({ customers, loading }: CustomerTableProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredCustomers = useMemo(() => {
        return customers.filter((customer) => {
            const searchValue = search.toLowerCase();

            const matchesSearch =
                customer.name.toLowerCase().includes(searchValue) ||
                customer.email.toLowerCase().includes(searchValue) ||
                (customer.phone && customer.phone.toLowerCase().includes(searchValue)) ||
                customer._id.toLowerCase().includes(searchValue);

            const matchesStatus =
                statusFilter === "all" || customer.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [customers, search, statusFilter]);

    const formatDate = (date: string | null) => {
        if (!date || date === "-" || date === "N/A") {
            return "-";
        }

        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleDateString("en-PK", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div>
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row">
                    <div className="flex-1">
                        <label
                            htmlFor="customer-search"
                            className="sr-only"
                        >
                            Search customers
                        </label>

                        <input
                            id="customer-search"
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search by name, email, phone or customer ID..."
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                        className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    >
                        <option value="all">All Customers</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>

            <div className="mb-3">
                <p className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-medium text-gray-900">
                        {filteredCustomers.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-gray-900">
                        {customers.length}
                    </span>{" "}
                    customers
                </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full min-w-250 text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Customer
                            </th>
                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Contact
                            </th>
                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Orders
                            </th>
                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Total Spent
                            </th>
                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Last Order
                            </th>
                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Status
                            </th>
                            <th className="px-5 py-4 text-right font-semibold text-gray-700">
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredCustomers.map((customer) => (
                            <tr
                                key={customer._id}
                                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                            >
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                                            {customer.name
                                                ? customer.name.charAt(0).toUpperCase()
                                                : "U"}
                                        </div>

                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {customer.name}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-400">
                                                #{customer._id}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-5 py-4">
                                    <p className="font-medium text-gray-700">
                                        {customer.email}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {customer.phone && customer.phone !== "N/A"
                                            ? customer.phone
                                            : "-"}
                                    </p>
                                </td>

                                <td className="px-5 py-4 font-medium text-gray-900">
                                    {customer.ordersCount}
                                </td>

                                <td className="px-5 py-4 font-semibold text-gray-900">
                                    Rs. {customer.totalSpent.toLocaleString()}
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                                    {formatDate(customer.lastOrder)}
                                </td>

                                <td className="px-5 py-4">
                                    <span
                                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                                            customer.status === "Active"
                                                ? "border-green-200 bg-green-50 text-green-700"
                                                : "border-gray-200 bg-gray-50 text-gray-600"
                                        }`}
                                    >
                                        {customer.status}
                                    </span>
                                </td>

                                <td className="px-5 py-4 text-right">
                                    <Link
                                        href={`/admin/customers/${customer._id}`}
                                        className="text-sm font-medium text-gray-600 transition hover:text-black"
                                    >
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredCustomers.length === 0 && !loading && (
                    <div className="px-6 py-16 text-center">
                        <p className="font-medium text-gray-900">
                            No customers found
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Try changing your search or filter.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}