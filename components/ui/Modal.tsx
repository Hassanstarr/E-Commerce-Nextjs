"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { HiXMark } from "react-icons/hi2";

interface ModalProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    onClose?: () => void;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}

const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
};

export default function Modal({
    title,
    subtitle,
    children,
    onClose,
    maxWidth = "2xl",
}: ModalProps) {
    const router = useRouter();
    const overlayRef = useRef<HTMLDivElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    const handleClose = useCallback(() => {
        if (onClose) {
            onClose();
        } else {
            router.back();
        }
    }, [onClose, router]);


    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                handleClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleClose]);

    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    useEffect(() => {
        if (dialogRef.current) {
            dialogRef.current.focus();
        }
    }, []);

    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === overlayRef.current) {
            handleClose();
        }
    };

    return (
        <div
            ref={overlayRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity sm:p-6"
            aria-modal="true"
            role="dialog"
            aria-labelledby="modal-title"
        >
            <div
                ref={dialogRef}
                tabIndex={-1}
                className={`relative flex max-h-[90vh] w-full ${maxWidthClasses[maxWidth]} flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl outline-none`}
            >
                
                <div className="flex items-start justify-between border-b border-gray-100 p-6">
                    <div>
                        <h2
                            id="modal-title"
                            className="text-xl font-bold text-gray-900 sm:text-2xl"
                        >
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="mt-1 text-sm text-gray-500">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Close modal"
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    >
                        <HiXMark className="h-5 w-5" />
                    </button>
                </div>


                <div className="overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
