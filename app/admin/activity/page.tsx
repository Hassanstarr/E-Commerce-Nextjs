"use client";

import { useEffect, useState } from "react";
import ActivityTable, { AdminActivity } from "@/components/admin/ActivityTable";
import { adminFetch } from "@/lib/admin-api";
import Spinner from "@/components/ui/Spinner";

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function AdminActivityPage() {
    const [activities, setActivities] = useState<AdminActivity[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);

    const formatType = (rawType: string): AdminActivity["type"] => {
        if (!rawType) return "System";
        const normalized = rawType.toLowerCase();
        switch (normalized) {
            case "order":
                return "Order";
            case "product":
                return "Product";
            case "category":
                return "Category";
            case "customer":
            case "user":
                return "Customer";
            default:
                return "System";
        }
    };

    const loadActivities = async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();
            params.set("page", page.toString());
            params.set("limit", "20");

            const response = await adminFetch<{
                success: boolean;
                data: {
                    activities: any[];
                    pagination: PaginationInfo;
                };
            }>(`/api/admin/activity?${params.toString()}`);

            const rawActivities = response?.data?.activities || [];
            if (response?.data?.pagination) {
                setPagination(response.data.pagination);
            }

            const mappedActivities: AdminActivity[] = rawActivities.map((act) => ({
                _id: act._id,
                type: formatType(act.entityType),
                action: act.action ? act.action.replace(/_/g, " ").toUpperCase() : "ACTIVITY LOGGED",
                description: act.description || "No description available",
                performedBy:
                    typeof act.user === "object" && act.user !== null
                        ? act.user.name || act.user.email || "System"
                        : act.user || "System",
                reference: act.entityId || "-",
                createdAt: act.createdAt || new Date().toISOString(),
            }));

            setActivities(mappedActivities);
        } catch (err: any) {
            setError(err?.message || "Failed to load activity log");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadActivities();
    }, [page]);

    const totalActivities = activities.length;

    const orderActivities = activities.filter(
        (activity) => activity.type === "Order"
    ).length;

    const productActivities = activities.filter(
        (activity) => activity.type === "Product"
    ).length;

    const customerActivities = activities.filter(
        (activity) => activity.type === "Customer"
    ).length;

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <p className="mb-2 text-sm font-medium text-gray-500">
                    Admin / Activity
                </p>

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Activity
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Track important actions and changes across the admin panel.
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Total Activities</p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {totalActivities}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                        Recent recorded events
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Order Activities</p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {orderActivities}
                    </p>

                    <p className="mt-1 text-xs text-blue-600">
                        Order-related events
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Product Activities</p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {productActivities}
                    </p>

                    <p className="mt-1 text-xs text-purple-600">
                        Product-related events
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Customer Activities</p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {customerActivities}
                    </p>

                    <p className="mt-1 text-xs text-green-600">
                        Customer-related events
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
                    <Spinner />
                </div>
            ) : (
                <>
                    <ActivityTable activities={activities} />

                    <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                        <p className="text-sm text-gray-500">
                            Page {pagination.page} of {pagination.totalPages || 1}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage((prev) => prev + 1)}
                                disabled={page >= pagination.totalPages}
                                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}