import { apiRequest } from "@/lib/api";
import type { CheckoutInput, MyOrdersData, Order } from "@/types/order";

export async function getMyOrders(page = 1, signal?: AbortSignal) {
    return apiRequest<{ data: MyOrdersData }>(`/api/orders?page=${page}`, {
        method: "GET",
        cache: "no-store",
        signal,
    });
}

export async function createStripeCheckout(data: CheckoutInput, requestId: string) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);
    try {
        return await apiRequest<{ data: { url: string } }>("/api/stripe/checkout", {
            method: "POST",
            body: JSON.stringify({ ...data, requestId }),
            signal: controller.signal,
        });
    } catch (error) {
        if (controller.signal.aborted) {
            throw new Error("Opening Stripe took too long. Please try again; retrying this payment request will not create a duplicate checkout.");
        }
        throw error;
    } finally {
        clearTimeout(timer);
    }
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