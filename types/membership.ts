export type MembershipData = {
    plan: { name: string; unitAmount: number; currency: string };
    subscription: {
        status: string;
        active: boolean;
        cancelAtPeriodEnd: boolean;
        paidUntil: string | null;
        currentPeriodEnd: string | null;
        unitAmount: number | null;
        currency: string | null;
        invoiceUrl: string | null;
    };
};
