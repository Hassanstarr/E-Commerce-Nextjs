import type { Order } from "@/types/order";

type OrderStatus = Order["orderStatus"];

const orderStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["pending", "shipped", "cancelled"],
    shipped: ["confirmed", "delivered", "cancelled"],
    delivered: ["shipped", "cancelled"],
    cancelled: [],
};

export function canChangeOrderStatus(
    currentStatus: string,
    nextStatus: string,
    statusBeforeCancellation?: string
) {
    if (currentStatus === nextStatus) return true;
    if (currentStatus === "cancelled") {
        return Boolean(statusBeforeCancellation) && nextStatus === statusBeforeCancellation;
    }

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
