"use client";

import type { RefObject } from "react";
import { HiOutlineArrowRightOnRectangle } from "react-icons/hi2";

type LogoutDialogProps = {
    dialogRef: RefObject<HTMLDialogElement | null>;
    loading: boolean;
    error: string;
    onClose: () => void;
    onConfirm: () => void;
};

export default function LogoutDialog({ dialogRef, loading, error, onClose, onConfirm }: LogoutDialogProps) {
    return (
        <dialog
            ref={dialogRef}
            aria-labelledby="logout-title"
            aria-describedby="logout-description"
            onClose={onClose}
            onCancel={(event) => { if (loading) event.preventDefault(); }}
            className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-sm rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
        >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <HiOutlineArrowRightOnRectangle className="h-6 w-6 text-gray-700" />
            </div>
            <h2 id="logout-title" className="text-xl font-semibold">Log out of ShopEase?</h2>
            <p id="logout-description" className="mt-2 text-sm leading-6 text-gray-500">You can sign back in anytime to access your account, orders, and wishlist.</p>
            {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="mt-6 flex gap-3">
                <button type="button" disabled={loading} onClick={onClose} className="flex-1 cursor-pointer rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                <button type="button" disabled={loading} onClick={onConfirm} className="flex-1 cursor-pointer rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-wait disabled:opacity-50">{loading ? "Logging out..." : "Logout"}</button>
            </div>
        </dialog>
    );
}
