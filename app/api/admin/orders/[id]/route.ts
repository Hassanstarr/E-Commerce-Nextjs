import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";

import { adminOrderDetailsController, updateAdminOrderController } from "@/controllers/admin.controller";

interface RouteContext {
    params: Promise<{ id: string; }>;
}

export async function GET( req: NextRequest, context: RouteContext ) {
    await connectDB();

    const { id } = await context.params;

    return adminOrderDetailsController( req, id );
}

export async function PATCH( req: NextRequest, context: RouteContext ) {
    await connectDB();

    const { id } = await context.params;

    return updateAdminOrderController(req, id);
}