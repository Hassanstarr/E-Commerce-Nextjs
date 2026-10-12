"use client";

import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import ProductForm from "@/components/admin/ProductForm";

interface ProductAddModalProps {
    categories: { _id: string; name: string }[];
}

export default function ProductAddModal({ categories }: ProductAddModalProps) {
    const router = useRouter();

    const handleSuccess = () => {
        router.back();
        router.refresh();
    };

    return (
        <Modal
            title="Add Product"
            subtitle="Add a new product to your store."
            onClose={() => router.back()}
        >
            <ProductForm
                categories={categories}
                isModal
                onSuccess={handleSuccess}
            />
        </Modal>
    );
}
