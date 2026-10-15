export function getCatalogQuery(value: string | string[] | undefined) {
    return (Array.isArray(value) ? value[0] : value)?.trim() || "";
}

export function paginateCatalog<T>(items: T[], pageValue: string, limit = 12) {
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const requestedPage = /^\d+$/.test(pageValue) ? Number(pageValue) : 1;
    const page = Number.isSafeInteger(requestedPage)
        ? Math.min(totalPages, Math.max(1, requestedPage))
        : 1;
    const start = (page - 1) * limit;

    return {
        items: items.slice(start, start + limit),
        page,
        total,
        totalPages,
        from: total === 0 ? 0 : start + 1,
        to: Math.min(start + limit, total),
    };
}