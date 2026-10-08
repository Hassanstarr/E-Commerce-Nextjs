import ActivityLog from "@/models/ActivityLog";

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
}: {
    page?: number;
    limit?: number;
    type?: string;
}) => {
    
    const query: any = {};

    if (type) {
        query.entityType = type;
    }

    const skip = (page - 1) * limit;

    const [ activities, total ] = await Promise.all([
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
    ]);

    return {
        activities,
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