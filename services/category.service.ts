import Category from "@/models/Category";
import Product from "@/models/Product";
import AppError from "@/lib/AppError";
import type { CategoryInput } from "@/lib/validations";
import mongoose from "mongoose";

export async function createCategory(data: CategoryInput) {
    const existingCategory = await Category.findOne({
        name: {
            $regex: `^${data.name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            $options: "i",
        },
    });

    if (existingCategory) {
        throw new AppError(
            "A category with this name already exists",
            409
        );
    }

    try {
        return await Category.create({
            name: data.name,
            description: data.description,
            image: data.image,
        });
    } catch (error) {
        if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
            throw new AppError("A category with this name already exists", 409);
        }
        throw error;
    }
}

export async function getCategories() {
    return await Category.find().sort({
        createdAt: -1,
    });
}

export async function getCategoryById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid category ID", 400);
    }

    const category = await Category.findById(id);

    if (!category) {
        throw new AppError("Category not found", 404);
    }

    return category;
}

export async function updateCategory(
    id: string,
    data: CategoryInput
) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid category ID", 400);
    }

    const category = await Category.findById(id);

    if (!category) {
        throw new AppError("Category not found", 404);
    }

    const existingCategory = await Category.findOne({
        name: {
            $regex: `^${data.name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            $options: "i",
        },
        _id: { $ne: id },
    });

    if (existingCategory) {
        throw new AppError(
            "A category with this name already exists",
            409
        );
    }

    category.name = data.name;
    category.description = data.description;
    category.image = data.image;

    try {
        await category.save();
    } catch (error) {
        if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
            throw new AppError("A category with this name already exists", 409);
        }
        throw error;
    }

    return category;
}

export async function deleteCategory(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid category ID", 400);
    }

    const category = await Category.findById(id);

    if (!category) {
        throw new AppError("Category not found", 404);
    }

    const productsUsingCategory = await Product.countDocuments({
        category: id,
    });

    if (productsUsingCategory > 0) {
        throw new AppError(
            "Cannot delete a category that has products",
            400
        );
    }

    await Category.findByIdAndDelete(id);

    return {
        id,
        name: category.name,
    };
}
