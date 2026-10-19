"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type ResetResponse = {
    message: string;
    data: { token: string } | null;
};

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<"email" | "code" | "password" | "done">("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [resendAt, setResendAt] = useState(0);
    const [now, setNow] = useState(0);

    useEffect(() => {
        if (!resendAt) return;

        const interval = setInterval(() => {
            const currentTime = Date.now();
            setNow(currentTime);
            if (currentTime >= resendAt) clearInterval(interval);
        }, 1000);
        return () => clearInterval(interval);
    }, [resendAt]);

    const resendSeconds = Math.max(0, Math.ceil((resendAt - now) / 1000));
    const inputClass = "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 outline-none transition focus:border-black focus:ring-1 focus:ring-black";
    const labelClass = "mb-2 block text-sm font-medium text-gray-700";

    const sendCode = async () => {
        const response = await apiRequest<ResetResponse>("/api/auth/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email }),
        });

        const sentAt = Date.now();
        setNow(sentAt);
        setResendAt(sentAt + 60000);
        setMessage(response.message);
        setOtp("");
        setStep("code");
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (loading) return;

        setError("");
        setMessage("");
        setLoading(true);

        try {
            if (step === "email") {
                await sendCode();
            } else if (step === "code") {
                const response = await apiRequest<ResetResponse>("/api/auth/verify-reset-code", {
                    method: "POST",
                    body: JSON.stringify({ email, otp }),
                });

                if (!response.data?.token) throw new Error("Unable to verify code. Please try again.");
                setToken(response.data.token);
                setOtp("");
                setResendAt(0);
                setMessage(response.message);
                setStep("password");
            } else if (step === "password") {
                if (password !== confirmPassword) throw new Error("Passwords do not match");

                const response = await apiRequest<ResetResponse>("/api/auth/reset-password", {
                    method: "POST",
                    body: JSON.stringify({ email, token, password, confirmPassword }),
                });

                setToken("");
                setPassword("");
                setConfirmPassword("");
                setMessage(response.message);
                setStep("done");
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unable to reset password");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (loading || resendSeconds > 0) return;

        setLoading(true);
        setError("");
        setMessage("");

        try {
            await sendCode();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unable to send code");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="flex min-h-dvh items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                <h1 className="text-center text-xl font-bold text-gray-900 sm:text-2xl">
                    {step === "done" ? "Password updated" : "Reset Password"}
                </h1>
                <p className="mt-2 mb-6 text-center text-sm text-gray-500">
                    {step === "email" ? "Enter your account email to receive a reset code."
                        : step === "code" ? `Enter the 6-digit code sent to ${email}. It expires in 10 minutes.`
                        : step === "password" ? "Choose a new password for your account."
                        : "You can now log in with your new password."}
                </p>

                {error && <div role="alert" className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
                {message && <div role="status" className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}

                {step !== "done" && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {step === "email" && (
                            <div>
                                <label htmlFor="reset-email" className={labelClass}>Email</label>
                                <input id="reset-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" disabled={loading} required className={inputClass} />
                            </div>
                        )}
                        {step === "code" && (
                            <div>
                                <label htmlFor="reset-otp" className={labelClass}>Verification code</label>
                                <input id="reset-otp" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit code" disabled={loading} required className={inputClass} />
                            </div>
                        )}
                        {step === "password" && (
                            <>
                                <div>
                                    <label htmlFor="new-password" className={labelClass}>New password</label>
                                    <input id="new-password" type="password" autoComplete="new-password" minLength={6} maxLength={100} value={password} onChange={(event) => setPassword(event.target.value)} disabled={loading} required className={inputClass} />
                                    <p className="mt-2 text-xs text-gray-500">Use at least 6 characters, excluding spaces at the beginning or end.</p>
                                </div>
                                <div>
                                    <label htmlFor="confirm-password" className={labelClass}>Confirm password</label>
                                    <input id="confirm-password" type="password" autoComplete="new-password" minLength={6} maxLength={100} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={loading} required className={inputClass} />
                                </div>
                            </>
                        )}

                        <button type="submit" disabled={loading} className="w-full rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50">
                            {loading ? "Please wait..." : step === "email" ? "Send reset code" : step === "code" ? "Verify code" : "Reset password"}
                        </button>

                        {step === "code" && (
                            <button type="button" disabled={loading || resendSeconds > 0} onClick={handleResend} className="w-full text-sm font-medium text-gray-600 transition hover:text-black disabled:cursor-not-allowed disabled:opacity-50">
                                {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : "Resend code"}
                            </button>
                        )}
                        {(step === "code" || step === "password") && (
                            <button type="button" disabled={loading} onClick={() => {
                                setStep("email");
                                setToken("");
                                setOtp("");
                                setPassword("");
                                setConfirmPassword("");
                                setError("");
                                setMessage("");
                                setResendAt(0);
                            }} className="w-full text-sm text-gray-500 transition hover:text-black disabled:opacity-50">
                                {step === "code" ? "Use a different email" : "Request a new code"}
                            </button>
                        )}
                    </form>
                )}

                <p className="mt-6 text-center text-sm text-gray-500">
                    <Link href="/auth/login" className="font-medium text-black hover:underline">Back to login</Link>
                </p>
            </div>
        </section>
    );
}
