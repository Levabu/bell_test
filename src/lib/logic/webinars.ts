import type { Webinar, WebinarsBlock } from '../types'

export type WebinarStatus = 'upcoming' | 'live' | 'past'
export interface WebinarItem extends Webinar {
  status: WebinarStatus
}

/** Webinars don't have an end time in the source; assume 90 minutes. */
export const WEBINAR_DURATION_MS = 90 * 60_000

export function webinarStatus(w: Webinar, now: Date): WebinarStatus {
  const start = Date.parse(w.startsAt)
  const t = now.getTime()
  if (t < start) return 'upcoming'
  if (t < start + WEBINAR_DURATION_MS) return 'live'
  return 'past'
}

/**
 * What the webinars block shows:
 * - only the configured product (or all),
 * - live & upcoming first, nearest first,
 * - then (if enabled) past ones as recordings, most recent first,
 * - capped at `limit`. Empty result → the block is hidden.
 */
export function selectWebinars(
  list: Webinar[],
  cfg: Pick<WebinarsBlock, 'productId' | 'limit' | 'showPast'>,
  now: Date,
): WebinarItem[] {
  const items = list
    .filter((w) => cfg.productId === null || w.productId === cfg.productId)
    .map((w) => ({ ...w, status: webinarStatus(w, now) }))

  const byStart = (a: WebinarItem, b: WebinarItem) => Date.parse(a.startsAt) - Date.parse(b.startsAt)
  const active = items.filter((w) => w.status !== 'past').sort(byStart)
  const past = cfg.showPast ? items.filter((w) => w.status === 'past').sort((a, b) => byStart(b, a)) : []

  return [...active, ...past].slice(0, Math.max(0, cfg.limit))
}

export type SubscriberAction = { kind: 'link'; label: string; href: string } | { kind: 'note'; text: string }

/**
 * What a subscriber sees instead of the paywall button.
 * - Still upcoming → "you're registered, the link comes by email" (same for every
 *   webinar, whether or not we already know its stream URL).
 * - Live or over → its own link, or the webinar season page if it has none yet
 *   (never promise a future email for an event that has started).
 */
export function subscriberAction(w: WebinarItem, fallbackUrl: string): SubscriberAction {
  if (w.status === 'upcoming') return { kind: 'note', text: 'Вы зарегистрированы — ссылка придёт на почту' }
  const label = w.status === 'past' ? 'Смотреть запись' : 'Перейти к вебинару'
  return { kind: 'link', label, href: w.url ?? fallbackUrl }
}
