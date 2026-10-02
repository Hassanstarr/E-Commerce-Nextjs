export type CartProduct = {
    _id: string;
    name: string;
    price: number;
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