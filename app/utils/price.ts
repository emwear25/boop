const fmt = new Intl.NumberFormat('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** 24.9 -> "24,90 €" (Bulgarian formatting, euro after the amount) */
export const euro = (n: number) => `${fmt.format(n)} €`

export const FREE_SHIPPING_FROM = 60
