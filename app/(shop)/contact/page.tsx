"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import { submitContactForm } from "@/services/contact.api";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleChange = (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        try {
            setLoading(true);
            setSuccess("");
            setError("");

            await submitContactForm(formData);

            setSuccess(
                "Your message has been sent successfully."
            );

            setFormData({
                name: "",
                email: "",
                message: "",
            });
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Unable to send your message");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="flex min-h-screen bg-gray-50 items-center justify-center">
            <main className="mx-auto w-full max-w-5xl px-4 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Contact Us
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Have a question? Send us a message.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                    {success && (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Name"
                        name="name"
                        className="text-black"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        required
                    />

                    <Input
                        label="Email"
                        name="email"
                        className="text-black"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                    />

                    <div>
                        <label
                            htmlFor="message"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Message
                        </label>

                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows={6}
                            required
                            minLength={10}
                            className="w-full rounded-lg text-black border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                            placeholder="Write your message..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                        {loading ? "Sending..." : "Send Message"}
                    </button>
                </form>
            </main>
        </section>
    );
}