import Link from "next/link";
import CategoryTable from "@/components/admin/CategoryTable";

type Category = {
    _id: string;
    name: string;
    description?: string;
    image?: string;
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

export default async function AdminCategoriesPage() {
    const categories = await getCategories();

    return (
        <section className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <main className="mx-auto max-w-7xl px-4 py-12">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Categories
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Manage product categories.
                        </p>
                    </div>

                    <Link
                        href="/admin/categories/add"
                        className="self-start rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        Add Category
                    </Link>
                </div>

                <CategoryTable categories={categories} />
            </main>
        </section>
    );
}