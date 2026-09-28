import EmptyState from "@/components/ui/EmptyState";

export default function WishlistPage() {
    return (
        <section className="mx-auto min-h-[70vh] max-w-7xl px-4 py-12">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900">
                    Wishlist
                </h1>

                <p className="mt-2 text-gray-500">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic commodi reprehenderit dolorem quam unde odit cum quod necessitatibus ipsa, eveniet quasi saepe veritatis nihil esse tempora tenetur dolor neque architecto..
                </p>
            </div>

            <EmptyState
                title="Your wishlist is empty"
                message="Save products to quickly find them later."
            />
        </section>
    );
}