import { apiRequest } from "@/lib/api";
import type { ProductInput } from "@/types";
import type { CategoryInput } from "@/types";

export async function createAdminProduct( product: ProductInput ) {
    return apiRequest("/api/products", {
        method: "POST",
        body: JSON.stringify(product),
    });
}

export async function updateAdminProduct( productId: string, product: ProductInput ) {
    return apiRequest(`/api/products/${productId}`, {
        method: "PUT",
        body: JSON.stringify(product),
    });
}

export async function deleteAdminProduct( productId: string ) {
    return apiRequest(`/api/products/${productId}`, {
        method: "DELETE",
    });
}

export async function createAdminCategory( category: CategoryInput ) {
    return apiRequest("/api/categories", {
        method: "POST",
        body: JSON.stringify(category),
    });
}

export async function updateAdminCategory( categoryId: string, category: CategoryInput ) {
    return apiRequest(`/api/categories/${categoryId}`, {
        method: "PUT",
        body: JSON.stringify(category),
    });
}

export async function deleteAdminCategory( categoryId: string ) {
    return apiRequest(`/api/categories/${categoryId}`, {
        method: "DELETE",
    });
}