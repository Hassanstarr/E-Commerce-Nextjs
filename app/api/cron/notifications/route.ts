import { timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";
import { runNotificationJobs } from "@/services/notification-job.service";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
    if (!process.env.CRON_SECRET) return errorResponse("Notification scheduler is not configured.", 503);
    const expected = Buffer.from(`Bearer ${process.env.CRON_SECRET}`);
    const received = Buffer.from(req.headers.get("authorization") || "");
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return errorResponse("Unauthorized", 401);
    try {
        await connectDB();
        const response = successResponse(await runNotificationJobs(), "Notifications processed");
        response.headers.set("Cache-Control", "no-store");
        return response;
    } catch {
        console.error("Notification scheduler failed. Check Firebase setup and pending events.");
        return errorResponse("Unable to process notifications.", 503);
    }
}
