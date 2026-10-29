import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import AppError from "@/lib/AppError";

export function normalizeFirebasePrivateKey(value: string) {
    let key = value.trim();
    if (key.startsWith('"') && key.endsWith('"')) {
        try { key = JSON.parse(key); } catch { key = key.slice(1, -1); }
    } else if (key.startsWith("'") && key.endsWith("'")) key = key.slice(1, -1);
    return key.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\r\n/g, "\n").trim();
}

export function notificationFirebase() {
    const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
    const privateKey = process.env.FIREBASE_PRIVATE_KEY && normalizeFirebasePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
    if (!projectId || !clientEmail || !privateKey) throw new AppError("Notifications are not configured yet.", 503);
    if (projectId !== process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim()) throw new AppError("Notification project configuration does not match.", 503);
    try {
        const app = getApps().find((item) => item.name === "shopease-notifications") || initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }), projectId,
        }, "shopease-notifications");
        return { db: getFirestore(app), auth: getAuth(app), app };
    } catch (error) {
        const code = error && typeof error === "object" && "code" in error && typeof error.code === "string" ? error.code : "unknown";
        console.error("Firebase notification initialization failed", { code: /^[a-zA-Z0-9/_-]{1,64}$/.test(code) ? code : "unknown" });
        if (code === "app/invalid-credential") throw new AppError("Firebase service-account credentials are invalid. Check FIREBASE_PRIVATE_KEY and its BEGIN/END lines.", 503);
        throw new AppError("Unable to initialize notifications. Check the Firebase server credentials.", 503);
    }
}
