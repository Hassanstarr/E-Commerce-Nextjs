import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import Category from "@/models/Category";
import OrderHistory from "@/models/OrderHistory";
import { createActivityLog } from "./activity.service";


//DASHBOARD

export const getAdminDashboardData = async () => {
    const [
        totalOrders,
        totalCustomers,
        deliveredOrders,
        recentOrders,
        lowStockProducts,
        pendingOrders,
        confirmedOrders,
        shippedOrders,
        deliveredOrderCount,
        cancelledOrders,
    ] = await Promise.all([
        Order.countDocuments(),

        User.countDocuments(),

        Order.find({
            orderStatus: "delivered",
            paymentStatus: "paid",
        }).lean(),

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

    const totalRevenue = deliveredOrders.reduce((sum, order) =>
            sum + order.total,
            0
        );

    const productsSold = deliveredOrders.reduce((sum, order) => {
                return (
                    sum + order.items.reduce(
                        (itemSum, item) =>
                        itemSum + item.quantity,
                        0
                    )
                );
            },
            0
        );

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

        recentOrders,
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
        const searchRegex = {
            $regex: search.trim(),
            $options: "i",
        };

        query.$or = [
            {
                customerName: searchRegex,
            },
            {
                customerEmail: searchRegex,
            },
        ];

        if (/^[0-9a-fA-F]{24}$/.test(search.trim())) {
            query.$or.push({
                _id: search.trim(),
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
        orders,
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
    if (orderStatus === undefined && paymentStatus === undefined) {
        const error: any = new Error(
            "No update data provided"
        );

        error.statusCode = 400;

        throw error;
    }

    if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
        const error: any = new Error(
            "Invalid order status"
        );

        error.statusCode = 400;

        throw error;
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
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

    const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                $set: updateData,
            },
            {
                new: true,
                runValidators: true,
            }
        ).lean();

    if (!updatedOrder) {
        const error: any = new Error(
            "Order not found"
        );

        error.statusCode = 404;

        throw error;
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
            },
        });
    }

    if ( orderStatus && orderStatus !== previousStatus ) {
        await OrderHistory.create({
            order: orderId,
            status: orderStatus,
            changedBy,
            note,
        });

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

    return updatedOrder;
};


export const getAdminOrderHistory = async ( orderId: string ) => {
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
    const query: any = {
        role: "user",
    };

    if (search.trim()) {
        const searchRegex = {
            $regex: search.trim(),
            $options: "i",
        };

        query.$or = [
            {
                name: searchRegex,
            },
            {
                email: searchRegex,
            },
        ];
    }

    const skip = (page - 1) * limit;

    const [customers, totalCustomers] =
        await Promise.all([
            User.find(query)
                .select("-password")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            User.countDocuments(query),
        ]);

    const customerIds = customers.map(
        (customer) => customer._id
    );

    const orderStats = await Order.aggregate([
            {
                $match: {
                    user: {
                        $in: customerIds,
                    },
                },
            },
            {
                $group: {
                    _id: "$user",
                    totalOrders: {
                        $sum: 1,
                    },
                    totalSpent: {
                        $sum: "$total",
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

    const customersWithStats = customers.map((customer) => {
            const stats = statsMap.get(
                customer._id.toString()
            );

            return {
                ...customer,
                totalOrders: stats?.totalOrders || 0,
                totalSpent: stats?.totalSpent || 0,
            };
        });

    return {
        customers: customersWithStats,
        pagination: {
            page,
            limit,
            total: totalCustomers,
            totalPages: Math.ceil(
                totalCustomers / limit
            ),
        },
    };
};


// CUSTOMER DETAILS

export const getAdminCustomerById = async ( customerId: string ) => {
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

    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

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

export const getAdminAnalytics = async () => {
    const deliveredOrders =
        await Order.find({
            orderStatus: "delivered",
        }).select("total items createdAt").sort({ createdAt: 1 }).lean();

    const totalRevenue =deliveredOrders.reduce((sum, order) => sum + order.total, 0);

    const totalOrders = deliveredOrders.length;

    const productsSold = deliveredOrders.reduce(
            (sum, order) => sum + order.items.reduce((itemSum, item) =>
                    itemSum + item.quantity,
                    0
                ),
            0
        );

    // MONTHLY REVENUE

    const monthlyMap =
        new Map<
            string,
            {
                revenue: number;
                orders: number;
            }
        >();

    deliveredOrders.forEach((order) => {
        const date = new Date(
            order.createdAt
        );

        const monthKey = `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;

        const existing = monthlyMap.get(monthKey) || {
                revenue: 0,
                orders: 0,
            };

        existing.revenue += order.total;

        existing.orders += 1;

        monthlyMap.set(
            monthKey,
            existing
        );
    });

    const monthlyRevenue = Array.from(
            monthlyMap.entries()
        ).map(
            ([
                month,
                data,
            ]) => ({
                month,
                revenue:
                    data.revenue,
                orders:
                    data.orders,
            })
        );

    // TOP PRODUCTS

    const productMap =
        new Map<
            string,
            {
                name: string;
                quantity: number;
                revenue: number;
            }
        >();

    deliveredOrders.forEach((order) => {
        order.items.forEach((item) => {
            const productName = item.name;

            const existing = productMap.get(
                    productName
                ) || {
                    name: productName,
                    quantity: 0,
                    revenue: 0,
                };

            existing.quantity += item.quantity;

            existing.revenue += item.price * item.quantity;

            productMap.set(
                productName,
                existing
            );
        });
    });

    const topProducts = Array.from(
            productMap.values()
        ).sort((a, b) => b.quantity - a.quantity).slice(0, 10);

    // ORDER STATUS DISTRIBUTION

    const statusCounts =
        await Order.aggregate([
            {
                $group: {
                    _id: "$orderStatus",
                    count: {
                        $sum: 1,
                    },
                },
            },
        ]);

    const orderStatusDistribution =
        statusCounts.map(
            (item) => ({
                status: item._id,
                count: item.count,
            })
        );

    return {
        summary: {
            totalRevenue,
            totalOrders,
            productsSold,
        },

        monthlyRevenue,

        topProducts,

        orderStatusDistribution,
    };
};


// ACTIVITY

export const getAdminActivity =
    async () => {
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