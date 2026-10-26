import { SignJWT, jwtVerify } from "jose";
import { Types } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in .env.local");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export type AuthPayload = {
    userId: string;
    role: "user" | "member" | "admin";
    sessionVersion: number;
};

export async function createToken(
    userId: Types.ObjectId | string,
    role: "user" | "member" | "admin",
    sessionVersion = 0
) {
    return await new SignJWT({
        userId: userId.toString(),
        role,
        sessionVersion,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, secret);

        if (
            typeof payload.userId !== "string" ||
            (payload.role !== "user" && payload.role !== "member" && payload.role !== "admin")
        ) {
            return null;
        }

        return {
            userId: payload.userId,
            role: payload.role,
            sessionVersion: typeof payload.sessionVersion === "number" ? payload.sessionVersion : 0,
        } as AuthPayload;
    } catch {
        return null;
    }
}
