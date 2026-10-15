"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
    const search = searchParams.get("q") || "";

    const handleCategoryChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const categoryId = event.target.value;

        const params = new URLSearchParams();
        const form = event.currentTarget.form;
        const query = form ? String(new FormData(form).get("q") || "").trim() : search;

        if (categoryId) params.set("category", categoryId);
        if (query) params.set("q", query);

        router.push(params.size ? `/products?${params.toString()}` : "/products");
    };

    return (
        <form action="/products" className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="min-w-0 flex-1">
                <label htmlFor="product-search" className="text-sm font-medium text-gray-700">
                    Search Products
                </label>
                <input
                    key={search}
                    id="product-search"
                    name="q"
                    type="search"
                    defaultValue={search}
                    placeholder="Search by name or description"
                    className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-black focus:ring-1 focus:ring-black sm:min-w-56"
                />
            </div>
            <div>
                <label
                    htmlFor="category"
                    className="text-sm font-medium text-gray-700"
                >
                    Filter by Category
                </label>

                <select
                    id="category"
                    name="category"
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

            <button
                type="submit"
                className="cursor-pointer rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
                Search
            </button>

            {(selectedCategory || search) && (
                <Link
                    href="/products"
                    className="self-start text-sm font-medium text-gray-600 transition hover:text-black sm:self-end"
                >
                    Clear Filters
                </Link>
            )}
        </form>
    );
}
