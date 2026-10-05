import Link from "next/link";
import { HiOutlineCube, HiOutlineTag, HiOutlineArrowRight } from "react-icons/hi2";

export default function AdminPage() {
    return (
        <section className="min-h-screen bg-gray-50 px-4 py-12">
            <main className="mx-auto max-w-7xl">

                <div className="mb-10">
                    <div className="mb-3 inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                        Admin Panel
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                        Admin Dashboard
                    </h1>

                    <p className="mt-2 max-w-2xl text-gray-500">
                        Manage your store products and categories from one place.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">

                    <Link
                        href="/admin/products"
                        className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-8"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 transition group-hover:bg-black">
                                <HiOutlineCube className="h-6 w-6 text-gray-700 transition group-hover:text-white" />
                            </div>

                            <HiOutlineArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-black" />
                        </div>

                        <h2 className="mt-6 text-xl font-semibold text-gray-900">
                            Products
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            Add, edit, delete and manage all products available
                            in your store.
                        </p>

                        <div className="mt-6 text-sm font-medium text-gray-900">
                            Manage Products
                        </div>
                    </Link>

                    <Link
                        href="/admin/categories"
                        className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-8"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 transition group-hover:bg-black">
                                <HiOutlineTag className="h-6 w-6 text-gray-700 transition group-hover:text-white" />
                            </div>

                            <HiOutlineArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-black" />
                        </div>

                        <h2 className="mt-6 text-xl font-semibold text-gray-900">
                            Categories
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            Create, update and manage categories used to
                            organize your products.
                        </p>

                        <div className="mt-6 text-sm font-medium text-gray-900">
                            Manage Categories
                        </div>
                    </Link>

                </div>
            </main>
        </section>
    );
}