import { NextRequest } from "next/server";
import { requireAuth } from "@/middleware/auth";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";
import AppError from "@/lib/AppError";
import { getWishlist, addToWishlist, removeFromWishlist } from "@/services/wishlist.service";

export async function getWishlistController() {
    try {
        const user = await requireAuth();

        const wishlist = await getWishlist(user.userId);

        return successResponse(
            { wishlist },
            "Wishlist retrieved successfully"
        );
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(
                error.message,
                error.statusCode
            );
        }

        console.error("Get wishlist error:", error);

        return errorResponse(
            "Unable to retrieve wishlist",
            500
        );
    }
}

export async function addToWishlistController( req: NextRequest ) {
    try {
        const user = await requireAuth();

        const body = await req.json();

        const { productId } = body;

        if (!productId) {
            return errorResponse(
                "Product ID is required",
                400
            );
        }

        const wishlist = await addToWishlist(
            user.userId,
            productId
        );

        return successResponse(
            { wishlist },
            "Product added to wishlist",
            201
        );
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(
                error.message,
                error.statusCode
            );
        }

        console.error("Add to wishlist error:", error);

        return errorResponse(
            "Unable to add product to wishlist",
            500
        );
    }
}

export async function removeFromWishlistController( req: NextRequest ) {
    try {
        const user = await requireAuth();

        const body = await req.json();

        const { productId } = body;

        if (!productId) {
            return errorResponse(
                "Product ID is required",
                400
            );
        }

        const wishlist = await removeFromWishlist(
            user.userId,
            productId
        );

        return successResponse(
            { wishlist },
            "Product removed from wishlist"
        );
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(
                error.message,
                error.statusCode
            );
        }

        console.error(
            "Remove from wishlist error:",
            error
        );

        return errorResponse(
            "Unable to remove product from wishlist",
            500
        );
    }
}