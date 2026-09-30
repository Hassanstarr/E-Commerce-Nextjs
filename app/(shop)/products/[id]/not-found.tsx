import Link from "next/link";

export default function ProductNotFound() {
    return (
        <section className="flex min-h-[70vh] items-center justify-center px-4">
            <div className="text-center">
                <p className="text-sm font-medium text-gray-500">
                    Product
                </p>

                <h1 className="mt-2 text-3xl font-bold text-gray-900">
                    Product not found
                </h1>

                <p className="mt-3 text-gray-500">
                    The product you are looking for does not exist.
                </p>

                <Link
                    href="/products"
                    className="mt-6 inline-block rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                    Back to Products
                </Link>
            </div>
        </section>
    );
}