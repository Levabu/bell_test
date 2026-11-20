import type { ProductId, ProductShowcaseBlock } from '../types'

const DAY_MS = 86_400_000

/**
 * Calendar-day number in the editorial timezone (Moscow), so the product
 * switches at midnight for everyone at once, regardless of the reader's TZ.
 */
export function dayNumber(now: Date, timeZone = 'Europe/Moscow'): number {
  const ymd = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now) // "2026-11-19"
  return Math.floor(Date.parse(`${ymd}T00:00:00Z`) / DAY_MS)
}

/** True if a subscription to `owned` already gives access to `product`. */
export function hasAccess(owned: ProductId[], product: ProductId): boolean {
  return owned.includes('unlimited') || owned.includes(product)
}

/**
 * Which product the showcase shows today.
 * 1. Never advertise something the reader already has.
 * 2. Pinned by the editor → that product.
 * 3. Otherwise rotate through the pool, one product per day.
 * Returns null → the block is hidden.
 */
export function pickShowcaseProduct(
  cfg: Pick<ProductShowcaseBlock, 'mode' | 'pinned' | 'pool'>,
  now: Date,
  owned: ProductId[] = [],
): ProductId | null {
  if (cfg.mode === 'pinned' && !hasAccess(owned, cfg.pinned)) return cfg.pinned
  const pool = cfg.pool.filter((id) => !hasAccess(owned, id))
  if (pool.length === 0) return null
  return pool[dayNumber(now) % pool.length]
}
