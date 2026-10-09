import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/middleware/admin";

import {
    getAdminDashboardData,
    getAdminOrders,
    getAdminOrderById,
    updateAdminOrder,
    getAdminCustomers,
    getAdminCustomerById,
    getAdminAnalytics,
    getAdminActivity,
    getAdminOrderHistory,
} from "@/services/admin.service";

import { getActivityLogs } from "@/services/activity.service";


// DASHBOARD

export const adminDashboardController = async (req: NextRequest) => {
    try {
        await requireAdmin();

        const dashboardData = await getAdminDashboardData();

        return NextResponse.json({
            success: true,
            data: dashboardData,
        });
    } catch (error: any) {
        console.error(
            "Admin dashboard controller error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ||
                    "Failed to load admin dashboard",
            },
            {
                status:
                    error?.statusCode ||
                    500,
            }
        );
    }
};


// ORDERS LIST

export const adminOrdersController = async (req: NextRequest) => {
    try {
        await requireAdmin();

        const { searchParams } =
            new URL(req.url);

        const page = Math.max(
            1,
            Number(
                searchParams.get(
                    "page"
                ) || 1
            )
        );

        const limit = Math.min(
            100,
            Math.max(
                1,
                Number(
                    searchParams.get(
                        "limit"
                    ) || 10
                )
            )
        );

        const search = searchParams.get(
                "search"
            ) || "";

        const orderStatus = searchParams.get(
                "orderStatus"
            ) || "";

        const paymentStatus = searchParams.get(
                "paymentStatus"
            ) || "";

        const data =
            await getAdminOrders({
                page,
                limit,
                search,
                orderStatus,
                paymentStatus,
            });

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error: any) {
        console.error(
            "Admin orders controller error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ||
                    "Failed to load orders",
            },
            {
                status:
                    error?.statusCode ||
                    500,
            }
        );
    }
};


// ORDER DETAILS

export const adminOrderDetailsController = async ( req: NextRequest, orderId: string ) => {
    try {
        await requireAdmin();

        const order = await getAdminOrderById(
                orderId
            );

        return NextResponse.json({
            success: true,
            data: order,
        });
    } catch (error: any) {
        console.error(
            "Admin order details controller error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ||
                    "Failed to load order",
            },
            {
                status:
                    error?.statusCode ||
                    500,
            }
        );
    }
};


// UPDATE ORDER

export const updateAdminOrderController = async ( req: NextRequest, orderId: string ) => {
    try {
        const authUser = await requireAdmin();

        const body = await req.json();

        const { orderStatus, paymentStatus, note } = body;

        const updatedOrder = await updateAdminOrder(
                orderId,
                {
                    orderStatus,
                    paymentStatus,
                    changedBy: authUser.userId,
                    note,
                }
            );

        return NextResponse.json({
            success: true,
            message:
                "Order updated successfully",
            data: updatedOrder,
        });
    } catch (error: any) {
        console.error(
            "Update admin order controller error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ||
                    "Failed to update order",
            },
            {
                status:
                    error?.statusCode ||
                    500,
            }
        );
    }
};

export const adminOrderHistoryController = async ( req: NextRequest, orderId: string ) => {
    try {
        await requireAdmin();

        const history = await getAdminOrderHistory( orderId );

        return NextResponse.json({
            success: true,
            data: history,
        });
    } catch (error: any) {
        console.error(
            "Admin order history controller error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ||
                    "Failed to load order history",
            },
            {
                status:
                    error?.statusCode ||
                    500,
            }
        );
    }
};

// CUSTOMERS

export const adminCustomersController = async (req: NextRequest) => {
    try {
        await requireAdmin();

        const { searchParams } = new URL(req.url);

        const page = Math.max(1, Number(searchParams.get("page") || 1));

        const limit = Math.min(
            100,
            Math.max(1, Number(searchParams.get("limit") || 10))
        );

        const search = searchParams.get("search") || "";

        const data = await getAdminCustomers({
            page,
            limit,
            search,
        });
            
        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error: any) {
        console.error(
            "Admin customers controller error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ||
                    "Failed to load customers",
            },
            {
                status:
                    error?.statusCode ||
                    500,
            }
        );
    }
};


// CUSTOMER DETAILS

export const adminCustomerDetailsController = async ( req: NextRequest, customerId: string ) => {
    try {
        await requireAdmin();

        const data = await getAdminCustomerById(customerId);

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error: any) {
        console.error(
            "Admin customer details controller error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ||
                    "Failed to load customer",
            },
            {
                status:
                    error?.statusCode ||
                    500,
            }
        );
    }
};


// ANALYTICS

export const adminAnalyticsController = async (req: NextRequest) => {
    try {
        await requireAdmin();

        const period = new URL(req.url).searchParams.get("period") || "30";
        const data = await getAdminAnalytics(period);

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error: any) {
        console.error("Admin analytics controller error:", error);

        return NextResponse.json(
            {
                success: false,
                message: error?.message || "Failed to load analytics",
            },
            {
                status: error?.statusCode || 500,
            }
        );
    }
};


// ACTIVITY

export const adminActivityController = async (req: NextRequest) => {
    try {
        await requireAdmin();

        const { searchParams } = new URL(req.url);

        const page = Math.max(1, Number(searchParams.get("page") || 1));

        const limit = Math.min(
            100,
            Math.max(1, Number(searchParams.get("limit") || 20))
        );

        const type = searchParams.get("type") || "";

        const data = await getActivityLogs({
            page,
            limit,
            type,
        });

        return NextResponse.json({
            success: true,
            data,
        });
        
    } catch (error: any) {
        console.error(
            "Admin activity controller error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ||
                    "Failed to load activity",
            },
            {
                status:
                    error?.statusCode ||
                    500,
            }
        );
    }
};