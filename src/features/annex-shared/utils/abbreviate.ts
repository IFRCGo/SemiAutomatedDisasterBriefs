export function abbreviateNumber(n: number) {
    return Intl.NumberFormat('en-gb', { notation: 'compact' }).format(n);
}
