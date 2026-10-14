import ActivityLog from "@/models/ActivityLog";
import User from "@/models/User";

interface CreateActivityParams {
    user?: string;
    action: string;
    entityType:
        | "order"
        | "product"
        | "category"
        | "customer"
        | "user"
        | "system";
    entityId?: string;
    description: string;
    metadata?: Record<
        string,
        any
    >;
}

export const createActivityLog = async ({
    user,
    action,
    entityType,
    entityId,
    description,
    metadata = {},
}: CreateActivityParams) => {
    return ActivityLog.create({
        user,
        action,
        entityType,
        entityId,
        description,
        metadata,
    });
};


export const getActivityLogs = async ({
    page = 1,
    limit = 20,
    type = "",
    search = "",
}: {
    page?: number;
    limit?: number;
    type?: string;
    search?: string;
}) => {
    page = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
    limit = Number.isFinite(limit) ? Math.min(100, Math.max(1, Math.floor(limit))) : 20;
    
    const query: any = {};

    if (type) {
        query.entityType = type === "customer" ? { $in: ["customer", "user"] } : type;
    }

    if (search.trim()) {
        const searchValue = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const searchRegex = { $regex: searchValue, $options: "i" };
        const users = await User.find({
            $or: [{ name: searchRegex }, { email: searchRegex }],
        }).select("_id").lean();

        query.$or = [
            { action: { $regex: searchValue.replace(/\s+/g, "[ _]+"), $options: "i" } },
            { description: searchRegex },
            { user: { $in: users.map((user) => user._id) } },
            {
                $expr: {
                    $regexMatch: {
                        input: { $convert: { input: "$entityId", to: "string", onError: "", onNull: "" } },
                        regex: searchValue,
                        options: "i",
                    },
                },
            },
        ];

        if (new RegExp(searchValue, "i").test("System")) {
            query.$or.push({ user: null });
        }
    }

    const skip = (page - 1) * limit;

    const [ activities, total, counts ] = await Promise.all([
        ActivityLog.find(query)
            .populate(
                "user",
                "name email"
            )
            .sort({
                createdAt: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean(),

        ActivityLog.countDocuments(
            query
        ),

        ActivityLog.aggregate([
            { $group: { _id: "$entityType", count: { $sum: 1 } } },
        ]),
    ]);

    return {
        activities,
        summary: {
            total: counts.reduce((sum, item) => sum + item.count, 0),
            orders: counts.find((item) => item._id === "order")?.count || 0,
            products: counts.find((item) => item._id === "product")?.count || 0,
            customers: counts.filter((item) => ["customer", "user"].includes(item._id)).reduce((sum, item) => sum + item.count, 0),
        },
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(
                total / limit
            ),
        },
    };
};
