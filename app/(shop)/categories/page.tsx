import EmptyState from "@/components/ui/EmptyState";

export default function CategoriesPage() {
    return (
        <section className="mx-auto min-h-[70vh] max-w-7xl px-4 py-12">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900">
                    Categories
                </h1>

                <p className="mt-2 text-gray-500">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil quas vel esse tempora voluptatum suscipit iusto qui nemo. Necessitatibus velit autem et itaque officiis quasi voluptas impedit dolorum quas ex?.
                </p>
            </div>

            <EmptyState
                title="No categories available"
                message="Categories will appear here once they are created."
            />
        </section>
    );
}