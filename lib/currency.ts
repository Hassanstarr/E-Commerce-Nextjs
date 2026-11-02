const formatter = new Intl.NumberFormat("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatAmount(value: number) {
    return formatter.format(value);
}

export function lineTotal(price: number, quantity: number) {
    return Math.round(price * 100) * quantity / 100;
}
