import ProductsView, { Product } from "@/components/admin/ProductsView";
import ProductAddModal from "@/components/admin/ProductAddModal";

type Category = {
    _id: string;
    name: string;
};

async function getCategories(): Promise<Category[]> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/categories`,
        {
            cache: "no-store",
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to fetch categories"
        );
    }

    return result.data.categories;
}

async function getProducts(): Promise<Product[]> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/products`,
        {
            cache: "no-store",
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to fetch products"
        );
    }

    return result.data.products;
}

export default async function AddProductPage() {
    const [categories, products] = await Promise.all([
        getCategories(),
        getProducts(),
    ]);

    return (
        <>
            <ProductsView products={products} />
            <ProductAddModal categories={categories} />
        </>
    );
}