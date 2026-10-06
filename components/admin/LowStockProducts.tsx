import Link from "next/link";

const lowStockProducts = [
    {
        name: "AirPods Pro",
        stock: 2,
    },
    {
        name: "iPhone 15",
        stock: 3,
    },
    {
        name: "Nike Air Max",
        stock: 5,
    },
    {
        name: "Samsung S25",
        stock: 1,
    },
];

export default function LowStockProducts() {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="font-semibold text-gray-900">
                        Low Stock
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Products that need attention.
                    </p>
                </div>

                <Link
                    href="/admin/products"
                    className="text-sm font-medium text-gray-700 hover:text-black"
                >
                    View all
                </Link>
            </div>

            <div className="mt-5 space-y-4">
                {lowStockProducts.map((product) => {
                    const isOutOfStock = product.stock === 0;

                    return (
                        <div
                            key={product.name}
                            className="flex items-center justify-between"
                        >
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {product.name}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    Inventory
                                </p>
                            </div>

                            <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                    isOutOfStock
                                        ? "bg-red-50 text-red-700"
                                        : "bg-yellow-50 text-yellow-700"
                                }`}
                            >
                                {isOutOfStock
                                    ? "Out of stock"
                                    : `${product.stock} left`}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}