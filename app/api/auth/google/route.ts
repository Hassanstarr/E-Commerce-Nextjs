import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { googleLoginController, googleNonceController } from "@/controllers/google-auth.controller";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
    const blocked = await enforceRateLimit(req, rateLimiters.general,
        "Too many requests. Please wait a moment before trying again.");

    if (blocked) return blocked;
    return googleNonceController(req);
}

export async function POST(req: NextRequest) {
    const blocked = await enforceRateLimit(req, rateLimiters.login,
        "Too many login attempts. Please wait a minute before trying again.");

    if (blocked) return blocked;

    await connectDB();
    return googleLoginController(req);
}
