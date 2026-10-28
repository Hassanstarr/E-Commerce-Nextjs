export type NotificationType = "order" | "payment" | "product" | "discount" | "membership" | "chat" | "stock";
export type NotificationFilter = "all" | "unread";

export type Notification = {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    href: string;
    createdAt: string;
    expiresAt: string;
    readAt: string | null;
    offerEndsAt?: string | null;
    offerExpired?: boolean;
};

export type NotificationPage = {
    items: Notification[];
    unreadCount: number;
    nextCursor: string | null;
    nextExpiry: string | null;
    retentionDays: number;
};
