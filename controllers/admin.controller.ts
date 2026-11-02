import { errorMessage, errorStatus } from "@/lib/errors";
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
    getAdminOrderHistory,
} from "@/services/admin.service";

import { getActivityLogs } from "@/services/activity.service";


// DASHBOARD

export const adminDashboardController = async () => {
    try {
        await requireAdmin();

        const dashboardData = await getAdminDashboardData();

        return NextResponse.json({
            success: true,
            data: dashboardData,
        });
    } catch (error) {
        console.error(
            "Admin dashboard controller error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: errorMessage(error, "Failed to load admin dashboard"),
            },
            {
                status: errorStatus(error),
            }
        );
    }
};


// ORDERS LIST

export const adminOrdersController = async (req: NextRequest) => {
    try {
        await requireAdmin();

        const { searchParams } = new URL(req.url);

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

        const search = searchParams.get("search") || "";
        const orderStatus = searchParams.get("orderStatus") || "";
        const paymentStatus = searchParams.get("paymentStatus") || "";

        const data = await getAdminOrders({
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
    } catch (error) {
        console.error(
            "Admin orders controller error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    errorMessage(error, "Failed to load orders"),
            },
            {
                status:
                    errorStatus(error),
            }
        );
    }
};


// ORDER DETAILS

export const adminOrderDetailsController = async ( req: NextRequest, orderId: string ) => {
    try {
        await requireAdmin();

        const order = await getAdminOrderById(orderId);

        return NextResponse.json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error(
            "Admin order details controller error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    errorMessage(error, "Failed to load order"),
            },
            {
                status:
                    errorStatus(error),
            }
        );
    }
};


// UPDATE ORDER

export const updateAdminOrderController = async ( req: NextRequest, orderId: string ) => {
    try {
        const authUser = await requireAdmin();

        const body = await req.json().catch(() => null);
        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return NextResponse.json({ success: false, message: "Provide a valid order update" }, { status: 400 });
        }

        const { orderStatus, paymentStatus, note, restock, retryRefund } = body;

        const updatedOrder = await updateAdminOrder(
                orderId,
                {
                    orderStatus,
                    paymentStatus,
                    changedBy: authUser.userId,
                    note,
                    restock,
                    retryRefund,
                }
            );

        return NextResponse.json({
            success: true,
            message:
                "Order updated successfully",
            data: updatedOrder,
        });
    } catch (error) {
        console.error("Update admin order controller error:", error);

        return NextResponse.json(
            {
                success: false,
                message: errorMessage(error, "Failed to update order"),
            },
            {
                status: errorStatus(error),
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
    } catch (error) {
        console.error("Admin order history controller error:", error);

        return NextResponse.json(
            {
                success: false,
                message: errorMessage(error, "Failed to load order history"),
            },
            {
                status: errorStatus(error),
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
            status: searchParams.get("status") || "",
        });
            
        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Admin customers controller error:", error);

        return NextResponse.json(
            {
                success: false,
                message: errorMessage(error, "Failed to load customers"),
            },
            {
                status: errorStatus(error),
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
    } catch (error) {
        console.error("Admin customer details controller error:", error);

        return NextResponse.json(
            {
                success: false,
                message: errorMessage(error, "Failed to load customer"),
            },
            {
                status: errorStatus(error),
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
    } catch (error) {
        console.error("Admin analytics controller error:", error);

        return NextResponse.json(
            {
                success: false,
                message: errorMessage(error, "Failed to load analytics"),
            },
            {
                status: errorStatus(error),
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
        const search = searchParams.get("search") || "";

        const data = await getActivityLogs({
            page,
            limit,
            type,
            search,
        });

        return NextResponse.json({
            success: true,
            data,
        });
        
    } catch (error) {
        console.error("Admin activity controller error:", error);

        return NextResponse.json(
            {
                success: false,
                message: errorMessage(error, "Failed to load activity"),
            },
            {
                status: errorStatus(error),
            }
        );
    }
};
