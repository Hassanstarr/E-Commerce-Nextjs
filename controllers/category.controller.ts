import { NextRequest } from "next/server";
import { categorySchema } from "@/lib/validations";
import { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory } from "@/services/category.service";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";
import AppError from "@/lib/AppError";
import { requireAdmin } from "@/middleware/admin";
import { createActivityLog } from "@/services/activity.service";

export async function createCategoryController( req: NextRequest ) {
    try {
        const admin = await requireAdmin();

        const body = await req.json();

        const validation = categorySchema.safeParse(body);

        if (!validation.success) {
            return errorResponse(
                validation.error.issues
                    .map((issue) => issue.message)
                    .join(", "),
                400
            );
        }

        const category = await createCategory(validation.data);

        await createActivityLog({
            user: admin.userId,
            action: "create_category",
            entityType: "category",
            entityId: category._id.toString(),
            description: `Category "${category.name}" was created`,
        });

        return successResponse(
            {
                category,
            },
            "Category created successfully",
            201
        );
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(
                error.message,
                error.statusCode
            );
        }

        console.error("Create category error:", error);

        return errorResponse(
            "Unable to create category"
        );
    }
}

export async function getCategoriesController() {
    try {
        const categories = await getCategories();

        return successResponse(
            {
                categories,
            },
            "Categories retrieved successfully"
        );
    } catch (error) {
        console.error("Get categories error:", error);

        return errorResponse(
            "Unable to retrieve categories"
        );
    }
}

export async function getCategoryController( id: string ) {
    try {
        const category = await getCategoryById(id);

        return successResponse(
            {
                category,
            },
            "Category retrieved successfully"
        );
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(
                error.message,
                error.statusCode
            );
        }

        console.error("Get category error:", error);

        return errorResponse(
            "Unable to retrieve category"
        );
    }
}

export async function updateCategoryController( req: NextRequest, id: string ) {
    try {
        const admin = await requireAdmin();

        const body = await req.json();

        const validation = categorySchema.safeParse(body);

        if (!validation.success) {
            return errorResponse(
                "Validation failed",
                400,
                validation.error.flatten().fieldErrors
            );
        }

        const category = await updateCategory(
            id,
            validation.data
        );

        await createActivityLog({
            user: admin.userId,
            action: "update_category",
            entityType: "category",
            entityId: category._id.toString(),
            description: `Category "${category.name}" was updated`,
        });

        return successResponse(
            {
                category,
            },
            "Category updated successfully"
        );
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(
                error.message,
                error.statusCode
            );
        }

        console.error("Update category error:", error);

        return errorResponse(
            "Unable to update category"
        );
    }
}

export async function deleteCategoryController( id: string ) {
    try {
        const admin = await requireAdmin();

        const result = await deleteCategory(id);

        await createActivityLog({
            user: admin.userId,
            action: "create_category",
            entityType: "category",
            entityId: id,
            description:`Category was deleted`,
        });

        return successResponse(
            result,
            "Category deleted successfully"
        );
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(
                error.message,
                error.statusCode
            );
        }

        console.error("Delete category error:", error);

        return errorResponse(
            "Unable to delete category"
        );
    }
}