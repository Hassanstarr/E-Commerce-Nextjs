import AppError from "@/lib/AppError";

export function errorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

export function errorStatus(error: unknown) {
    return error instanceof AppError ? error.statusCode : 500;
}
