"use client";

import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import ProductForm from "@/components/admin/ProductForm";
import type { ProductInput } from "@/types";

interface ProductEditModalProps {
    categories: { _id: string; name: string }[];
    product: ProductInput & { _id: string };
}

export default function ProductEditModal({
    categories,
    product,
}: ProductEditModalProps) {
    const router = useRouter();

    const handleSuccess = () => {
        router.back();
        router.refresh();
    };

    return (
        <Modal
            title="Edit Product"
            subtitle="Update product information."
            onClose={() => router.back()}
        >
            <ProductForm
                key={product._id}
                categories={categories}
                initialData={product}
                isModal
                onSuccess={handleSuccess}
            />
        </Modal>
    );
}
