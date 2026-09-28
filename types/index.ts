export type UserRole = "user" | "admin";

export type ProductInput = {
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    stock: number;
};

export type CategoryInput = {
    name: string;
    description?: string;
    image?: string;
};