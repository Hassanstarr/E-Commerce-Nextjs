import Link from "next/link";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                <Link
                    href="/"
                    className="text-xl font-bold text-gray-900"
                >
                    ShopEase
                </Link>

                <div className="hidden items-center gap-6 md:flex">
                    <Link
                        href="/products"
                        className="text-sm text-gray-700 transition hover:text-black"
                    >
                        Products
                    </Link>

                    <Link
                        href="/wishlist"
                        className="text-sm text-gray-700 transition hover:text-black"
                    >
                        Wishlist
                    </Link>

                    <Link
                        href="/cart"
                        className="text-sm text-gray-700 transition hover:text-black"
                    >
                        Cart
                    </Link>

                    <Link
                        href="/auth/login"
                        className="text-sm text-gray-700 transition hover:text-black"
                    >
                        Login
                    </Link>
                </div>
            </nav>
        </header>
    );
}