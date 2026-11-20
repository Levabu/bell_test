import type { Currency, Period, PeriodId, Product } from '../types'

export function formatPrice(amount: number, currency: Currency): string {
  const n = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return currency === 'USD' ? `$${n}` : `${n} ₽`
}

export function currencies(product: Product): Currency[] {
  return (['USD', 'RUB'] as const).filter((c) => Object.keys(product.prices[c] ?? {}).length > 0)
}

/** Periods that actually have a price for this product in this currency. */
export function availablePeriods(product: Product, currency: Currency, all: Period[]): Period[] {
  const prices = product.prices[currency] ?? {}
  return all.filter((p) => prices[p.id] !== undefined)
}

/** Default selection: monthly if it exists (like the current site), else the first one. */
export function defaultPeriod(product: Product, currency: Currency, all: Period[]): PeriodId {
  const avail = availablePeriods(product, currency, all)
  return (avail.find((p) => p.id === 'm1') ?? avail.find((p) => p.id !== 'trial') ?? avail[0]).id
}

export function priceOf(product: Product, currency: Currency, period: PeriodId): number | undefined {
  return product.prices[currency]?.[period]
}

/** "от $9,80 в месяц" — cheapest regular monthly-equivalent, for teasers. */
export function startingPrice(product: Product, currency: Currency, all: Period[]): string | null {
  const regular = availablePeriods(product, currency, all).filter((p) => p.id !== 'trial')
  if (regular.length === 0) return null
  const m1 = product.prices[currency]?.m1
  if (m1 !== undefined) return `от ${formatPrice(m1, currency)} в месяц`
  const yearly = product.prices[currency]?.m12
  if (yearly !== undefined) return `${formatPrice(yearly, currency)} в год`
  const p = regular[0]
  return `${formatPrice(product.prices[currency]![p.id]!, currency)} ${p.unit}`
}
