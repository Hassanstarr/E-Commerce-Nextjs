export type CartProduct = {
    _id: string;
    name: string;
    price: number;
    discountPercent?: number;
    discountAudience?: "all" | "members";
    memberDiscountPercent?: number;
    memberDiscountEndsAt?: string | null;
    discountEndsAt?: string | null;
    image: string;
    stock: number;
    category?: {
        _id: string;
        name: string;
    };
};

export type CartItem = {
    product: CartProduct;
    quantity: number;
};

export type Cart = {
    _id: string | null;
    items: CartItem[];
};
