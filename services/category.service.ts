import Category from "@/models/Category";
import Product from "@/models/Product";
import AppError from "@/lib/AppError";
import type { CategoryInput } from "@/lib/validations";

export async function createCategory(data: CategoryInput) {
    const existingCategory = await Category.findOne({
        name: data.name,
    });

    if (existingCategory) {
        throw new AppError(
            "A category with this name already exists",
            409
        );
    }

    const category = await Category.create({
        name: data.name,
        description: data.description,
        image: data.image,
    });

    return category;
}

export async function getCategories() {
    return await Category.find().sort({
        createdAt: -1,
    });
}

export async function getCategoryById(id: string) {
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
    const category = await Category.findById(id);

    if (!category) {
        throw new AppError("Category not found", 404);
    }

    const existingCategory = await Category.findOne({
        name: data.name,
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

    await category.save();

    return category;
}

export async function deleteCategory(id: string) {
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
    };
}