import mongoose, { Document, Model } from "mongoose";

export interface ICategory extends Document {
    name: string;
    description?: string;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

const categorySchema = new mongoose.Schema<ICategory>(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            unique: true,
            trim: true,
            minlength: [2, "Category name must contain at least 2 characters"],
            maxlength: [50, "Category name cannot exceed 50 characters"],
        },

        description: {
            type: String,
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters"],
        },

        image: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

categorySchema.index(
    { name: 1 },
    { name: "category_name_case_insensitive", unique: true, collation: { locale: "en", strength: 2 } }
);

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema);

export default Category;
