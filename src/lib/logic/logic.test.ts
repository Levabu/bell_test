import { describe, expect, it } from 'vitest'
import { dayNumber, pickShowcaseProduct } from './showcase'
import { selectWebinars, subscriberAction, webinarStatus } from './webinars'
import { availablePeriods, defaultPeriod, formatPrice } from './pricing'
import { validateCard } from './card'
import { resolveBasis, webinarsBasis } from './lines'
import { periods, products, webinars } from '../data'
import type { ProductShowcaseBlock } from '../types'

const rotate: Pick<ProductShowcaseBlock, 'mode' | 'pinned' | 'pool'> = {
  mode: 'rotate',
  pinned: 'tech',
  pool: ['invest', 'tech', 'news', 'unlimited'],
}

describe('product showcase', () => {
  it('rotates one product per Moscow calendar day, cycling the pool', () => {
    const d0 = new Date('2026-11-19T12:00:00Z')
    const seen = [0, 1, 2, 3, 4].map((i) => pickShowcaseProduct(rotate, new Date(d0.getTime() + i * 86_400_000)))
    expect(new Set(seen.slice(0, 4)).size).toBe(4)
    expect(seen[4]).toBe(seen[0])
  })

  it('switches at Moscow midnight, not UTC midnight', () => {
    // 22:30 UTC = 01:30 MSK next day
    expect(dayNumber(new Date('2026-11-19T22:30:00Z'))).toBe(dayNumber(new Date('2026-11-20T10:00:00Z')))
  })

  it('pinned wins over rotation', () => {
    expect(pickShowcaseProduct({ ...rotate, mode: 'pinned', pinned: 'invest' }, new Date())).toBe('invest')
  })

  it('never shows a product the reader already has', () => {
    for (let i = 0; i < 8; i++) {
      const now = new Date(Date.UTC(2026, 10, 19 + i, 12))
      expect(pickShowcaseProduct(rotate, now, ['tech'])).not.toBe('tech')
      expect(pickShowcaseProduct({ ...rotate, mode: 'pinned', pinned: 'tech' }, now, ['tech'])).not.toBe('tech')
    }
  })

  it('hides for Unlimited subscribers', () => {
    expect(pickShowcaseProduct(rotate, new Date(), ['unlimited'])).toBeNull()
  })
})

describe('rows', () => {
  it('a full row keeps the editor basis', () => {
    expect(resolveBasis(33, 3)).toBe(33)
    expect(resolveBasis(25, 4)).toBe(25)
  })
  it('re-splits when a widget hides, never leaving an empty slot', () => {
    expect(resolveBasis(33, 2)).toBe(50)
    expect(resolveBasis(50, 1)).toBe(100)
    expect(resolveBasis(25, 3)).toBe(33)
  })
  it('hides an empty row', () => {
    expect(resolveBasis(100, 0)).toBeNull()
  })
  it('webinars: a feed needs 4 cards, otherwise falls back to blocks', () => {
    expect(webinarsBasis('feed', 4)).toBe(25)
    expect(webinarsBasis('feed', 3)).toBe(33)
    expect(webinarsBasis('feed', 1)).toBe(100)
    expect(webinarsBasis('feed', 0)).toBeNull()
  })
  it('webinars: blocks are at most 3 in a row', () => {
    expect(webinarsBasis('blocks', 4)).toBe(33)
    expect(webinarsBasis('blocks', 2)).toBe(50)
  })
})

describe('webinars', () => {
  const now = new Date('2026-11-19T12:00:00Z')

  it('computes status from the date', () => {
    const w = webinars.find((x) => x.id === 'arkhipova-anthropology')!
    expect(webinarStatus(w, now)).toBe('upcoming')
    expect(webinarStatus(w, new Date('2026-12-03T18:30:00Z'))).toBe('live')
    expect(webinarStatus(w, new Date('2026-12-04T00:00:00Z'))).toBe('past')
  })

  it('upcoming first, then most recent past', () => {
    const ids = selectWebinars(webinars, { productId: null, limit: 4, showPast: true }, now).map((w) => w.id)
    expect(ids).toEqual(['arkhipova-anthropology', 'peshkin-aging', 'libermans-future-of-ai', 'dashevsky-portfolio-2026'])
  })

  it('respects limit, product filter and showPast', () => {
    expect(selectWebinars(webinars, { productId: null, limit: 2, showPast: true }, now)).toHaveLength(2)
    expect(selectWebinars(webinars, { productId: 'tech', limit: 4, showPast: true }, now).map((w) => w.id)).toEqual([
      'libermans-future-of-ai',
    ])
    expect(selectWebinars(webinars, { productId: null, limit: 4, showPast: false }, now)).toHaveLength(1)
  })

  it('subscribers: a webinar without its own link points to the season page once it has started', () => {
    const w = webinars.find((x) => x.id === 'arkhipova-anthropology')!
    const at = (iso: string) => ({ ...w, status: webinarStatus(w, new Date(iso)) })
    expect(subscriberAction(at('2026-11-19T12:00:00Z'), 'https://fallback')).toEqual({
      kind: 'note',
      text: 'Вы зарегистрированы — ссылка придёт на почту',
    })
    expect(subscriberAction(at('2026-12-03T18:30:00Z'), 'https://fallback')).toMatchObject({ kind: 'link', href: 'https://fallback', label: 'Перейти к вебинару' })
    expect(subscriberAction(at('2026-12-10T12:00:00Z'), 'https://fallback')).toMatchObject({ kind: 'link', href: 'https://fallback', label: 'Смотреть запись' })
  })

  it('subscribers: an own link wins once it has started; before that, every card says the link comes by email', () => {
    const w = webinars.find((x) => x.id === 'peshkin-aging')!
    expect(subscriberAction({ ...w, status: 'past' }, 'https://fallback')).toMatchObject({ href: w.url, label: 'Смотреть запись' })
    expect(subscriberAction({ ...w, status: 'live' }, 'https://fallback')).toMatchObject({ href: w.url, label: 'Перейти к вебинару' })
    expect(subscriberAction({ ...w, status: 'upcoming' }, 'https://fallback')).toMatchObject({ kind: 'note' })
  })

  it('is empty (block hidden) when nothing qualifies', () => {
    expect(selectWebinars(webinars, { productId: 'tech', limit: 4, showPast: false }, now)).toEqual([])
  })
})

describe('pricing', () => {
  const tech = products.find((p) => p.id === 'tech')!
  it('RUB only offers what exists', () => {
    expect(availablePeriods(tech, 'RUB', periods).map((p) => p.id)).toEqual(['m12'])
    expect(defaultPeriod(tech, 'RUB', periods)).toBe('m12')
    expect(defaultPeriod(tech, 'USD', periods)).toBe('m1')
  })
  it('formats like the site', () => {
    expect(formatPrice(14.9, 'USD')).toBe('$14,90')
    expect(formatPrice(149, 'USD')).toBe('$149')
    expect(formatPrice(12800, 'RUB').replace(/\s/g, ' ')).toBe('12 800 ₽')
  })
})

describe('card validation', () => {
  const now = new Date('2026-11-19')
  it('accepts the test cards', () => {
    expect(validateCard({ email: 'a@b.io', number: '4242 4242 4242 4242', exp: '12/28', cvc: '123' }, now)).toEqual({})
  })
  it('flags bad input', () => {
    const e = validateCard({ email: 'nope', number: '1234', exp: '10/26', cvc: '1' }, now)
    expect(Object.keys(e).sort()).toEqual(['cvc', 'email', 'exp', 'number'])
  })
})
