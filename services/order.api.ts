import { apiRequest } from "@/lib/api";
import type { CreateOrderInput } from "@/types/order";

export async function createOrder( data: CreateOrderInput ) {
    return apiRequest<{
        success: boolean;
        message: string;
        data: {
            orderId: string;
            order: any;
        };
    }>("/api/orders", {
        method: "POST",
        body: JSON.stringify(data),
    });
}