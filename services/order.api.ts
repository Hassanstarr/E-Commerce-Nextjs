import { apiRequest } from "@/lib/api";
import type { CheckoutInput, Order } from "@/types/order";

export async function createOrder(data: CheckoutInput) {
    return apiRequest<{ 
        success: boolean;
        message: string;
        data: { 
            orderId: string; 
            order: Order; 
        }; 
    }>("/api/orders", { 
            method: "POST", 
            body: JSON.stringify(data), 
        }
    ); 
}