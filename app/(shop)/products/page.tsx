import EmptyState from "@/components/ui/EmptyState";

export default function ProductsPage() {
    return (
        <section className="mx-auto min-h-[70vh] max-w-7xl px-4 py-12">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900">
                    Products
                </h1>

                <p className="mt-2 text-gray-500">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita error odit facilis quisquam aliquid eveniet natus, illo fuga. Repellendus commodi harum fugit reprehenderit suscipit assumenda cum aliquam rem provident delectus..
                </p>
            </div>

            <EmptyState
                title="No products available"
                message="Products will appear here once they are added."
            />
        </section>
    );
}