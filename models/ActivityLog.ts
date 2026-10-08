import mongoose, { Schema } from "mongoose";

const activityLogSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false,
            index: true,
        },

        action: {
            type: String,
            required: true,
            trim: true,
        },

        entityType: {
            type: String,
            required: true,
            enum: [
                "order",
                "product",
                "category",
                "customer",
                "user",
                "system",
            ],
        },

        entityId: {
            type: Schema.Types.ObjectId,
            required: false,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

activityLogSchema.index({
    createdAt: -1,
});

activityLogSchema.index({
    entityType: 1,
    entityId: 1,
});

const ActivityLog = mongoose.models.ActivityLog || mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;