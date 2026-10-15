import { apiRequest } from "@/lib/api";
import type { CheckoutInput, Order } from "@/types/order";

export async function createStripeCheckout(data: CheckoutInput, requestId: string) {
    return apiRequest<{ data: { url: string } }>("/api/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({ ...data, requestId }),
    });
}

export async function verifyCheckoutEmail(email: string, otp?: string) {
    return apiRequest<{
        success: boolean;
        message: string;
        data: { verified: boolean };
    }>("/api/checkout/verify-email", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
    });
}

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
