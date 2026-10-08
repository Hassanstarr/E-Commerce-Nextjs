import { NextRequest } from "next/server";
import { productSchema } from "@/lib/validations";
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from "@/services/product.service";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";
import AppError from "@/lib/AppError";
import { requireAdmin } from "@/middleware/admin";
import { createActivityLog } from "@/services/activity.service";


export async function createProductController(req: NextRequest) {
    try {
        const admin = await requireAdmin();

        const body = await req.json();

        const validation = productSchema.safeParse(body);

        if (!validation.success) {
            return errorResponse(
                validation.error.issues
                    .map((issue) => issue.message)
                    .join(", "),
                400
            );
        }

        const product = await createProduct(validation.data);

        await createActivityLog({
            user: admin.userId,
            action: "create_product",
            entityType: "product",
            entityId: product._id.toString(),
            description:
                `Product "${product.name}" was created`,
        });

        return successResponse(
            {
                product,
            },
            "Product created successfully",
            201
        );
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(
                error.message,
                error.statusCode
            );
        }

        console.error("Create product error:", error);

        return errorResponse(
            "Unable to create product"
        );
    }
}

export async function getProductsController(req: NextRequest) {
    try {
        const categoryId = req.nextUrl.searchParams.get("category") || undefined;

        const products = await getProducts(categoryId);

        return successResponse(
            { products },
            "Products retrieved successfully"
        );
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(error.message, error.statusCode);
        }

        console.error("Get products error:", error);

        return errorResponse("Unable to retrieve products");
    }
}

export async function getProductController(id: string) {
    try {
        const product = await getProductById(id);

        return successResponse(
            {
                product,
            },
            "Product retrieved successfully"
        );
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(
                error.message,
                error.statusCode
            );
        }

        console.error("Get product error:", error);

        return errorResponse(
            "Unable to retrieve product"
        );
    }
}

export async function updateProductController( req: NextRequest, id: string ) {
    try {
        const admin = await requireAdmin();

        const body = await req.json();

        const validation = productSchema.safeParse(body);

        if (!validation.success) {
            return errorResponse(
                "Validation failed",
                400,
                validation.error.flatten().fieldErrors
            );
        }

        const product = await updateProduct(
            id,
            validation.data
        );

        await createActivityLog({
            user: admin.userId,
            action: "update_product",
            entityType: "product",
            entityId: product._id.toString(),
            description: `Product "${product.name}" was updated`,
        });

        return successResponse(
            {
                product,
            },
            "Product updated successfully"
        );
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(
                error.message,
                error.statusCode
            );
        }

        console.error("Update product error:", error);

        return errorResponse(
            "Unable to update product"
        );
    }
}

export async function deleteProductController( id: string ) {
    try {
        const admin = await requireAdmin();

        const result = await deleteProduct(id);

        await createActivityLog({
            user: admin.userId,
            action: "delete_product",
            entityType: "product",
            entityId: id,
            description: `Product was deleted`,
        });

        return successResponse(
            result,
            "Product deleted successfully"
        );
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(
                error.message,
                error.statusCode
            );
        }

        console.error("Delete product error:", error);

        return errorResponse(
            "Unable to delete product"
        );
    }
}