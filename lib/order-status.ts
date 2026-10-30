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
    statusBeforeCancellation?: string,
    paymentStatus = "pending"
) {
    if (currentStatus === nextStatus) return true;
    if (paymentStatus === "refunded" || paymentStatus === "refund_pending") return nextStatus === "cancelled";
    if (currentStatus === "cancelled") {
        return Boolean(statusBeforeCancellation) && nextStatus === statusBeforeCancellation;
    }

    const stages = ["pending", "confirmed", "shipped", "delivered"];
    if (paymentStatus === "paid" && nextStatus !== "cancelled" && stages.indexOf(nextStatus) < stages.indexOf(currentStatus)) return false;

    return orderStatusTransitions[currentStatus as OrderStatus]?.includes(nextStatus as OrderStatus) || false;
}

export function canChangePaymentStatus(
    currentStatus: string,
    nextStatus: string,
    orderStatus: string,
    paymentMethod = "cod"
) {
    if (currentStatus === nextStatus) return true;

    if (paymentMethod !== "cod") return false;
    if (currentStatus === "paid" && nextStatus === "refunded") return orderStatus === "cancelled";
    return currentStatus === "pending" && nextStatus === "paid" && orderStatus === "delivered";
}

export function cancellationRestoresStock(status: string) {
    return status === "pending" || status === "confirmed";
}
