export type Currency = 'USD' | 'RUB'
export type PeriodId = 'trial' | 'm1' | 'm6' | 'm12'
export type ProductId = 'invest' | 'tech' | 'news' | 'unlimited'

type ByCurrency<T> = Partial<Record<Currency, Partial<Record<PeriodId, T>>>>

export interface Period {
  id: PeriodId
  label: string
  months: number
  unit: string
  billing: string
}

export interface Feature {
  text: string
  /** false = shown crossed out (not included in this tariff) */
  included?: boolean
}

export interface Product {
  id: ProductId
  name: string
  tagline: string
  description: string
  landingUrl: string
  features: { trial?: Feature[]; paid: Feature[] }
  prices: ByCurrency<number>
  oldPrices: ByCurrency<number>
  savings?: ByCurrency<string>
  checkoutUrls: ByCurrency<string>
  highlights: string[]
  freeTier?: { label: string; text: string }
}

export interface Webinar {
  id: string
  title: string
  speaker: string
  speakerRole: string
  /** Card photo from the-chat.io */
  image: string
  /** ISO 8601 with offset */
  startsAt: string
  productId: ProductId
  /** Registration / recording link; null = "details soon" */
  url: string | null
}

export interface Article {
  rubric: string
  title: string
  url: string
  image: string
}

export interface Headline {
  title: string
  time: string
  url: string
}

/* ------------------------------------------------------------------ *
 * Homepage config, the same model the existing thebell.io builder uses:
 * the page is a list of rows ("lines"); every row has a basis that splits
 * it into equal slots (25% → 4, 33% → 3, 50% → 2, 100% → 1), and each slot
 * holds one widget. The new blocks plug into this model unchanged:
 *  - `product-showcase` is a widget that sits in any 33/50/100 slot;
 *  - `webinars` is a row whose slots are filled with webinar cards.
 * ------------------------------------------------------------------ */

export type Basis = 25 | 33 | 50 | 100

export interface NewsWidget {
  id: string
  type: 'news'
  /** image card (33/50/100 rows) */
  articleIndex: number
}

export interface HeadlineWidget {
  id: string
  type: 'headline'
  /** text card (25 rows) */
  headlineIndex: number
}

export interface ProductShowcaseBlock {
  id: string
  type: 'product-showcase'
  /** rotate = a new product every day from `pool`; pinned = always `pinned` */
  mode: 'rotate' | 'pinned'
  pinned: ProductId
  pool: ProductId[]
}

/** One webinar card in a slot of a mixed row: the nearest upcoming one (or the latest recording). */
export interface WebinarWidget {
  id: string
  type: 'webinar'
  /** null = webinars of all products */
  productId: ProductId | null
  /** if nothing is upcoming, show the latest recording */
  showPast: boolean
}

export type Widget = NewsWidget | HeadlineWidget | ProductShowcaseBlock | WebinarWidget

/** An ordinary row: the editor picks the basis and puts widgets into the slots. */
export interface WidgetLine {
  id: string
  type: 'line'
  basis: Basis
  widgets: Widget[]
}

/**
 * A row filled from the webinars feed.
 *  - `feed`: 4 compact cards in a 25% row (a swipe row on phones), like the
 *    headline rows; if fewer than 4 qualify, falls back to `blocks`.
 *  - `blocks`: large cards, up to 3 in a row (3 → 33%, 2 → 50%, 1 → 100%),
 *    stacked on phones, like the image-story rows.
 */
export type WebinarsView = 'feed' | 'blocks'

export interface WebinarsBlock {
  id: string
  type: 'webinars'
  view: WebinarsView
  /** null = webinars of all products */
  productId: ProductId | null
  /** cards to show: up to 4 for `feed`, up to 3 for `blocks` */
  limit: number
  /** fill free slots with past webinars (recordings) */
  showPast: boolean
}

export type LineConfig = WidgetLine | WebinarsBlock
