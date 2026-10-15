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
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    paymentMethod: "cod" | "stripe";
};

export type CreateOrderInput = {
    customerName: string;
    customerEmail: string;
    phone: string;
    shippingAddress: ShippingAddress;
    paymentMethod: "cod" | "stripe";
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
    paymentMethod: "cod" | "stripe";
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
