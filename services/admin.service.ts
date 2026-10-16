import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import Category from "@/models/Category";
import OrderHistory from "@/models/OrderHistory";
import { createActivityLog } from "./activity.service";
import { canChangeOrderStatus, canChangePaymentStatus } from "@/lib/order-status";
import AppError from "@/lib/AppError";
import mongoose from "mongoose";

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function addOrderDisplayIds<T extends { _id: { toString(): string } }>(orders: T[]) {
    if (!orders.length) return [];

    const shortIds = orders.map((order) => order._id.toString().slice(-6));
    const matchingOrders = await Order.aggregate([
        {
            $match: {
                $expr: {
                    $in: [
                        { $substrBytes: [{ $toString: "$_id" }, 18, 6] },
                        shortIds,
                    ],
                },
            },
        },
        { $project: { _id: 1 } },
    ]);

    return orders.map((order) => {
        const id = order._id.toString();
        let length = 6;

        while (length < id.length && matchingOrders.some((matchingOrder) => {
            const otherId = matchingOrder._id.toString();
            return otherId !== id && otherId.endsWith(id.slice(-length));
        })) {
            length += 2;
        }

        return { ...order, displayId: id.slice(-length) };
    });
}


//DASHBOARD

export const getAdminDashboardData = async () => {
    const [
        totalOrders,
        totalCustomers,
        revenueSummary,
        recentOrders,
        lowStockProducts,
        pendingOrders,
        confirmedOrders,
        shippedOrders,
        deliveredOrderCount,
        cancelledOrders,
    ] = await Promise.all([
        Order.countDocuments(),

        User.countDocuments({ role: "user" }),

        Order.aggregate([
            {
                $match: {
                    orderStatus: "delivered",
                    paymentStatus: "paid",
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$subtotal" },
                    productsSold: {
                        $sum: {
                            $reduce: {
                                input: "$items",
                                initialValue: 0,
                                in: { $add: ["$$value", "$$this.quantity"] },
                            },
                        },
                    },
                },
            },
        ]),

        Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),

        Product.find({
            stock: { $lte: 5 },
        })
            .sort({ stock: 1 })
            .limit(5)
            .lean(),

        Order.countDocuments({
            orderStatus: "pending",
        }),

        Order.countDocuments({
            orderStatus: "confirmed",
        }),

        Order.countDocuments({
            orderStatus: "shipped",
        }),

        Order.countDocuments({
            orderStatus: "delivered",
        }),

        Order.countDocuments({
            orderStatus: "cancelled",
        }),
    ]);

    const totalRevenue = revenueSummary[0]?.totalRevenue || 0;
    const productsSold = revenueSummary[0]?.productsSold || 0;

    return {
        summary: {
            totalRevenue,
            totalOrders,
            productsSold,
            totalCustomers,
        },

        orderSummary: {
            pending: pendingOrders,
            confirmed: confirmedOrders,
            shipped: shippedOrders,
            delivered: deliveredOrderCount,
            cancelled: cancelledOrders,
        },

        recentOrders: await addOrderDisplayIds(recentOrders),
        lowStockProducts,
    };
};


// ORDERS

interface GetAdminOrdersParams {
    page?: number;
    limit?: number;
    search?: string;
    orderStatus?: string;
    paymentStatus?: string;
}

export const getAdminOrders = async ({
    page = 1,
    limit = 10,
    search = "",
    orderStatus = "",
    paymentStatus = "",
}: GetAdminOrdersParams) => {
    
    const query: any = {};
        
    if (search.trim()) {
        const searchTerm = search.trim();
        const searchRegex = {
            $regex: escapeRegex(searchTerm),
            $options: "i",
        };

        query.$or = [
            { customerName: searchRegex },
            { customerEmail: searchRegex },
        ];

        const idSearch = searchTerm.replace(/^#/, "");

        if (/^[0-9a-fA-F]{24}$/.test(idSearch)) {
            delete query.$or;
            query._id = idSearch.toLowerCase();
        } else if (/^[0-9a-fA-F]{1,23}$/.test(idSearch)) {
            query.$or.push({
                $expr: {
                    $regexMatch: {
                        input: { $toString: "$_id" },
                        regex: idSearch,
                        options: "i",
                    },
                },
            });
        }
    }


    if (orderStatus) {
        query.orderStatus = orderStatus;
    }

    if (paymentStatus) {
        query.paymentStatus = paymentStatus;
    }

    const skip = (page - 1) * limit;

    const [orders, totalOrders] = await Promise.all([
        Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        Order.countDocuments(query),
    ]);

    return {
        orders: await addOrderDisplayIds(orders),
        pagination: {
            page,
            limit,
            total: totalOrders,
            totalPages: Math.ceil(
                totalOrders / limit
            ),
        },
    };
};


// ORDER DETAILS

export const getAdminOrderById = async ( orderId: string ) => {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new AppError("Invalid order ID", 400);
    }

    const order = await Order.findById(orderId).lean();

    if (!order) {
        const error: any = new Error(
            "Order not found"
        );

        error.statusCode = 404;

        throw error;
    }

    return order;
};


// UPDATE ORDER

const validOrderStatuses = [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
];

const validPaymentStatuses = [
    "pending",
    "paid",
];

interface UpdateAdminOrderParams {
    orderStatus?: string;
    paymentStatus?: string;
    changedBy: string;
    note?: string;
}

export const updateAdminOrder = async ( orderId: string, { orderStatus, paymentStatus, changedBy, note="" }: UpdateAdminOrderParams ) => {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new AppError("Invalid order ID", 400);
    }

    if (typeof note !== "string" || note.length > 1000) {
        throw new AppError("Note must be text with at most 1000 characters", 400);
    }

    note = note.trim();

    if (orderStatus === undefined && paymentStatus === undefined && !note) {
        const error: any = new Error(
            "No update data provided"
        );

        error.statusCode = 400;

        throw error;
    }

    if (orderStatus !== undefined && !validOrderStatuses.includes(orderStatus)) {
        const error: any = new Error(
            "Invalid order status"
        );

        error.statusCode = 400;

        throw error;
    }

    if (paymentStatus !== undefined && !validPaymentStatuses.includes(paymentStatus)) {
        const error: any = new Error(
            "Invalid payment status"
        );

        error.statusCode = 400;

        throw error;
    }

    const existingOrder = await Order.findById(orderId)

    if(!existingOrder){
        const error: any = new Error("Order not found");
        error.statusCode = 404;

        throw error;
    }

    const updateData: any = {};

    if (orderStatus) {
        updateData.orderStatus = orderStatus;
    }

    if (paymentStatus) {
        updateData.paymentStatus = paymentStatus;
    }

    const previousStatus = existingOrder.orderStatus;
    const previousPaymentStatus = existingOrder.paymentStatus;

    if (orderStatus !== undefined && !canChangeOrderStatus(previousStatus, orderStatus, previousPaymentStatus)) {
        throw new AppError(
            `Cannot change order status from ${previousStatus} to ${orderStatus}. Orders must move forward, and paid orders cannot be cancelled.`,
            400
        );
    }

    if (paymentStatus !== undefined && !canChangePaymentStatus(previousPaymentStatus, paymentStatus, orderStatus || previousStatus)) {
        throw new AppError(
            "Payment can only change from pending to paid after delivery. Paid payments cannot be reversed.",
            400
        );
    }

    const updatedOrder = await Order.findOneAndUpdate(
            {
                _id: orderId,
                orderStatus: previousStatus,
                paymentStatus: previousPaymentStatus,
            },
            {
                $set: updateData,
            },
            {
                new: true,
                runValidators: true,
            }
        ).lean();

    if (!updatedOrder) {
        throw new AppError(
            "Order changed while you were updating it. Refresh the order and try again.",
            409
        );
    }

    const shouldRestoreStock = orderStatus === "cancelled" && previousStatus !== "cancelled";

    if (shouldRestoreStock) {
        for (const item of existingOrder.items) {
            await Product.findByIdAndUpdate(
                item.product,
                {
                    $inc: {
                        stock: item.quantity,
                    },
                }
            );
        }
    }

    if ( paymentStatus && paymentStatus !== previousPaymentStatus ) {
        await createActivityLog({
            user: changedBy,
            action: "update_payment_status",
            entityType: "order",
            entityId: orderId,
            description: `Order payment status changed from ${previousPaymentStatus} to ${paymentStatus}`,
            metadata: {
                previousStatus: previousPaymentStatus,
                newStatus: paymentStatus,
                note,
            },
        });
    }

    if ((orderStatus && orderStatus !== previousStatus) || note) {
        await OrderHistory.create({
            order: orderId,
            status: orderStatus || previousStatus,
            changedBy,
            note,
        });
    }

    if ( orderStatus && orderStatus !== previousStatus ) {
        await createActivityLog({
            user: changedBy,
            action: "update_order_status",
            entityType: "order",
            entityId: orderId,
            description: `Order status changed from ${previousStatus} to ${orderStatus}`,
            metadata: {
                previousStatus,
                newStatus: orderStatus,
                note,
            },
        });
    }

    if (note && (!orderStatus || orderStatus === previousStatus) && (!paymentStatus || paymentStatus === previousPaymentStatus)) {
        await createActivityLog({
            user: changedBy,
            action: "add_order_note",
            entityType: "order",
            entityId: orderId,
            description: "Note added to order",
            metadata: { note },
        });
    }

    return updatedOrder;
};


export const getAdminOrderHistory = async ( orderId: string ) => {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new AppError("Invalid order ID", 400);
    }

    const history =await OrderHistory.find({
            order: orderId,
        }).populate(
            "changedBy",
            "name email"
        ).sort({
            createdAt: -1,
        }).lean();

    return history;
};


// CUSTOMERS

interface GetAdminCustomersParams {
    page?: number;
    limit?: number;
    search?: string;
}

export const getAdminCustomers = async ({
    page = 1,
    limit = 10,
    search = "",
}: GetAdminCustomersParams) => {
    
    const currentPage = Math.max(1, Math.floor(page) || 1);
    const pageSize = Math.min(100, Math.max(1, Math.floor(limit) || 10));

    const query: any = {
        role: "user",
    };

    if (search.trim()) {
        const searchRegex = {
            $regex: escapeRegex(search.trim()),
            $options: "i",
        };

        query.$or = [
            { name: searchRegex },
            { email: searchRegex },
        ];
    }

    const skip = (currentPage - 1) * pageSize;

    const [customers, totalCustomers] = await Promise.all([
        User.find(query)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize)
            .lean(),

        User.countDocuments(query),
    ]);

    const customerIds = customers.map(
        (customer) => customer._id
    );

    const orderStats = await Order.aggregate([
        {
            $match: {
                user: { $in: customerIds },
            },
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $group: {
                _id: "$user",

                totalOrders: {
                    $sum: 1,
                },

                totalSpent: {
                    $sum: {
                        $cond: [
                            {
                                $eq: [
                                    "$paymentStatus",
                                    "paid",
                                ],
                            },
                            "$total",
                            0,
                        ],
                    },
                },

                latestOrder: {
                    $first: "$createdAt",
                },

                latestPhone: {
                    $first: "$phone",
                },
            },
        },
    ]);

    const statsMap = new Map(
        orderStats.map((item) => [
            item._id.toString(),
            item,
        ])
    );

    const now = Date.now();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

    const customersWithStats = customers.map((customer) => {
        const stats = statsMap.get(
            customer._id.toString()
        );

        const lastOrder = stats?.latestOrder
                        ? new Date(stats.latestOrder).toISOString()
                        : null;

        const status = lastOrder && now - new Date(lastOrder).getTime() <= thirtyDaysInMs
                    ? "Active"
                    : "Inactive";

        return {
            _id: customer._id.toString(),
            name: customer.name,
            email: customer.email,
            phone: stats?.latestPhone || "",
            ordersCount: stats?.totalOrders || 0,
            totalSpent: stats?.totalSpent || 0,
            lastOrder,
            status,
            joinedAt: customer.createdAt,
        };
    });

    customersWithStats.sort((a, b) => {
        if (!a.lastOrder && !b.lastOrder) {
            return 0;
        }

        if (!a.lastOrder) {
            return 1;
        }

        if (!b.lastOrder) {
            return -1;
        }

        return (
            new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime()
        );
    });

    return {
        customers: customersWithStats,
        pagination: {
            page: currentPage,
            limit: pageSize,
            total: totalCustomers,
            totalPages: Math.ceil(totalCustomers / pageSize),
        },
    };
};

// CUSTOMER DETAILS

export const getAdminCustomerById = async ( customerId: string ) => {
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
        throw new AppError("Invalid customer ID", 400);
    }

    const customer = await User.findOne({
        _id: customerId,
        role: "user",
    }).select("-password").lean();

    if (!customer) {
        const error: any = new Error(
            "Customer not found"
        );

        error.statusCode = 404;

        throw error;
    }

    const orders = await Order.find({
        user: customer._id,
    }).sort({ createdAt: -1 }).lean();

    const totalSpent = orders.reduce((sum, order) => {
        return order.paymentStatus === "paid"
            ? sum + order.total
            : sum;
    }, 0);

    return {
        customer,
        statistics: {
            totalOrders: orders.length,
            totalSpent,
        },
        orders,
    };
};


// ANALYTICS

type AnalyticsPeriod = "7" | "30" | "90" | "180" | "year";

const getAnalyticsDateRange = (period: AnalyticsPeriod) => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);

    if (period === "year") {
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
    } else {
        start.setDate(start.getDate() - Number(period) + 1);
        start.setHours(0, 0, 0, 0);
    }

    const duration = end.getTime() - start.getTime();
    const previousEnd = new Date(start.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - duration);

    return { start, end, previousStart, previousEnd };
};

const getPercentageChange = (current: number, previous: number) => {
    if (!Number.isFinite(current) || !Number.isFinite(previous)) {
        return 0;
    }

    if (previous === 0) {
        if (current === 0) return 0;
        return current > 0 ? 100 : -100;
    }

    const change = ((current - previous) / previous) * 100;
    return Number.isFinite(change) ? Number(change.toFixed(1)) : 0;
};

export const getAdminAnalytics = async ( requestedPeriod: string = "30" ) => {
    const allowedPeriods: AnalyticsPeriod[] = [
        "7",
        "30",
        "90",
        "180",
        "year",
    ];

    const period: AnalyticsPeriod = allowedPeriods.includes(requestedPeriod as AnalyticsPeriod)
        ? (requestedPeriod as AnalyticsPeriod)
        : "30";

    const { start, end, previousStart, previousEnd } = getAnalyticsDateRange(period);

    const revenueMatch = {
        orderStatus: "delivered" as const,
        paymentStatus: "paid" as const,
    };

    const currentDateMatch = {
        createdAt: { $gte: start, $lte: end },
    };

    const previousDateMatch = {
        createdAt: { $gte: previousStart, $lte: previousEnd },
    };

    const [
        currentRevenueOrders,
        previousRevenueOrders,
        totalOrders,
        previousTotalOrders,
        orderStatusCounts,
        paymentStatusCounts,
        topProducts,
        salesByCategory,
    ] = await Promise.all([
        Order.find({
            ...revenueMatch,
            ...currentDateMatch,
        }).select("subtotal items createdAt").sort({ createdAt: 1 }).lean(),

        Order.find({
            ...revenueMatch,
            ...previousDateMatch,
        }).select("subtotal items").lean(),

        Order.countDocuments(currentDateMatch),
        Order.countDocuments(previousDateMatch),

        Order.aggregate([
            { $match: currentDateMatch },
            {
                $group: {
                    _id: "$orderStatus",
                    count: { $sum: 1 },
                },
            },
        ]),

        Order.aggregate([
            { $match: currentDateMatch },
            {
                $group: {
                    _id: "$paymentStatus",
                    count: { $sum: 1 },
                },
            },
        ]),

        Order.aggregate([
            {
                $match: {
                    ...revenueMatch,
                    ...currentDateMatch,
                },
            },
            { $unwind: "$items" },
            {
                $group: {
                    _id: { $ifNull: ["$items.product", "$items.name"] },
                    productId: { $first: "$items.product" },
                    name: { $first: "$items.name" },
                    image: { $first: "$items.image" },
                    quantity: { $sum: "$items.quantity" },
                    revenue: {
                        $sum: {
                            $multiply: [
                                "$items.price",
                                "$items.quantity",
                            ],
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productDoc",
                },
            },
            {
                $unwind: {
                    path: "$productDoc",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "productDoc.category",
                    foreignField: "_id",
                    as: "categoryDoc",
                },
            },
            {
                $unwind: {
                    path: "$categoryDoc",
                    preserveNullAndEmptyArrays: true,
                },
            },
            { $sort: { quantity: -1, revenue: -1 } },
            { $limit: 10 },
            {
                $project: {
                    _id: 0,
                    name: { $ifNull: ["$name", "$productDoc.name", "Unknown Product"] },
                    image: {
                        $ifNull: [
                            { $cond: [{ $eq: ["$productDoc.image", ""] }, null, "$productDoc.image"] },
                            "$image",
                            "",
                        ],
                    },
                    category: { $ifNull: ["$categoryDoc.name", "Uncategorized"] },
                    quantity: 1,
                    revenue: 1,
                },
            },
        ]),

        Order.aggregate([
            {
                $match: {
                    ...revenueMatch,
                    ...currentDateMatch,
                },
            },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "product",
                },
            },
            {
                $unwind: {
                    path: "$product",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "product.category",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $unwind: {
                    path: "$category",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $group: {
                    _id: {
                        $ifNull: ["$category.name", "Uncategorized"],
                    },
                    sales: {
                        $sum: {
                            $multiply: [
                                "$items.price",
                                "$items.quantity",
                            ],
                        },
                    },
                },
            },
            { $sort: { sales: -1 } },
            {
                $project: {
                    _id: 0,
                    name: "$_id",
                    sales: 1,
                },
            },
        ]),
    ]);

    const totalRevenue = currentRevenueOrders.reduce(
        (sum, order) => sum + order.subtotal,
        0
    );

    const previousRevenue = previousRevenueOrders.reduce(
        (sum, order) => sum + order.subtotal,
        0
    );

    const productsSold = currentRevenueOrders.reduce(
        (sum, order) => sum + order.items.reduce(
            (itemSum, item) => itemSum + item.quantity, 
            0
        ),
        0
    );

    const previousProductsSold = previousRevenueOrders.reduce(
        (sum, order) => sum + order.items.reduce(
            (itemSum, item) => itemSum + item.quantity,
            0
        ),
        0
    );

    const previousProductsSoldTotal = previousProductsSold;

    const paidDeliveredOrderCount = currentRevenueOrders.length;

    const averageOrderValue = paidDeliveredOrderCount > 0
                            ? totalRevenue / paidDeliveredOrderCount
                            : 0;

    const previousAverageOrderValue = previousRevenueOrders.length > 0
                                    ? previousRevenue / previousRevenueOrders.length
                                    : 0;

    const useMonthlyBuckets = period === "90" || period === "180" || period === "year";

    const bucketMap = new Map< string, { revenue: number; orders: number } >();

    currentRevenueOrders.forEach((order) => {
        const date = new Date(order.createdAt);

        const key = useMonthlyBuckets
            ? `${date.getFullYear()}-${String(
                  date.getMonth() + 1
              ).padStart(2, "0")}`
            : `${date.getFullYear()}-${String(
                  date.getMonth() + 1
              ).padStart(2, "0")}-${String(
                  date.getDate()
              ).padStart(2, "0")}`;

        const existing = bucketMap.get(key) || {
            revenue: 0,
            orders: 0,
        };

        existing.revenue += order.subtotal;
        existing.orders += 1;
        bucketMap.set(key, existing);
    });

    const revenueTrend: {
        label: string;
        revenue: number;
        orders: number;
    }[] = [];

    const cursor = new Date(start);
    if (useMonthlyBuckets) {
        cursor.setDate(1);
    }
    cursor.setHours(0, 0, 0, 0);

    while (cursor <= end) {
        const key = useMonthlyBuckets
            ? `${cursor.getFullYear()}-${String(
                  cursor.getMonth() + 1
              ).padStart(2, "0")}`
            : `${cursor.getFullYear()}-${String(
                  cursor.getMonth() + 1
              ).padStart(2, "0")}-${String(
                  cursor.getDate()
              ).padStart(2, "0")}`;

        const bucket = bucketMap.get(key);

        revenueTrend.push({
            label: useMonthlyBuckets
                ? cursor.toLocaleDateString("en", {
                      month: "short",
                      year: period === "year" ? "numeric" : undefined,
                  })
                : cursor.toLocaleDateString("en", {
                      month: "short",
                      day: "numeric",
                  }),
            revenue: bucket?.revenue || 0,
            orders: bucket?.orders || 0,
        });

        if (useMonthlyBuckets) {
            cursor.setDate(1);
            cursor.setMonth(cursor.getMonth() + 1);
        } else {
            cursor.setDate(cursor.getDate() + 1);
        }
    }

    const statusOrder = [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
    ];

    const paymentOrder = ["pending", "paid"];

    const orderStatusMap = new Map(
        orderStatusCounts.map((item) => [
            item._id,
            item.count,
        ])
    );

    const paymentStatusMap = new Map(
        paymentStatusCounts.map((item) => [
            item._id,
            item.count,
        ])
    );

    const orderStatusDistribution = statusOrder.map((status) => ({
        status,
        count: orderStatusMap.get(status) || 0,
    }));

    const paymentStatusDistribution = paymentOrder.map((status) => ({
        name: status === "paid" ? "Paid" : "Pending",
        count: paymentStatusMap.get(status) || 0,
    }));

    return {
        period,
        dateRange: {
            start: start.toISOString(),
            end: end.toISOString(),
        },
        summary: {
            totalRevenue,
            totalOrders,
            productsSold,
            averageOrderValue,
            paidDeliveredOrderCount,
            revenueChange: getPercentageChange(
                totalRevenue,
                previousRevenue
            ),
            ordersChange: getPercentageChange(
                totalOrders,
                previousTotalOrders
            ),
            productsSoldChange: getPercentageChange(
                productsSold,
                previousProductsSoldTotal
            ),
            averageOrderValueChange: getPercentageChange(
                averageOrderValue,
                previousAverageOrderValue
            ),
        },
        revenueTrend,
        topProducts,
        salesByCategory,
        paymentStatusDistribution,
        orderStatusDistribution,
    };
};

// ACTIVITY

export const getAdminActivity = async () => {
    const [
        recentOrders,
        recentUsers,
        recentProducts,
        recentCategories,
    ] = await Promise.all([
        Order.find().sort({ 
            createdAt: -1
        }).limit(10).select("customerName total orderStatus createdAt").lean(),

        User.find({ role: "user" }).sort({
                createdAt: -1,
            }).limit(10).select("name email createdAt").lean(),

        Product.find().sort({
                createdAt: -1,
            }).limit(10).select("name price createdAt").lean(),

        Category.find().sort({
                createdAt: -1,
            }).limit(10).select("name createdAt").lean(),
    ]);

    const activities = [
        ...recentOrders.map(
            (order) => ({
                type: "order",
                title: "New order received",
                description: `${order.customerName} placed an order`,
                referenceId: order._id,
                amount: order.total,
                status: order.orderStatus,
                createdAt: order.createdAt,
            })
        ),

        ...recentUsers.map(
            (user) => ({
                type: "customer",
                title: "New customer registered",
                description: `${user.name} created an account`,
                referenceId: user._id,
                email: user.email,
                createdAt: user.createdAt,
            })
        ),

        ...recentProducts.map(
            (product) => ({
                type: "product",
                title: "New product added",
                description: product.name,
                referenceId: product._id,
                amount: product.price,
                createdAt: product.createdAt,
            })
        ),

        ...recentCategories.map(
            (category) => ({
                type: "category",
                title: "New category added",
                description: category.name,
                referenceId: category._id,
                createdAt: category.createdAt,
            })
        ),
    ];

    activities.sort(
        (a, b) => new Date( b.createdAt ).getTime() - new Date(a.createdAt).getTime()
    );

    return activities.slice(0, 20);
};
