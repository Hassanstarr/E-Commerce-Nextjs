"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import { createAdminCategory, updateAdminCategory } from "@/services/admin.api";
import type { CategoryInput } from "@/types";

type CategoryFormProps = {
    initialData?: CategoryInput & { _id?: string };
};

export default function CategoryForm({ initialData }: CategoryFormProps) {
    const router = useRouter();

    const [formData, setFormData] =
        useState<CategoryInput>({
            name: "",
            description: "",
            image: "",
        });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description || "",
                image: initialData.image || "",
            });
        }
    }, [initialData]);

    const handleChange = (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            if (initialData?._id) {
                await updateAdminCategory(
                    initialData._id,
                    formData
                );
            } else {
                await createAdminCategory(formData);
            }

            router.push("/admin/categories");
            router.refresh();
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Unable to save category");
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
                label="Category Name"
                name="name"
                className="text-black"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter category name"
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
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="Enter category description"
                />
            </div>

            <Input
                label="Image URL"
                name="image"
                type="url"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/category.jpg"
            />

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
                {loading
                    ? "Saving..."
                    : initialData
                    ? "Update Category"
                    : "Add Category"}
            </button>
        </form>
    );
}