import { apiRequest } from "@/lib/api";
import type { Wishlist } from "@/types/wishlist";

export async function getWishlist() {
    const result = await apiRequest<{
        success: boolean;
        message: string;
        data: {
            wishlist: Wishlist;
        };
    }>("/api/wishlist");

    return result.data.wishlist;
}

export async function addToWishlist(productId: string) {
    const result = await apiRequest<{
        success: boolean;
        message: string;
        data: {
            wishlist: Wishlist;
        };
    }>("/api/wishlist", {
        method: "POST",
        body: JSON.stringify({ productId }),
    });

    return result.data.wishlist;
}

export async function removeFromWishlist( productId: string ) {
    const result = await apiRequest<{
        success: boolean;
        message: string;
        data: {
            wishlist: Wishlist;
        };
    }>("/api/wishlist/item", {
        method: "DELETE",
        body: JSON.stringify({ productId }),
    });

    return result.data.wishlist;
}