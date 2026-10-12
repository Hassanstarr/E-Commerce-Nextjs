import Link from "next/link";
import CategoryTable from "@/components/admin/CategoryTable";

export type Category = {
    _id: string;
    name: string;
    description?: string;
    image?: string;
};

interface CategoriesViewProps {
    categories: Category[];
    productCounts: Record<string, number>;
}

export default function CategoriesView({
    categories,
    productCounts,
}: CategoriesViewProps) {
    const totalProducts = Object.values(productCounts).reduce(
        (acc, count) => acc + count,
        0
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
                            {totalProducts}
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
