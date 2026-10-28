import { createHash } from "crypto";
import { decodeJwt } from "jose";
import { Timestamp } from "firebase-admin/firestore";
import { notificationFirebase } from "@/lib/firebase-admin";
import AppError from "@/lib/AppError";

export function notificationSessionId(token: string) { return createHash("sha256").update(token).digest("hex"); }

export async function createNotificationSession(userId: string, token: string) {
    const { db, auth } = notificationFirebase();
    const payload = decodeJwt(token);
    if (!payload.exp || payload.exp * 1000 <= Date.now()) throw new AppError("Your session has expired. Please log in again.", 401);
    const sessionId = notificationSessionId(token);
    const expiresAt = new Date(Math.min(payload.exp * 1000, Date.now() + 3600000));
    await db.collection("notificationSessions").doc(sessionId).set({ userId, active: true, expiresAt: Timestamp.fromDate(expiresAt) });
    const customToken = await auth.createCustomToken(userId, { notificationSession: sessionId });
    return { customToken, expiresAt: expiresAt.toISOString() };
}

export async function revokeNotificationSession(token: string) {
    if (!process.env.FIREBASE_PRIVATE_KEY) return;
    try {
        await notificationFirebase().db.collection("notificationSessions").doc(notificationSessionId(token)).set({ active: false, expiresAt: Timestamp.now() }, { merge: true });
    } catch { console.error("Unable to revoke notification listener; cookie-protected notification data remains inaccessible after logout."); }
}
