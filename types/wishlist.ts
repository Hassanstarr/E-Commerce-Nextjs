export type WishlistProduct = {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    stock: number;
    category?: {
        _id: string;
        name: string;
    };
};

export type Wishlist = {
    _id: string | null;
    products: WishlistProduct[];
};