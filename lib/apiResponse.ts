import { NextResponse } from "next/server";

export function successResponse(
    data: unknown,
    message = "Request successful",
    status = 200
) {
    return NextResponse.json(
        {
            success: true,
            message,
            data,
        },
        { status }
    );
}