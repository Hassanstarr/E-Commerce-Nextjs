type CatalogRecord = { _id: string; name: string; slug?: string };

export function catalogSlug(name: string, id: string) {
    const label = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100).replace(/-$/, "");
    // The complete ID guarantees uniqueness, including identical product names.
    return `${label || "item"}-${id.toLowerCase()}`;
}

export function catalogId(identifier: string) {
    return identifier.match(/(?:^|-)([a-f\d]{24})$/i)?.[1].toLowerCase() || null;
}

export function productPath(product: CatalogRecord) {
    return `/products/${product.slug || catalogSlug(product.name, product._id)}`;
}

export function categoryPath(category: CatalogRecord) {
    return `/categories/${category.slug || catalogSlug(category.name, category._id)}`;
}
