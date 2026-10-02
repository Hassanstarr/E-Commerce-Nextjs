"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteAdminCategory } from "@/services/admin.api";

type Category = {
    _id: string;
    name: string;
    description?: string;
    image?: string;
};

type CategoryTableProps = {
    categories: Category[];
};

export default function CategoryTable({ categories: initialCategories }: CategoryTableProps) {
    const [categories, setCategories] =
        useState<Category[]>(initialCategories);

    const [deleting, setDeleting] = useState<string | null>(
        null
    );

    const [error, setError] = useState("");

    const handleDelete = async (categoryId: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this category?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeleting(categoryId);
            setError("");

            await deleteAdminCategory(categoryId);

            setCategories((previous) =>
                previous.filter(
                    (category) => category._id !== categoryId
                )
            );
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
            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="w-full min-w-162.5 text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Name
                            </th>

                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Description
                            </th>

                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {categories.map((category) => (
                            <tr
                                key={category._id}
                                className="border-b border-gray-100 last:border-0"
                            >
                                <td className="px-5 py-4 font-medium text-gray-900">
                                    {category.name}
                                </td>

                                <td className="max-w-md px-5 py-4 text-gray-600">
                                    <p className="line-clamp-2">
                                        {category.description ||
                                            "No description"}
                                    </p>
                                </td>

                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <Link
                                            href={`/admin/categories/${category._id}/edit`}
                                            className="text-sm font-medium text-gray-700 hover:text-black"
                                        >
                                            Edit
                                        </Link>

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
                                                : "Delete"}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {categories.length === 0 && (
                    <div className="px-6 py-12 text-center text-sm text-gray-500">
                        No categories found.
                    </div>
                )}
            </div>
        </div>
    );
}