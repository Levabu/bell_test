import type { LineConfig, ProductId } from './types'

const news = (i: number) => ({ id: `n${i}`, type: 'news' as const, articleIndex: i })
const headline = (i: number) => ({ id: `h${i}`, type: 'headline' as const, headlineIndex: i })

/**
 * The homepage as the builder stores it: rows in the same rhythm as
 * thebell.io today (25 → 50 → 33 → 25 → 50 → 33 … → 100).
 * The showcase takes the middle slot of a 33 row, where the site already puts
 * Invest/Tech stories; webinars take the place of the second row of headlines.
 */
export const defaultLayout: LineConfig[] = [
  { id: 'r1', type: 'line', basis: 25, widgets: [0, 1, 2, 3].map(headline) },
  { id: 'r2', type: 'line', basis: 50, widgets: [news(0), news(1)] },
  {
    id: 'r3',
    type: 'line',
    basis: 33,
    widgets: [
      news(2),
      { id: 'showcase', type: 'product-showcase', mode: 'rotate', pinned: 'tech', pool: ['invest', 'tech', 'news', 'unlimited'] },
      news(3),
    ],
  },
  { id: 'webinars', type: 'webinars', view: 'feed', productId: null, limit: 4, showPast: true },
  { id: 'r5', type: 'line', basis: 50, widgets: [news(4), news(5)] },
  { id: 'r6', type: 'line', basis: 33, widgets: [news(6), news(7), news(8)] },
  { id: 'r7', type: 'line', basis: 100, widgets: [news(9)] },
]

export const layout = $state<LineConfig[]>(structuredClone(defaultLayout))

/* ---------------- demo-only state (date + who is reading) ---------------- */

function initialNow(): Date {
  const q = new URLSearchParams(location.search).get('now')
  const d = q ? new Date(q) : new Date()
  return Number.isNaN(d.getTime()) ? new Date() : d
}

export const demo = $state({
  now: initialNow(),
  /** Products the current reader is subscribed to (from the session in prod). */
  owned: [] as ProductId[],
})
