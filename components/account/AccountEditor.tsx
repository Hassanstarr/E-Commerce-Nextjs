"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";

type AccountEditorProps = {
    user: { name: string };
    mode: "name" | "password";
    onClose: () => void;
};

export default function AccountEditor({ user, mode, onClose }: AccountEditorProps) {
    const { refreshUser } = useAuth();
    const [name, setName] = useState(user.name);
    const [savingName, setSavingName] = useState(false);
    const [nameError, setNameError] = useState("");
    const [nameSuccess, setNameSuccess] = useState("");
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [showPasswords, setShowPasswords] = useState(false);

    const inputClass = "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500";
    const buttonClass = "rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500";
    const nameChanged = name.trim() !== user.name;

    const handleNameSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (savingName || !nameChanged) return;

        setSavingName(true);
        setNameError("");
        setNameSuccess("");

        try {
            const response = await apiRequest<{ data: { name: string }; message: string }>("/api/account", {
                method: "PATCH",
                body: JSON.stringify({ name }),
            });

            setName(response.data.name);
            await refreshUser();
            setNameSuccess(response.message);
        } catch (error) {
            setNameError(error instanceof Error ? error.message : "Unable to update your name");
        } finally {
            setSavingName(false);
        }
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setPasswords((previous) => ({ ...previous, [name]: value }));
        setPasswordError("");
        setPasswordSuccess("");
    };

    const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (savingPassword) return;

        setPasswordError("");
        setPasswordSuccess("");

        if (passwords.newPassword !== passwords.confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }

        setSavingPassword(true);

        try {
            const response = await apiRequest<{ message: string }>("/api/account/password", {
                method: "PUT",
                body: JSON.stringify(passwords),
            });

            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setShowPasswords(false);
            setPasswordSuccess(response.message);
        } catch (error) {
            setPasswordError(error instanceof Error ? error.message : "Unable to change your password");
        } finally {
            setSavingPassword(false);
        }
    };

    const cancelClass = "rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-50";

    return (
        <div id={mode === "name" ? "account-name-editor" : "account-password-editor"} className="border-t border-gray-100 bg-gray-50 px-6 py-6 sm:px-8">
            <h3 className="mb-5 font-semibold text-gray-900">{mode === "name" ? "Edit name" : "Change password"}</h3>
            {mode === "name" ? (
                <form onSubmit={handleNameSubmit} className="space-y-5">
                    {nameError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{nameError}</p>}
                    {nameSuccess && <p role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{nameSuccess}</p>}

                    <div>
                        <label htmlFor="settings-name" className="mb-2 block text-sm font-medium text-gray-700">Name</label>
                        <input id="settings-name" name="name" type="text" autoComplete="name" autoFocus minLength={2} maxLength={50} aria-describedby="name-help" value={name} onChange={(event) => {
                            setName(event.target.value);
                            setNameError("");
                            setNameSuccess("");
                        }} disabled={savingName} required className={inputClass} />
                        <p id="name-help" className="mt-2 text-xs text-gray-500">Use 2 to 50 characters for your name.</p>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
                        <button type="button" onClick={onClose} disabled={savingName} className={cancelClass}>{nameSuccess ? "Done" : "Cancel"}</button>
                        <button type="submit" disabled={savingName || !nameChanged || name.trim().length < 2} className={buttonClass}>
                            {savingName ? "Saving..." : "Save name"}
                        </button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                    {passwordError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{passwordError}</p>}
                    {passwordSuccess && <p role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{passwordSuccess}</p>}

                    <div>
                        <label htmlFor="current-password" className="mb-2 block text-sm font-medium text-gray-700">Current password</label>
                        <input id="current-password" name="currentPassword" type={showPasswords ? "text" : "password"} autoComplete="current-password" autoFocus value={passwords.currentPassword} onChange={handlePasswordChange} maxLength={100} disabled={savingPassword} required className={inputClass} />
                    </div>

                    <div>
                        <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-gray-700">New password</label>
                        <input id="new-password" name="newPassword" type={showPasswords ? "text" : "password"} autoComplete="new-password" value={passwords.newPassword} onChange={handlePasswordChange} minLength={6} maxLength={100} aria-describedby="password-help" disabled={savingPassword} required className={inputClass} />
                        <p id="password-help" className="mt-2 text-xs text-gray-500">Use at least 6 characters, excluding spaces at the beginning or end.</p>
                    </div>

                    <div>
                        <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-gray-700">Confirm new password</label>
                        <input id="confirm-password" name="confirmPassword" type={showPasswords ? "text" : "password"} autoComplete="new-password" value={passwords.confirmPassword} onChange={handlePasswordChange} minLength={6} maxLength={100} disabled={savingPassword} required className={inputClass} />
                    </div>

                    <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-gray-600">
                        <input type="checkbox" checked={showPasswords} onChange={(event) => setShowPasswords(event.target.checked)} disabled={savingPassword} className="h-4 w-4 rounded border-gray-300 accent-black" />
                        Show passwords
                    </label>

                    <div className="flex flex-col gap-4 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-gray-500">Other sessions will be signed out.</p>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={onClose} disabled={savingPassword} className={cancelClass}>{passwordSuccess ? "Done" : "Cancel"}</button>
                            <button type="submit" disabled={savingPassword || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword} className={buttonClass}>
                                {savingPassword ? "Updating..." : "Update password"}
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}
