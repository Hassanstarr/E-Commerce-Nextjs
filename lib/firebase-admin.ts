import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import AppError from "@/lib/AppError";

export function notificationFirebase() {
    const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim().replace(/\\n/g, "\n");
    if (!projectId || !clientEmail || !privateKey) throw new AppError("Notifications are not configured yet.", 503);
    if (projectId !== process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim()) throw new AppError("Notification project configuration does not match.", 503);
    try {
        const app = getApps().find((item) => item.name === "shopease-notifications") || initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }), projectId,
        }, "shopease-notifications");
        return { db: getFirestore(app), auth: getAuth(app), app };
    } catch {
        throw new AppError("Unable to initialize notifications. Check the Firebase server credentials.", 503);
    }
}
