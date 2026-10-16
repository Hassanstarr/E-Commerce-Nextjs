import { createRemoteJWKSet, jwtVerify } from "jose";
import AppError from "@/lib/AppError";

const googleKeys = createRemoteJWKSet(
    new URL("https://www.googleapis.com/oauth2/v3/certs")
);

export async function verifyGoogleCredential(credential: string, nonce: string) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
        throw new AppError("Google sign-in is not configured", 503);
    }

    try {
        const { payload } = await jwtVerify(credential, googleKeys, {
            algorithms: ["RS256"],
            issuer: ["https://accounts.google.com", "accounts.google.com"],
            audience: clientId,
            requiredClaims: ["sub", "email", "exp", "iat", "nonce"],
        });

        if (
            payload.nonce !== nonce ||
            payload.email_verified !== true ||
            (payload.azp !== undefined && payload.azp !== clientId) ||
            typeof payload.sub !== "string" || !payload.sub ||
            typeof payload.email !== "string" || !payload.email.includes("@")
        ) {
            throw new Error("Invalid Google identity");
        }

        return {
            googleId: payload.sub,
            email: payload.email.trim().toLowerCase(),
            name: typeof payload.name === "string" ? payload.name.trim() : "",
            authoritativeEmail: payload.email.toLowerCase().endsWith("@gmail.com") ||
                (typeof payload.hd === "string" && payload.hd.length > 0),
        };
    } catch {
        throw new AppError("Google sign-in could not be verified. Please try again.", 401);
    }
}
