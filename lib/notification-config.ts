export function notificationRetentionDays() {
    const days = Number(process.env.NOTIFICATION_RETENTION_DAYS || 30);
    return Number.isInteger(days) && days >= 1 && days <= 365 ? days : 30;
}

export function notificationExpiry(createdAt = new Date()) {
    return new Date(createdAt.getTime() + notificationRetentionDays() * 86400000);
}
