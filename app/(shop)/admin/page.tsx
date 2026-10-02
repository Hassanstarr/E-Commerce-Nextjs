import Link from "next/link";

export default function AdminPage() {
    return (
        <section className="min-h-screen bg-gray-50 px-4">
            <main className="mx-auto max-w-7xl px-4 py-12">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Admin Dashboard
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Manage your store products and categories.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <Link
                        href="/admin/products"
                        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <h2 className="text-xl font-semibold text-gray-900">
                            Products
                        </h2>

                        <p className="mt-2 text-sm text-gray-600">
                            Add, edit, delete and manage store products.
                        </p>
                    </Link>

                    <Link
                        href="/admin/categories"
                        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <h2 className="text-xl font-semibold text-gray-900">
                            Categories
                        </h2>

                        <p className="mt-2 text-sm text-gray-600">
                            Create and manage product categories.
                        </p>
                    </Link>
                </div>
            </main>
        </section>
    );
}