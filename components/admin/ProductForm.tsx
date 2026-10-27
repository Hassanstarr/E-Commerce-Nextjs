"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import { createAdminProduct, updateAdminProduct } from "@/services/admin.api";
import { uploadImage } from "@/services/upload.api";
import type { ProductInput } from "@/types";
import ProductPrice from "@/components/product/ProductPrice";
import { getProductDiscounts, getDiscountValidationError } from "@/lib/product-pricing";

function localDateTime(value?: string | null) {
    if (!value) return "";
    const date = new Date(value);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

type Category = {
    _id: string;
    name: string;
};

type ProductFormProps = {
    categories: Category[];
    initialData?: ProductInput & { _id?: string };
    onSuccess?: () => void;
    isModal?: boolean;
};

export default function ProductForm({
    categories,
    initialData,
    onSuccess,
    isModal = false,
}: ProductFormProps) {
    const router = useRouter();
    const [publicOffer, memberOffer] = getProductDiscounts(initialData || {});

    const [prevId, setPrevId] = useState(initialData?._id);
    const [formData, setFormData] = useState<ProductInput>(() => ({
        name: initialData?.name || "",
        description: initialData?.description || "",
        price: initialData?.price || 0,
        image: initialData?.image || "",
        category: initialData?.category || "",
        stock: initialData?.stock || 0,
        discountPercent: publicOffer.discountPercent,
        discountAudience: "all",
        memberDiscountPercent: memberOffer.discountPercent,
        memberDiscountEndsAt: memberOffer.discountEndsAt as string | null,
        discountEndsAt: publicOffer.discountEndsAt as string | null,
    }));

    if (initialData?._id !== prevId) {
        setPrevId(initialData?._id);
        setFormData({
            name: initialData?.name || "",
            description: initialData?.description || "",
            price: initialData?.price || 0,
            image: initialData?.image || "",
            category: initialData?.category || "",
            stock: initialData?.stock || 0,
            discountPercent: publicOffer.discountPercent,
            discountAudience: "all",
            memberDiscountPercent: memberOffer.discountPercent,
            memberDiscountEndsAt: memberOffer.discountEndsAt as string | null,
            discountEndsAt: publicOffer.discountEndsAt as string | null,
        });
    }

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);

    const handleChange = (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = event.target;

        if (name === "discountEndsAt" || name === "memberDiscountEndsAt") {
            setFormData((previous) => ({ ...previous, [name]: value ? new Date(value).toISOString() : null }));
            return;
        }

        setFormData((previous) => ({
            ...previous,
            [name]:
                name === "price" || name === "stock" || name === "discountPercent" || name === "memberDiscountPercent"
                    ? Number(value)
                    : value,
            ...(name === "discountPercent" && !Number(value) ? { discountEndsAt: null } : {}),
            ...(name === "memberDiscountPercent" && !Number(value) ? { memberDiscountEndsAt: null } : {}),
        }));
    };

    const handleImageUpload = async ( event: React.ChangeEvent<HTMLInputElement> ) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file || loading || uploading) {
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

    const handleSubmit = async ( event: React.FormEvent<HTMLFormElement> ) => {
        event.preventDefault();

        if (loading || uploading) return;
        const discountError = getDiscountValidationError(formData);
        if (discountError) {
            setError(discountError);
            return;
        }
        if ([formData.discountEndsAt, formData.memberDiscountEndsAt].some((value) => value && new Date(value).getTime() <= Date.now())) {
            setError("Discount end time must be in the future");
            return;
        }
        

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

            if (onSuccess) {
                onSuccess();
            } else {
                router.push("/admin/products");
                router.refresh();
            }
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
            className={`space-y-6 ${isModal ? "" : "rounded-xl border border-gray-200 bg-white p-6 shadow-sm"}`}
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
                    label="Price (before discount)"
                    name="price"
                    className="text-black"
                    type="number"
                    min="1"
                    max="9999999.99"
                    step="0.01"
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
                    step="1"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-medium text-gray-900">Everyone discount (optional)</h3>
                    {Boolean(formData.discountPercent) && <button type="button" onClick={() => setFormData((previous) => ({ ...previous, discountPercent: 0, discountEndsAt: null }))} className="text-xs font-medium text-red-600 hover:text-red-700">Remove discount</button>}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Discount (%)" aria-label="Discount percentage" name="discountPercent" type="number" min="1" max="99" step="1" value={formData.discountPercent || ""} onChange={handleChange} placeholder="1 to 99" className="bg-white text-black" />
                    <Input label="Ends at (optional)" aria-label="Discount end time" name="discountEndsAt" type="datetime-local" value={localDateTime(formData.discountEndsAt)} onChange={handleChange} disabled={!formData.discountPercent} className="bg-white text-black disabled:bg-gray-100" />
                </div>
                <p className="mt-2 text-xs leading-5 text-gray-500">Starts when you save. Leave the end time empty to keep it until you remove it. Times use your local timezone.</p>
                <div className="mt-5 border-t border-gray-200 pt-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <h3 className="text-sm font-medium text-gray-900">Members-only discount (optional)</h3>
                        {Boolean(formData.memberDiscountPercent) && <button type="button" onClick={() => setFormData((previous) => ({ ...previous, memberDiscountPercent: 0, memberDiscountEndsAt: null }))} className="text-xs font-medium text-red-600 hover:text-red-700">Remove member discount</button>}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input label="Member discount (%)" aria-label="Member discount percentage" name="memberDiscountPercent" type="number" min="1" max="99" step="1" value={formData.memberDiscountPercent || ""} onChange={handleChange} placeholder="1 to 99" className="bg-white text-black" />
                        <Input label="Ends at (optional)" aria-label="Member discount end time" name="memberDiscountEndsAt" type="datetime-local" value={localDateTime(formData.memberDiscountEndsAt)} onChange={handleChange} disabled={!formData.memberDiscountPercent} className="bg-white text-black disabled:bg-gray-100" />
                    </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">Members get the everyone discount unless a member offer is active. A member discount must be at least the everyone discount. Both prices are shown with your applicable price highlighted; percentages do not stack.</p>
                {Boolean(formData.discountPercent || formData.memberDiscountPercent) && formData.price > 0 && <p className="mt-3 text-sm font-semibold text-gray-900"><ProductPrice product={formData} preview /></p>}
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
                    disabled={loading || uploading}
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
