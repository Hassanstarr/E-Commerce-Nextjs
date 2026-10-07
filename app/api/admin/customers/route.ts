import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";

import { adminCustomersController } from "@/controllers/admin.controller";

export async function GET( req: NextRequest ) {
    await connectDB();

    return adminCustomersController(req);
}