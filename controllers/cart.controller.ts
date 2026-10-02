import { NextRequest } from "next/server";
import { requireAuth } from "@/middleware/auth";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";
import AppError from "@/lib/AppError";
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from "@/services/cart.service";

export async function getCartController() {
    try {
        const user = await requireAuth();

        const cart = await getCart(user.userId);

        return successResponse(
            { cart },
            "Cart retrieved successfully"
        );
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(
                error.message,
                error.statusCode
            );
        }

        console.error("Get cart error:", error);

        return errorResponse(
            "Unable to retrieve cart",
            500
        );
    }
}

export async function addToCartController(req: NextRequest) {
    try {
        const user = await requireAuth();

        const body = await req.json();

        const { productId, quantity } = body;

        if (!productId || quantity === undefined) {
            return errorResponse(
                "Product ID and quantity are required",
                400
            );
        }

        const cart = await addToCart(
            user.userId,
            productId,
            Number(quantity)
        );

        return successResponse(
            { cart },
            "Product added to cart",
            201
        );
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(
                error.message,
                error.statusCode
            );
        }

        console.error("Add to cart error:", error);

        return errorResponse(
            "Unable to add product to cart",
            500
        );
    }
}

export async function updateCartController(req: NextRequest) {
    try {
        const user = await requireAuth();

        const body = await req.json();

        const { productId, quantity } = body;

        if (!productId || quantity === undefined) {
            return errorResponse(
                "Product ID and quantity are required",
                400
            );
        }

        const cart = await updateCartItem(
            user.userId,
            productId,
            Number(quantity)
        );

        return successResponse(
            { cart },
            "Cart updated successfully"
        );
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(
                error.message,
                error.statusCode
            );
        }

        console.error("Update cart error:", error);

        return errorResponse(
            "Unable to update cart",
            500
        );
    }
}

export async function removeFromCartController(req: NextRequest) {
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

        const cart = await removeFromCart(
            user.userId,
            productId
        );

        return successResponse(
            { cart },
            "Product removed from cart"
        );
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(
                error.message,
                error.statusCode
            );
        }

        console.error("Remove from cart error:", error);

        return errorResponse(
            "Unable to remove product from cart",
            500
        );
    }
}

export async function clearCartController() {
    try {
        const user = await requireAuth();

        const cart = await clearCart(user.userId);

        return successResponse(
            { cart },
            "Cart cleared successfully"
        );
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(
                error.message,
                error.statusCode
            );
        }

        console.error("Clear cart error:", error);

        return errorResponse(
            "Unable to clear cart",
            500
        );
    }
}