import EmptyState from "@/components/ui/EmptyState";

export default function CartPage() {
    return (
        <section className="mx-auto min-h-[70vh] max-w-7xl px-4 py-12">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900">
                    Shopping Cart
                </h1>

                <p className="mt-2 text-gray-500">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquam officiis aspernatur distinctio? Ipsa dolor ab cupiditate magni harum minus? Recusandae, pariatur. Harum impedit dolorum in sed ad reprehenderit libero provident..
                </p>
            </div>

            <EmptyState
                title="Your cart is empty"
                message="Add products to your cart and they will appear here."
            />
        </section>
    );
}