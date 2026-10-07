import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";

import { adminAnalyticsController } from "@/controllers/admin.controller";

export async function GET( req: NextRequest ) {
    await connectDB();

    return adminAnalyticsController(req);
}