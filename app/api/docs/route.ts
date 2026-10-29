import { requireApiDocsAccess } from "@/lib/api-docs-access";
import { openApiDocument } from "@/lib/openapi";
import { errorResponse } from "@/lib/apiError";
import AppError from "@/lib/AppError";

export const dynamic = "force-dynamic";

export async function GET() {
    const headers = { "Cache-Control": "private, no-store", Vary: "Cookie", "X-Robots-Tag": "noindex, nofollow" };
    try {
        await requireApiDocsAccess();
        return Response.json(openApiDocument, { headers });
    } catch (error) {
        const response = errorResponse(
            error instanceof AppError ? error.message : "Unable to load API documentation",
            error instanceof AppError ? error.statusCode : 503
        );
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
        return response;
    }
}
