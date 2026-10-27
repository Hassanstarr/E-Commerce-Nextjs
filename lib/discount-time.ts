export function formatDiscountTime(endsAt: string | Date, now: number) {
    const remaining = Math.ceil((new Date(endsAt).getTime() - now) / 1000);
    if (!Number.isFinite(remaining) || remaining <= 0) return null;
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor(remaining % 86400 / 3600);
    const minutes = Math.floor(remaining % 3600 / 60);
    const seconds = remaining % 60;
    return `${days ? `${days}d ` : ""}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
