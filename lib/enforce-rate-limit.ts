
import { NextResponse } from "next/server";
import type { Ratelimit } from "@upstash/ratelimit";

export async function enforceRateLimit(
    request: Request,
    limiter: Ratelimit,
    message = "Too many requests. Please try again later."
): Promise<NextResponse | null> {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");

    const ip =
        forwardedFor?.split(",")[0]?.trim() ||
        realIp?.trim() ||
        "local-development";

    try {
        const result = await limiter.limit(ip);

        if (result.success) {
            return null;
        }

        const retryAfter = Math.max(
            1,
            Math.ceil((result.reset - Date.now()) / 1000)
        );

        return NextResponse.json(
            {
                success: false,
                message,
                retryAfter,
            },
            {
                status: 429,
                headers: {
                    "Retry-After": String(retryAfter),
                    "X-RateLimit-Limit": String(result.limit),
                    "X-RateLimit-Remaining": String(result.remaining),
                },
            }
        );
    } catch (error) {
        console.error("Rate limit check failed:", error);

        return NextResponse.json(
            {
                success: false,
                message: "We couldn't process your request right now. Please try again shortly.",
            },
            { status: 503 }
        );
    }
}
