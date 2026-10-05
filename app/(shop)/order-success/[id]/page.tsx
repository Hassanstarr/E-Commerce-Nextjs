"use client";

import Link from "next/link";
import { FiCheckCircle, FiMail, FiShoppingBag } from "react-icons/fi";

type OrderSuccessPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
    const { id } = await params;

    return (
        <section className="flex min-h-[75vh] items-center justify-center bg-gray-50 px-4 py-16">
            <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-12">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                    <FiCheckCircle className="text-5xl text-green-600" />
                </div>

                <h1 className="mt-6 text-3xl font-bold text-gray-900">
                    Order Placed Successfully!
                </h1>

                <p className="mx-auto mt-3 max-w-lg text-gray-600">
                    Thank you for your order. Your order has been
                    successfully placed and will be processed for
                    delivery.
                </p>

                <div className="mx-auto mt-8 max-w-md rounded-xl bg-gray-50 p-5 text-left">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            Order ID
                        </span>

                        <span className="max-w-55 truncate text-sm font-semibold text-gray-900">
                            {id}
                        </span>
                    </div>

                    <div className="mt-4 flex items-center gap-3 border-t border-gray-200 pt-4">
                        <FiMail className="text-gray-500" />

                        <p className="text-sm text-gray-600">
                            Your order confirmation has been sent
                            to your selected email address.
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        href="/products"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        <FiShoppingBag />
                        Continue Shopping
                    </Link>

                    <Link
                        href="/"
                        className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </section>
    );
}