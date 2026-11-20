// Static snapshots of real data (see /data in the repo root).
// In production these come from the CMS / billing API and the webinars source.
import productsJson from '../data/products.json'
import webinarsJson from '../data/webinars.json'
import articlesJson from '../data/articles.json'
import type { Article, Headline, Period, Product, ProductId, Webinar } from './types'

export const periods = productsJson.periods as Period[]
export const products = productsJson.products as Product[]
export const webinars = webinarsJson.webinars as Webinar[]
export const articles = articlesJson.articles as Article[]
export const headlines = articlesJson.headlines as Headline[]

/** Webinar season page: fallback for a live/past webinar that has no own link yet. */
export const WEBINARS_URL = 'https://the-chat.io/'

/** Existing thebell.io sign-in (email magic link or password). */
export const LOGIN_URL = 'https://thebell.io/account/login'

export const OFFER_URL = 'https://drive.google.com/file/d/1iZPp8aB0SRN_B4uixMi-LFvBxM4DHuit/view'

export function getProduct(id: ProductId): Product {
  const p = products.find((x) => x.id === id)
  if (!p) throw new Error(`Unknown product: ${id}`)
  return p
}
