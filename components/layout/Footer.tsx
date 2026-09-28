export default function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} ShopEase. All rights reserved | Created by <a className="underline" href="https://linkedin.com/in/1ts-muhammad-hassan/" target="_blank" rel="noopener noreferrer">Hassan</a>
                    </p>

                    <div className="flex gap-5">
                        <a
                            href="/contact"
                            className="text-sm text-gray-500 transition hover:text-black"
                        >
                            Contact
                        </a>

                        <a
                            href="/products"
                            className="text-sm text-gray-500 transition hover:text-black"
                        >
                            Products
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}