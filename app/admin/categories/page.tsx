import CategoriesView, { Category } from "@/components/admin/CategoriesView";

type Product = {
    _id: string;
    category?: {
        _id: string;
        name: string;
    };
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

export default async function AdminCategoriesPage() {
    const [categories, products] = await Promise.all([
        getCategories(),
        getProducts(),
    ]);

    const productCounts = products.reduce<Record<string, number>>(
        (counts, product) => {
            if (product.category?._id) {
                counts[product.category._id] =
                    (counts[product.category._id] || 0) + 1;
            }

            return counts;
        },
        {}
    );

    return (
        <CategoriesView
            categories={categories}
            productCounts={productCounts}
        />
    );
}