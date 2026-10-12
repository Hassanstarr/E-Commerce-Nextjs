"use client";

import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import CategoryForm from "@/components/admin/CategoryForm";
import type { CategoryInput } from "@/types";

interface CategoryEditModalProps {
    category: CategoryInput & { _id: string };
}

export default function CategoryEditModal({
    category,
}: CategoryEditModalProps) {
    const router = useRouter();

    const handleSuccess = () => {
        router.back();
        router.refresh();
    };

    return (
        <Modal
            title="Edit Category"
            subtitle="Update category information."
            onClose={() => router.back()}
        >
            <CategoryForm
                key={category._id}
                initialData={category}
                isModal
                onSuccess={handleSuccess}
            />
        </Modal>
    );
}
