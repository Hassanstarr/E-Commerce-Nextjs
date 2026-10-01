"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Category = {
    _id: string;
    name: string;
};

type ProductFilterProps = {
    categories: Category[];
};

export default function ProductFilter({categories}: ProductFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const selectedCategory = searchParams.get("category") || "";

    const handleCategoryChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const categoryId = event.target.value;

        if (categoryId) {
            router.push(`/products?category=${categoryId}`);
        } else {
            router.push("/products");
        }
    };

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <label
                    htmlFor="category"
                    className="text-sm font-medium text-gray-700"
                >
                    Filter by Category
                </label>

                <select
                    id="category"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-black focus:ring-1 focus:ring-black sm:w-64"
                >
                    <option value="">All Categories</option>

                    {categories.map((category) => (
                        <option
                            key={category._id}
                            value={category._id}
                        >
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedCategory && (
                <button
                    type="button"
                    onClick={() => router.push("/products")}
                    className="self-start text-sm font-medium text-gray-600 transition hover:text-black sm:self-end"
                >
                    Clear Filter
                </button>
            )}
        </div>
    );
}