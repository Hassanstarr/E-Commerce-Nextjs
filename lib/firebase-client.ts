"use client";

import { getApps, initializeApp } from "firebase/app";
import { getAuth, inMemoryPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export async function notificationClient() {
    const config = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    if (Object.values(config).some((value) => !value)) throw new Error("Notifications are not configured yet.");
    const app = getApps().find((item) => item.name === "shopease-notifications") || initializeApp(config, "shopease-notifications");
    const auth = getAuth(app);
    await setPersistence(auth, inMemoryPersistence);
    return { auth, db: getFirestore(app) };
}
