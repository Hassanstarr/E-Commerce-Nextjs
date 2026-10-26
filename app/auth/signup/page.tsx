"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

type SignupResponse = {
    success: boolean;
    message: string;
    data: {
        user: {
            id: string;
            name: string;
            email: string;
            role: "user" | "member" | "admin";
        };
    };
};

type VerificationResponse = {
    message: string;
    data: { email: string; resendAfter: number };
};

export default function SignupPage() {
    const router = useRouter();
    const { refreshUser } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"details" | "verify">("details");
    const [verificationEmail, setVerificationEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const [resending, setResending] = useState(false);
    const [resendAt, setResendAt] = useState(0);
    const [now, setNow] = useState(0);

    useEffect(() => {
        if (!resendAt) return;
        const timer = setInterval(() => {
            const currentTime = Date.now();
            setNow(currentTime);
            if (currentTime >= resendAt) clearInterval(timer);
        }, 1000);
        return () => clearInterval(timer);
    }, [resendAt]);

    const resendSeconds = Math.max(0, Math.ceil((resendAt - now) / 1000));

    const codeSent = (response: VerificationResponse) => {
        const sentAt = Date.now();
        setVerificationEmail(response.data.email);
        setNow(sentAt);
        setResendAt(sentAt + response.data.resendAfter * 1000);
        setOtp("");
        setMessage(response.message);
        setFormData((previous) => ({ ...previous, password: "" }));
        setStep("verify");
    };

    const handleChange = ( event: React.ChangeEvent<HTMLInputElement> ) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = async ( event: React.FormEvent<HTMLFormElement> ) => {
        event.preventDefault();
        if (loading) return;

        setError("");
        setMessage("");
        setLoading(true);

        try {
            if (step === "details") {
                const response = await apiRequest<VerificationResponse>("/api/auth/signup", {
                    method: "POST",
                    body: JSON.stringify(formData),
                });
                codeSent(response);
                return;
            }

            await apiRequest<SignupResponse>("/api/auth/verify-signup", {
                method: "POST",
                body: JSON.stringify({ otp }),
            });

            await refreshUser();

            router.replace("/");
            router.refresh();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to create account"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (loading || resendSeconds > 0) return;
        setLoading(true);
        setResending(true);
        setError("");
        setMessage("");
        try {
            codeSent(await apiRequest<VerificationResponse>("/api/auth/resend-signup-code", { method: "POST" }));
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unable to resend verification code");
        } finally {
            setLoading(false);
            setResending(false);
        }
    };

    return (
        <section className="flex min-h-dvh items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                
                <div className="relative mb-4 flex min-h-12 items-center justify-center">
                    <Link
                        href="/"
                        className="absolute left-0 inline-flex items-center gap-1 text-xs font-medium text-gray-500 transition hover:text-black"
                    >
                        <span aria-hidden="true">←</span>
                        Home
                    </Link>

                    <h1 className="text-center text-xl font-bold text-gray-900 sm:text-2xl">
                        {step === "details" ? "Create Account" : "Verify Email"}
                    </h1>
                </div>

                <p className="-mt-5 mb-8 wrap-break-word text-center text-sm text-gray-500">
                    {step === "details" ? "Create your ShopEase account" : `Enter the 6-digit code sent to ${verificationEmail}`}
                </p>

                
                {error && (
                    <div role="alert" className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}
                {message && <div role="status" className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}

                
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    {step === "details" ? <>
                    <div>
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your name"
                            required
                            disabled={loading}
                            autoComplete="name"
                            minLength={2}
                            maxLength={50}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            disabled={loading}
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            disabled={loading}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="At least 6 characters"
                            required
                            minLength={6}
                            maxLength={100}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                        />
                    </div>
                    </> : <div>
                        <label htmlFor="signup-otp" className="mb-2 block text-sm font-medium text-gray-700">Verification code</label>
                        <input id="signup-otp" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit code" disabled={loading} required className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 outline-none transition focus:border-black focus:ring-1 focus:ring-black" />
                        <p className="mt-2 text-xs text-gray-500">The code expires in 10 minutes. Your account is created only after verification.</p>
                    </div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {resending ? "Sending code..." : loading ? step === "details" ? "Sending code..." : "Verifying..." : step === "details" ? "Send verification code" : "Verify & Create Account"}
                    </button>
                    {step === "verify" && <>
                        <button type="button" disabled={loading || resendSeconds > 0} onClick={handleResend} className="w-full text-sm font-medium text-gray-600 transition hover:text-black disabled:cursor-not-allowed disabled:opacity-50">{resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : "Resend code"}</button>
                        <button type="button" disabled={loading} onClick={() => {
                            setStep("details");
                            setOtp("");
                            setError("");
                            setMessage("");
                            setResendAt(0);
                        }} className="w-full text-sm text-gray-500 transition hover:text-black disabled:opacity-50">Go back / change email</button>
                    </>}
                </form>

                {step === "details" && <GoogleSignInButton disabled={loading} onLoadingChange={setLoading} />}

                
                <p className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link
                        href="/auth/login"
                        className="font-medium text-black hover:underline"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </section>
    );
}
