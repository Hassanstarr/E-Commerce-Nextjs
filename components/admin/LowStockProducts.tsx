import Link from "next/link";

interface LowStockProduct {
    _id: string;
    name: string;
    stock: number;
}

interface LowStockProductsProps {
    products: LowStockProduct[];
}

export default function LowStockProducts({ products }: LowStockProductsProps) {
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
                {products.length === 0 ? (
                    <p className="py-4 text-sm text-gray-500">
                        No low stock products.
                    </p>
                ) : (
                    products.map((product) => {
                        const isOutOfStock =
                            product.stock === 0;

                        return (
                            <div
                                key={product._id}
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
                    })
                )}
            </div>
        </div>
    );
}