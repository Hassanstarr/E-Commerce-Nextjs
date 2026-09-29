import Category from "@/models/Category";
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