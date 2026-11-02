import AppError from "@/lib/AppError";

export async function readJson(request: Pick<Request, "json">): Promise<Record<string, unknown>> {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        throw new AppError("Request body must be valid JSON", 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw new AppError("Request body must be a JSON object", 400);
    }
    return body as Record<string, unknown>;
}
