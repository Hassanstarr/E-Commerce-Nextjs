"use client";

import { useEffect, useState } from "react";
import OrderTable, { type AdminOrder } from "@/components/admin/OrderTable";
import { adminFetch } from "@/lib/admin-api";

interface OrdersResponse {
    orders: AdminOrder[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface DashboardResponse {
    orderSummary: {
        pending: number;
        confirmed: number;
        shipped: number;
        delivered: number;
        cancelled: number;
    };
    summary: {
        totalOrders: number;
    };
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<AdminOrder[]>([]);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const [orderSummary, setOrderSummary] = useState<DashboardResponse["orderSummary"]>({
        pending: 0,
        confirmed: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [orderStatus, setOrderStatus] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");

    useEffect(() => {
        const loadOrders = async () => {
            try {
                setLoading(true);
                setError("");

                const params = new URLSearchParams();

                params.set(
                    "page",
                    String(pagination.page)
                );

                params.set(
                    "limit",
                    String(pagination.limit)
                );

                if (search.trim()) {
                    params.set(
                        "search",
                        search.trim()
                    );
                }

                if (orderStatus) {
                    params.set(
                        "orderStatus",
                        orderStatus
                    );
                }

                if (paymentStatus) {
                    params.set(
                        "paymentStatus",
                        paymentStatus
                    );
                }

                const response = await adminFetch<{
                    success: boolean;
                    data: OrdersResponse;
                }>(
                    `/api/admin/orders?${params.toString()}`
                );

                setOrders(
                    response.data.orders
                );

                setPagination(
                    response.data.pagination
                );
            } catch (error: any) {
                setError(error?.message || "Failed to load orders");
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [
        pagination.page,
        pagination.limit,
        search,
        orderStatus,
        paymentStatus,
    ]);

    useEffect(() => {
        const loadOrderSummary = async () => {
            try {
                const response =
                    await adminFetch<{
                        success: boolean;
                        data: DashboardResponse;
                    }>(
                        "/api/admin/dashboard"
                    );

                setOrderSummary(
                    response.data.orderSummary
                );
            } catch (error) {
                console.error("Failed to load order summary:", error);
            }
        };

        loadOrderSummary();
    }, []);

    const totalOrders =
        orderSummary.pending +
        orderSummary.confirmed +
        orderSummary.shipped +
        orderSummary.delivered +
        orderSummary.cancelled;

    const pendingOrders = orderSummary.pending;
    const activeOrders = orderSummary.confirmed + orderSummary.shipped;
    const deliveredOrders = orderSummary.delivered;
    const cancelledOrders = orderSummary.cancelled;
    
    const handleSearchChange = ( value: string ) => {
        setPagination((current) => ({
            ...current,
            page: 1,
        }));

        setSearch(value);
    };

    const handleStatusChange = ( value: string ) => {
        setPagination((current) => ({
            ...current,
            page: 1,
        }));

        setOrderStatus(value);
    };

    const handlePaymentChange = (value: string) => {
        setPagination((current) => ({
            ...current,
            page: 1,
        }));

        setPaymentStatus(value);
    };

    const handlePageChange = (page: number) => {
        setPagination((current) => ({
            ...current,
            page,
        }));
    };

    return (
        <section className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
            <main className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <p className="mb-2 text-sm font-medium text-gray-500">
                        Store Management
                    </p>

                    <h1 className="text-3xl font-bold text-gray-900">
                        Orders
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-gray-500">
                        View and manage customer orders, payments and
                        delivery status.
                    </p>
                </div>

                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Orders
                        </p>

                        <p className="mt-2 text-2xl font-bold text-gray-900">
                            {totalOrders}
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Pending
                        </p>

                        <p className="mt-2 text-2xl font-bold text-amber-600">
                            {pendingOrders}
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Active
                        </p>

                        <p className="mt-2 text-2xl font-bold text-blue-600">
                            {activeOrders}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            Confirmed + shipped
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Delivered
                        </p>

                        <p className="mt-2 text-2xl font-bold text-green-600">
                            {deliveredOrders}
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Cancelled
                        </p>

                        <p className="mt-2 text-2xl font-bold text-red-600">
                            {cancelledOrders}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-600">
                            {error}
                        </p>
                    </div>
                )}

                <OrderTable
                    orders={orders}
                    loading={loading}
                    total={pagination.total}
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    search={search}
                    statusFilter={orderStatus}
                    paymentFilter={paymentStatus}
                    onSearchChange={handleSearchChange}
                    onStatusChange={handleStatusChange}
                    onPaymentChange={handlePaymentChange}
                    onPageChange={handlePageChange}
                />
            </main>
        </section>
    );
}