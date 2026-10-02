"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { deleteAdminProduct } from "@/services/admin.api";

type Product = {
    _id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
    category?: {
        _id: string;
        name: string;
    };
};

type ProductTableProps = {
    products: Product[];
};

export default function ProductTable({ products: initialProducts }: ProductTableProps) {
    const [products, setProducts] =
        useState<Product[]>(initialProducts);

    const [deleting, setDeleting] = useState<string | null>(
        null
    );

    const [error, setError] = useState("");

    const handleDelete = async (productId: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeleting(productId);
            setError("");

            await deleteAdminProduct(productId);

            setProducts((previous) =>
                previous.filter(
                    (product) => product._id !== productId
                )
            );
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Unable to delete product");
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
                <table className="w-full min-w-175 text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Product
                            </th>

                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Category
                            </th>

                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Price
                            </th>

                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Stock
                            </th>

                            <th className="px-5 py-4 font-semibold text-gray-700">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {products.map((product) => (
                            <tr
                                key={product._id}
                                className="border-b border-gray-100 last:border-0"
                            >
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        <span className="font-medium text-gray-900">
                                            {product.name}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-5 py-4 text-gray-600">
                                    {product.category?.name ||
                                        "No category"}
                                </td>

                                <td className="px-5 py-4 font-medium text-gray-900">
                                    Rs.{" "}
                                    {product.price.toLocaleString()}
                                </td>

                                <td className="px-5 py-4 text-gray-600">
                                    {product.stock}
                                </td>

                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <Link
                                            href={`/admin/products/${product._id}/edit`}
                                            className="text-sm font-medium text-gray-700 hover:text-black"
                                        >
                                            Edit
                                        </Link>

                                        <button
                                            type="button"
                                            disabled={
                                                deleting ===
                                                product._id
                                            }
                                            onClick={() =>
                                                handleDelete(
                                                    product._id
                                                )
                                            }
                                            className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                                        >
                                            {deleting ===
                                            product._id
                                                ? "Deleting..."
                                                : "Delete"}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {products.length === 0 && (
                    <div className="px-6 py-12 text-center text-sm text-gray-500">
                        No products found.
                    </div>
                )}
            </div>
        </div>
    );
}