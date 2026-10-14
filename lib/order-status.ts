import type { Order } from "@/types/order";

type OrderStatus = Order["orderStatus"];

const orderStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
};

export function canChangeOrderStatus(
    currentStatus: string,
    nextStatus: string,
    paymentStatus: string
) {
    if (currentStatus === nextStatus) return true;
    if (nextStatus === "cancelled" && paymentStatus === "paid") return false;

    return orderStatusTransitions[currentStatus as OrderStatus]?.includes(nextStatus as OrderStatus) || false;
}

export function canChangePaymentStatus(
    currentStatus: string,
    nextStatus: string,
    orderStatus: string
) {
    if (currentStatus === nextStatus) return true;

    return currentStatus === "pending" && nextStatus === "paid" && orderStatus === "delivered";
}
