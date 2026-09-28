import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
};

export default function Input({
    label,
    error,
    className = "",
    ...props
}: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <input
                className={`w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black ${className}`}
                {...props}
            />

            {error && (
                <p className="mt-1 text-sm text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}