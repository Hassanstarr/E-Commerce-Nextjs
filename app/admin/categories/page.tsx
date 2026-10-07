import Link from "next/link";
import CategoryTable from "@/components/admin/CategoryTable";

type Category = {
    _id: string;
    name: string;
    description?: string;
    image?: string;
};

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
        <section className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
            <main className="mx-auto max-w-7xl">

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="mb-2 text-sm font-medium text-gray-500">
                            Store Management
                        </p>

                        <h1 className="text-3xl font-bold text-gray-900">
                            Categories
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Manage categories used throughout your store.
                        </p>
                    </div>

                    <Link
                        href="/admin/categories/add"
                        className="inline-flex w-fit items-center justify-center rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        + Add Category
                    </Link>
                </div>

                <div className="mb-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Categories
                        </p>

                        <p className="mt-2 text-2xl font-bold text-gray-900">
                            {categories.length}
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Products
                        </p>

                        <p className="mt-2 text-2xl font-bold text-gray-900">
                            {products.length}
                        </p>
                    </div>
                </div>

                <CategoryTable
                    categories={categories}
                    productCounts={productCounts}
                />
            </main>
        </section>
    );
}