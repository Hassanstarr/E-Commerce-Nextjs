import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireApiDocsAccess } from "@/lib/api-docs-access";
import AppError from "@/lib/AppError";
import ApiDocs from "@/components/docs/ApiDocs";

export const dynamic = "force-dynamic";
export const metadata = {
    title: "API Documentation | ShopEase",
    robots: { index: false, follow: false },
};

export default async function ApiDocsPage() {
    try {
        await requireApiDocsAccess();
    } catch (error) {
        if (error instanceof AppError && error.statusCode === 401) redirect("/auth/login");
        if (error instanceof AppError && error.statusCode === 403) notFound();
        throw error;
    }

    return (
        <main className="min-h-screen bg-white">
            <header className="border-b border-gray-200 px-6 py-6">
                <div className="mx-auto max-w-7xl">
                    <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">← Back to ShopEase</Link>
                    <h1 className="mt-3 text-2xl font-bold text-gray-900">API Documentation</h1>
                    <p className="mt-2 text-sm text-gray-600">Log in on this website to test protected endpoints. Try it out uses your current session and makes real requests.</p>
                </div>
            </header>
            <ApiDocs />
        </main>
    );
}
