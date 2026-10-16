"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";

type GoogleSignInButtonProps = {
    disabled?: boolean;
    onLoadingChange: (loading: boolean) => void;
};

export default function GoogleSignInButton({ disabled = false, onLoadingChange }: GoogleSignInButtonProps) {
    const router = useRouter();
    const { refreshUser } = useAuth();
    const [nonce, setNonce] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    useEffect(() => {
        if (!clientId) return;
        const controller = new AbortController();

        const loadNonce = async () => {
            try {
                const response = await apiRequest<{ data: { nonce: string } }>("/api/auth/google", {
                    cache: "no-store",
                    signal: controller.signal,
                });
                if (!controller.signal.aborted) setNonce(response.data.nonce);
            } catch (error) {
                if (!controller.signal.aborted) {
                    setError(error instanceof Error ? error.message : "Unable to load Google sign-in");
                }
            }
        };

        loadNonce();
        return () => controller.abort();
    }, [clientId, attempt]);

    const handleSuccess = async (result: CredentialResponse) => {
        if (loading || disabled) return;

        if (!result.credential) {
            setError("Google sign-in could not be completed. Please try again.");
            return;
        }

        setError("");
        setLoading(true);
        onLoadingChange(true);

        try {
            const response = await apiRequest<{ data: { redirectTo: string } }>("/api/auth/google", {
                method: "POST",
                body: JSON.stringify({ credential: result.credential }),
            });

            await refreshUser();
            router.replace(response.data.redirectTo);
            router.refresh();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unable to sign in with Google");
            setNonce("");
        } finally {
            setLoading(false);
            onLoadingChange(false);
        }
    };

    if (!clientId) return null;

    return (
        <div className="mt-6">
            <div className="mb-5 flex items-center gap-3 text-xs text-gray-400">
                <div className="h-px flex-1 bg-gray-200" />
                <span>or</span>
                <div className="h-px flex-1 bg-gray-200" />
            </div>

            {error && <p role="alert" className="mb-3 text-center text-sm text-red-600">{error}</p>}

            {loading ? (
                <p role="status" className="text-center text-sm text-gray-500">Signing in with Google...</p>
            ) : nonce ? (
                <div inert={disabled} className={`flex justify-center ${disabled ? "opacity-50" : ""}`}>
                    <GoogleOAuthProvider
                        clientId={clientId}
                        onScriptLoadError={() => setError("Unable to load Google sign-in. Please refresh the page and try again.")}
                    >
                        <GoogleLogin
                            key={nonce}
                            nonce={nonce}
                            onSuccess={handleSuccess}
                            onError={() => setError("Google sign-in could not be completed. Please try again.")}
                            text="continue_with"
                            theme="outline"
                            shape="rectangular"
                            size="large"
                        />
                    </GoogleOAuthProvider>
                </div>
            ) : error ? (
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                        setError("");
                        setAttempt((value) => value + 1);
                    }}
                    className="w-full cursor-pointer text-sm font-medium text-gray-700 hover:text-black disabled:opacity-50"
                >
                    Try Google Sign-in Again
                </button>
            ) : (
                <p role="status" className="text-center text-sm text-gray-500">Loading Google sign-in...</p>
            )}
        </div>
    );
}
