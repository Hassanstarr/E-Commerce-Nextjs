"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
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

export default function ProductTable({
    products: initialProducts,
}: ProductTableProps) {
    const [products, setProducts] =
        useState<Product[]>(initialProducts);

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [stockFilter, setStockFilter] = useState("all");

    const [deleting, setDeleting] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(
        null
    );
    const [error, setError] = useState("");

    const categories = useMemo(() => {
        const uniqueCategories = new Map<string, string>();

        products.forEach((product) => {
            if (product.category?._id && product.category.name) {
                uniqueCategories.set(
                    product.category._id,
                    product.category.name
                );
            }
        });

        return Array.from(uniqueCategories.entries()).sort((a, b) =>
            a[1].localeCompare(b[1])
        );
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesSearch = product.name
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchesCategory =
                categoryFilter === "all" ||
                product.category?._id === categoryFilter;

            const matchesStock =
                stockFilter === "all" ||
                (stockFilter === "in-stock" && product.stock > 5) ||
                (stockFilter === "low-stock" &&
                    product.stock > 0 &&
                    product.stock <= 5) ||
                (stockFilter === "out-of-stock" &&
                    product.stock === 0);

            return (
                matchesSearch &&
                matchesCategory &&
                matchesStock
            );
        });
    }, [products, search, categoryFilter, stockFilter]);

    const handleDelete = async (productId: string) => {
        try {
            setDeleting(productId);
            setError("");

            await deleteAdminProduct(productId);

            setProducts((previous) =>
                previous.filter(
                    (product) => product._id !== productId
                )
            );

            setConfirmDelete(null);
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

    const getStockStatus = (stock: number) => {
        if (stock === 0) {
            return {
                label: "Out of stock",
                className:
                    "bg-red-50 text-red-700 border-red-200",
            };
        }

        if (stock <= 5) {
            return {
                label: "Low stock",
                className:
                    "bg-amber-50 text-amber-700 border-amber-200",
            };
        }

        return {
            label: "In stock",
            className:
                "bg-green-50 text-green-700 border-green-200",
        };
    };

    return (
        <div>
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row">
                    <div className="flex-1">
                        <label
                            htmlFor="product-search"
                            className="sr-only"
                        >
                            Search products
                        </label>

                        <input
                            id="product-search"
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search products..."
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                        />
                    </div>

                    <select
                        value={categoryFilter}
                        onChange={(event) =>
                            setCategoryFilter(event.target.value)
                        }
                        className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    >
                        <option value="all">
                            All Categories
                        </option>

                        {categories.map(
                            ([categoryId, categoryName]) => (
                                <option
                                    key={categoryId}
                                    value={categoryId}
                                >
                                    {categoryName}
                                </option>
                            )
                        )}
                    </select>

                    <select
                        value={stockFilter}
                        onChange={(event) =>
                            setStockFilter(event.target.value)
                        }
                        className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    >
                        <option value="all">
                            All Stock
                        </option>

                        <option value="in-stock">
                            In Stock
                        </option>

                        <option value="low-stock">
                            Low Stock
                        </option>

                        <option value="out-of-stock">
                            Out of Stock
                        </option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-medium text-gray-900">
                        {filteredProducts.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-gray-900">
                        {products.length}
                    </span>{" "}
                    products
                </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full min-w-225 text-left text-sm">
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
                                Status
                            </th>

                            <th className="px-5 py-4 text-right font-semibold text-gray-700">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredProducts.map((product) => {
                            const stockStatus =
                                getStockStatus(product.stock);

                            return (
                                <tr
                                    key={product._id}
                                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                <Image
                                                    src={product.image}
                                                    alt={product.name}
                                                    fill
                                                    sizes="48px"
                                                    className="object-cover"
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-gray-900">
                                                    {product.name}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-400">
                                                    ID:{" "}
                                                    {product._id.slice(
                                                        -6
                                                    )}
                                                </p>
                                            </div>
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

                                    <td className="px-5 py-4 font-medium text-gray-900">
                                        {product.stock}
                                    </td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${stockStatus.className}`}
                                        >
                                            {stockStatus.label}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link
                                                href={`/admin/products/${product._id}/edit`}
                                                className="text-sm font-medium text-gray-600 transition hover:text-black"
                                            >
                                                Edit
                                            </Link>

                                            {confirmDelete ===
                                            product._id ? (
                                                <div className="flex items-center gap-2">
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
                                                            : "Confirm"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            deleting ===
                                                            product._id
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
                                                            product._id
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
                            );
                        })}
                    </tbody>
                </table>

                {filteredProducts.length === 0 && (
                    <div className="px-6 py-16 text-center">
                        <p className="font-medium text-gray-900">
                            No products found
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Try changing your search or filters.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}