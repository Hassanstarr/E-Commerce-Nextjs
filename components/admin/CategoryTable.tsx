"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { deleteAdminCategory } from "@/services/admin.api";

type Category = {
    _id: string;
    name: string;
    description?: string;
    image?: string;
};

type CategoryTableProps = {
    categories: Category[];
    productCounts: Record<string, number>;
};

export default function CategoryTable({
    categories: initialCategories,
    productCounts,
}: CategoryTableProps) {
    const [categories, setCategories] =
        useState<Category[]>(initialCategories);

    const [search, setSearch] = useState("");

    const [deleting, setDeleting] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(
        null
    );
    const [error, setError] = useState("");

    const filteredCategories = useMemo(() => {
        return categories.filter((category) =>
            category.name
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [categories, search]);

    const handleDelete = async (categoryId: string) => {
        try {
            setDeleting(categoryId);
            setError("");

            await deleteAdminCategory(categoryId);

            setCategories((previous) =>
                previous.filter(
                    (category) => category._id !== categoryId
                )
            );

            setConfirmDelete(null);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Unable to delete category");
            }
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div>
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <label
                    htmlFor="category-search"
                    className="sr-only"
                >
                    Search categories
                </label>

                <input
                    id="category-search"
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search categories..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                />
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-3">
                <p className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-medium text-gray-900">
                        {filteredCategories.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-gray-900">
                        {categories.length}
                    </span>{" "}
                    categories
                </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full min-w-225 text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Category
                            </th>

                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Description
                            </th>

                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Products
                            </th>

                            <th className="px-5 py-4 text-right font-semibold text-gray-700">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredCategories.map((category) => (
                            <tr
                                key={category._id}
                                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                            >
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        {category.image ? (
                                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                <Image
                                                    src={category.image}
                                                    alt={category.name}
                                                    fill
                                                    sizes="48px"
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-500">
                                                {category.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-900">
                                                {category.name}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-400">
                                                ID:{" "}
                                                {category._id.slice(
                                                    -6
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                <td className="max-w-md px-5 py-4 text-gray-600">
                                    <p className="line-clamp-2">
                                        {category.description ||
                                            "No description"}
                                    </p>
                                </td>

                                <td className="px-5 py-4">
                                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                        {productCounts[
                                            category._id
                                        ] || 0}{" "}
                                        {(productCounts[
                                            category._id
                                        ] || 0) === 1
                                            ? "product"
                                            : "products"}
                                    </span>
                                </td>

                                <td className="px-5 py-4">
                                    <div className="flex items-center justify-end gap-3">
                                        <Link
                                            href={`/admin/categories/${category._id}/edit`}
                                            className="text-sm font-medium text-gray-600 transition hover:text-black"
                                        >
                                            Edit
                                        </Link>

                                        {confirmDelete ===
                                        category._id ? (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        deleting ===
                                                        category._id
                                                    }
                                                    onClick={() =>
                                                        handleDelete(
                                                            category._id
                                                        )
                                                    }
                                                    className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                                                >
                                                    {deleting ===
                                                    category._id
                                                        ? "Deleting..."
                                                        : "Confirm"}
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        deleting ===
                                                        category._id
                                                    }
                                                    onClick={() =>
                                                        setConfirmDelete(
                                                            null
                                                        )
                                                    }
                                                    className="text-sm font-medium text-gray-500 hover:text-black"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setConfirmDelete(
                                                        category._id
                                                    )
                                                }
                                                className="text-sm font-medium text-red-600 hover:text-red-700"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredCategories.length === 0 && (
                    <div className="px-6 py-16 text-center">
                        <p className="font-medium text-gray-900">
                            No categories found
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Try changing your search.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}