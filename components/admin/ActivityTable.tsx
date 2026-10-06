"use client";

import { useMemo, useState } from "react";

export type AdminActivity = {
    _id: string;
    type:
        | "Order"
        | "Product"
        | "Category"
        | "Customer"
        | "Stock"
        | "System";
    action: string;
    description: string;
    performedBy: string;
    reference: string;
    createdAt: string;
};

type ActivityTableProps = {
    activities: AdminActivity[];
};

export default function ActivityTable({
    activities,
}: ActivityTableProps) {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    const filteredActivities = useMemo(() => {
        return activities.filter((activity) => {
            const searchValue = search.toLowerCase();

            const matchesSearch =
                activity.action.toLowerCase().includes(searchValue) ||
                activity.description
                    .toLowerCase()
                    .includes(searchValue) ||
                activity.performedBy
                    .toLowerCase()
                    .includes(searchValue) ||
                activity.reference
                    .toLowerCase()
                    .includes(searchValue);

            const matchesType =
                typeFilter === "all" ||
                activity.type === typeFilter;

            return matchesSearch && matchesType;
        });
    }, [activities, search, typeFilter]);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString("en-PK", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const getTypeClass = (type: AdminActivity["type"]) => {
        switch (type) {
            case "Order":
                return "border-blue-200 bg-blue-50 text-blue-700";
            case "Product":
                return "border-purple-200 bg-purple-50 text-purple-700";
            case "Category":
                return "border-indigo-200 bg-indigo-50 text-indigo-700";
            case "Customer":
                return "border-green-200 bg-green-50 text-green-700";
            case "Stock":
                return "border-amber-200 bg-amber-50 text-amber-700";
            case "System":
                return "border-gray-200 bg-gray-50 text-gray-700";
            default:
                return "border-gray-200 bg-gray-50 text-gray-700";
        }
    };

    return (
        <div>
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row">
                    <div className="flex-1">
                        <label
                            htmlFor="activity-search"
                            className="sr-only"
                        >
                            Search activity
                        </label>

                        <input
                            id="activity-search"
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search activity, user, action or reference..."
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                        />
                    </div>

                    <select
                        value={typeFilter}
                        onChange={(event) =>
                            setTypeFilter(event.target.value)
                        }
                        className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    >
                        <option value="all">All Activity</option>
                        <option value="Order">Orders</option>
                        <option value="Product">Products</option>
                        <option value="Category">Categories</option>
                        <option value="Customer">Customers</option>
                        <option value="Stock">Stock</option>
                        <option value="System">System</option>
                    </select>
                </div>
            </div>

            <div className="mb-3">
                <p className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-medium text-gray-900">
                        {filteredActivities.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-gray-900">
                        {activities.length}
                    </span>{" "}
                    activities
                </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full min-w-225 text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Activity
                            </th>

                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Type
                            </th>

                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Performed By
                            </th>

                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Reference
                            </th>

                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Date
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredActivities.map((activity) => (
                            <tr
                                key={activity._id}
                                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                            >
                                <td className="px-5 py-4">
                                    <p className="font-medium text-gray-900">
                                        {activity.action}
                                    </p>

                                    <p className="mt-1 max-w-lg text-xs leading-5 text-gray-500">
                                        {activity.description}
                                    </p>
                                </td>

                                <td className="px-5 py-4">
                                    <span
                                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getTypeClass(
                                            activity.type
                                        )}`}
                                    >
                                        {activity.type}
                                    </span>
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 text-gray-700">
                                    {activity.performedBy}
                                </td>

                                <td className="px-5 py-4 font-medium text-gray-700">
                                    {activity.reference}
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                                    {formatDate(activity.createdAt)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredActivities.length === 0 && (
                    <div className="px-6 py-16 text-center">
                        <p className="font-medium text-gray-900">
                            No activity found
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