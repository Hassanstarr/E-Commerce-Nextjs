import { NextResponse } from "next/server";

export function errorResponse(
    message = "Something went wrong",
    status = 500,
    errors?: unknown
) {
    return NextResponse.json(
        {
            success: false,
            message,
            ...(errors ? { errors } : {}),
        },
        { status }
    );
}