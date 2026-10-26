export type UserRole = "user" | "member" | "admin";

export type ProductInput = {
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    stock: number;
    discountPercent?: number;
    discountEndsAt?: string | null;
};

export type CategoryInput = {
    name: string;
    description?: string;
    image?: string;
};
