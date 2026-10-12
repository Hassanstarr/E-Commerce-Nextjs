"use client";

import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import CategoryForm from "@/components/admin/CategoryForm";

export default function CategoryAddModal() {
    const router = useRouter();

    const handleSuccess = () => {
        router.back();
        router.refresh();
    };

    return (
        <Modal
            title="Add Category"
            subtitle="Create a new product category."
            onClose={() => router.back()}
        >
            <CategoryForm
                isModal
                onSuccess={handleSuccess}
            />
        </Modal>
    );
}
