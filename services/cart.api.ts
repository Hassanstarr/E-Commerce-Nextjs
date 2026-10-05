import { apiRequest } from "@/lib/api";
import type { Cart } from "@/types/cart";

export async function getCart() {
    const result = await apiRequest<{
        success: boolean;
        message: string;
        data: {
            cart: Cart;
        };
    }>("/api/cart", { cache: "no-store" });

    return result.data.cart;
}

export async function addToCart( productId: string, quantity = 1 ) {
    const result = await apiRequest<{
        success: boolean;
        message: string;
        data: {
            cart: Cart;
        };
    }>("/api/cart", {
        method: "POST",
        body: JSON.stringify({
            productId,
            quantity,
        }),
    });

    return result.data.cart;
}

export async function updateCartItem( productId: string, quantity: number ) {
    const result = await apiRequest<{
        success: boolean;
        message: string;
        data: {
            cart: Cart;
        };
    }>("/api/cart/item", {
        method: "PUT",
        body: JSON.stringify({
            productId,
            quantity,
        }),
    });

    return result.data.cart;
}

export async function removeFromCart(productId: string) {
    const result = await apiRequest<{
        success: boolean;
        message: string;
        data: {
            cart: Cart;
        };
    }>("/api/cart/item", {
        method: "DELETE",
        body: JSON.stringify({
            productId,
        }),
    });

    return result.data.cart;
}

export async function clearCart() {
    const result = await apiRequest<{
        success: boolean;
        message: string;
        data: {
            cart: Cart;
        };
    }>("/api/cart", {
        method: "DELETE",
    });

    return result.data.cart;
}