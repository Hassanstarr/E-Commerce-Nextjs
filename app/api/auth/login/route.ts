import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { loginController } from "@/controllers/auth.controller";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {

    const blocked = await enforceRateLimit(
        req,
        rateLimiters.login,
        "Too many login attempts. Please wait a minute before trying again."
    );

    if (blocked) {
        return blocked;
    }

    await connectDB();

    return loginController(req);
}