import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { signupController } from "@/controllers/auth.controller";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {

    const blocked = await enforceRateLimit(
        req,
        rateLimiters.register,
        "You've tried registering too many times. Please wait 10 minutes and try again."
    );

    if (blocked) {
        return blocked;
    }

    await connectDB();

    return signupController(req);
}