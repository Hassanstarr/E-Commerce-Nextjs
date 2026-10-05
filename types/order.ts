export type OrderItem = {
    product: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
};

export type ShippingAddress = {
    address: string;
    city: string;
    postalCode: string;
};

export type CheckoutInput = {
    customerName: string;
    customerEmail: string;
    confirmEmail: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    paymentMethod: "cod";
};

export type CreateOrderInput = {
    customerName: string;
    customerEmail: string;
    phone: string;
    shippingAddress: ShippingAddress;
    paymentMethod: "cod";
};

export type Order = {
    _id: string;
    user: string;
    items: OrderItem[];
    customerName: string;
    customerEmail: string;
    phone: string;
    shippingAddress: ShippingAddress;
    subtotal: number;
    deliveryFee: number;
    total: number;
    paymentMethod: "cod";
    paymentStatus: "pending" | "paid";
    orderStatus:
        | "pending"
        | "confirmed"
        | "shipped"
        | "delivered"
        | "cancelled";
    createdAt: string;
    updatedAt: string;
};