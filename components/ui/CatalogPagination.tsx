import Link from "next/link";

type CatalogPaginationProps = {
    pathname: string;
    page: number;
    totalPages: number;
    filters?: Record<string, string>;
};

export default function CatalogPagination({ pathname, page, totalPages, filters = {} }: CatalogPaginationProps) {
    if (totalPages <= 1) return null;

    const getPageUrl = (nextPage: number) => {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(filters)) {
            if (value) params.set(key, value);
        }
        params.set("page", String(nextPage));
        return `${pathname}?${params.toString()}`;
    };

    const buttonClass = "rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100";

    return (
        <nav aria-label="Results pagination" className="mt-8 flex items-center justify-between gap-3">
            {page > 1 ? (
                <Link href={getPageUrl(page - 1)} rel="prev" className={buttonClass}>Previous</Link>
            ) : (
                <span aria-disabled="true" className={`${buttonClass} opacity-40`}>Previous</span>
            )}
            <span className="text-sm text-gray-500" aria-current="page">Page {page} of {totalPages}</span>
            {page < totalPages ? (
                <Link href={getPageUrl(page + 1)} rel="next" className={buttonClass}>Next</Link>
            ) : (
                <span aria-disabled="true" className={`${buttonClass} opacity-40`}>Next</span>
            )}
        </nav>
    );
}