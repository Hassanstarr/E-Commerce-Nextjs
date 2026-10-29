export async function requireApiDocsAccess() {
    if (process.env.NODE_ENV === "development") return;

    const { requireAdmin } = await import("@/middleware/admin");
    await requireAdmin();
}
