import { z } from "zod";
import { errorResponse } from "@/lib/apiError";

export function validationResponse(error: z.ZodError) {
    const { fieldErrors, formErrors } = z.flattenError(error);
    return errorResponse("Please check the highlighted fields", 400, { fieldErrors, formErrors });
}
