"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import { createAdminProduct, updateAdminProduct } from "@/services/admin.api";
import { uploadImage } from "@/services/upload.api";
import type { ProductInput } from "@/types";

type Category = {
    _id: string;
    name: string;
};

type ProductFormProps = {
    categories: Category[];
    initialData?: ProductInput & { _id?: string };
};

export default function ProductForm({ categories, initialData }: ProductFormProps) {
    const router = useRouter();

    const [formData, setFormData] = useState<ProductInput>({
        name: "",
        description: "",
        price: 0,
        image: "",
        category: "",
        stock: 0,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description,
                price: initialData.price,
                image: initialData.image,
                category: initialData.category,
                stock: initialData.stock,
            });
        }
    }, [initialData]);

    const handleChange = (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]:
                name === "price" || name === "stock"
                    ? Number(value)
                    : value,
        }));
    };

    const handleImageUpload = async ( event: React.ChangeEvent<HTMLInputElement> ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        try {
            setUploading(true);
            setError("");

            const imageUrl = await uploadImage(file);

            setFormData((previous) => ({
                ...previous,
                image: imageUrl,
            }));
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Unable to upload image");
            }
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            if (initialData?._id) {
                await updateAdminProduct(
                    initialData._id,
                    formData
                );
            } else {
                await createAdminProduct(formData);
            }

            router.push("/admin/products");
            router.refresh();
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Unable to save product");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <Input
                label="Product Name"
                name="name"
                className="text-black"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
            />

            <div>
                <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    Description
                </label>

                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    required
                    className="w-full rounded-lg text-black border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="Enter product description"
                />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <Input
                    label="Price"
                    name="price"
                    className="text-black"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    required
                />

                <Input
                    label="Stock"
                    name="stock"
                    className="text-black"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <label
                    htmlFor="image"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    Product Image
                </label>

                <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium"
                />

                {uploading && (
                    <p className="mt-2 text-sm text-gray-500">
                        Uploading image...
                    </p>
                )}

                {formData.image && (
                    <div className="mt-4">
                        <p className="mb-2 text-sm text-gray-500">
                            Selected image
                        </p>

                        <img
                            src={formData.image}
                            alt="Product preview"
                            className="h-32 w-32 rounded-lg object-cover"
                        />
                    </div>
                )}
            </div>

            <div>
                <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    Category
                </label>

                <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg text-black border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                >
                    <option value="">
                        Select a category
                    </option>

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
                disabled={loading || uploading}
                className="w-full rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
                {uploading
                    ? "Uploading image..."
                    : loading
                    ? "Saving..."
                    : initialData
                    ? "Update Product"
                    : "Add Product"}
            </button>
        </form>
    );
}