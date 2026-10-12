import { notFound } from "next/navigation";
import CategoriesView, { Category } from "@/components/admin/CategoriesView";
import CategoryEditModal from "@/components/admin/CategoryEditModal";

type Product = {
    _id: string;
    category?: {
        _id: string;
        name: string;
    };
};

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

async function getCategory(id: string): Promise<Category | null> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/categories/${id}`,
        {
            cache: "no-store",
        }
    );

    if (response.status === 404) {
        return null;
    }

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to fetch category"
        );
    }

    return result.data.category;
}

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

export default async function EditCategoryPage({ params }: PageProps) {
    const { id } = await params;

    const [category, categories, products] = await Promise.all([
        getCategory(id),
        getCategories(),
        getProducts(),
    ]);

    if (!category) {
        notFound();
    }

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
        <>
            <CategoriesView
                categories={categories}
                productCounts={productCounts}
            />
            <CategoryEditModal
                category={{
                    _id: category._id,
                    name: category.name,
                    description: category.description || "",
                    image: category.image || "",
                }}
            />
        </>
    );
}