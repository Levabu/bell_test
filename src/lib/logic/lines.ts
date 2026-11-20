import type { Basis, WebinarsView } from '../types'

/** How many equal slots a row of this basis has. */
export const SLOTS: Record<Basis, number> = { 25: 4, 33: 3, 50: 2, 100: 1 }

const BY_COUNT: Record<number, Basis> = { 4: 25, 3: 33, 2: 50, 1: 100 }

/**
 * The basis a row is actually rendered with, given how many of its widgets
 * decided to show. A full row keeps the editor's basis; if a widget hides
 * itself (e.g. the showcase for an Unlimited subscriber), the row re-splits
 * among the rest, so there is never an empty slot. 0 → the row is hidden.
 */
export function resolveBasis(basis: Basis, visible: number): Basis | null {
  if (visible <= 0) return null
  if (visible === SLOTS[basis]) return basis
  return BY_COUNT[Math.min(visible, 4)]
}

/** Most cards a webinars row shows in each view. */
export const WEBINARS_MAX: Record<WebinarsView, number> = { feed: 4, blocks: 3 }

/**
 * Basis of a webinars row with `count` cards. A feed needs a full 25% row
 * (4 cards); with fewer it falls back to large blocks, so no slot is empty.
 */
export function webinarsBasis(view: WebinarsView, count: number): Basis | null {
  if (view === 'feed' && count >= SLOTS[25]) return 25
  return resolveBasis(100, Math.min(count, WEBINARS_MAX.blocks))
}
