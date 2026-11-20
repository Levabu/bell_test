import { getProduct, periods } from './data'
import { defaultPeriod, priceOf } from './logic/pricing'
import { mockPaymentProvider, type PaymentProvider } from './payment'
import { track } from './analytics'
import { demo } from './layout.svelte'
import type { Currency, PeriodId, ProductId, Webinar } from './types'

export type Step = 'tariffs' | 'payment' | 'success'

export interface CheckoutSource {
  block: 'product-showcase' | 'webinars' | 'webinar'
  webinar?: Webinar
  /** Tariff the CTA promised (e.g. 'trial' for "Попробовать"); used if the product has it. */
  period?: PeriodId
}

const provider: PaymentProvider = mockPaymentProvider

class Checkout {
  open = $state(false)
  step = $state<Step>('tariffs')
  productId = $state<ProductId>('tech')
  currency = $state<Currency>('USD')
  period = $state<PeriodId>('m1')
  source = $state<CheckoutSource | null>(null)

  email = $state('')
  processing = $state(false)
  error = $state<string | null>(null)
  orderId = $state<string | null>(null)

  product = $derived(getProduct(this.productId))
  amount = $derived(priceOf(this.product, this.currency, this.period) ?? 0)

  start(productId: ProductId, source: CheckoutSource) {
    this.source = source
    this.selectProduct(productId)
    if (source.period && priceOf(this.product, this.currency, source.period) !== undefined) this.period = source.period
    this.step = 'tariffs'
    this.error = null
    this.orderId = null
    this.open = true
    track('checkout_open', { product: productId, block: source.block, webinar: source.webinar?.id })
  }

  selectProduct(productId: ProductId) {
    this.productId = productId
    const p = getProduct(productId)
    if (!p.prices[this.currency]) this.currency = 'USD'
    this.period = defaultPeriod(p, this.currency, periods)
  }

  setCurrency(c: Currency) {
    this.currency = c
    if (priceOf(this.product, c, this.period) === undefined) {
      this.period = defaultPeriod(this.product, c, periods)
    }
  }

  toPayment() {
    this.step = 'payment'
    this.error = null
    track('checkout_tariff_selected', { product: this.productId, period: this.period, currency: this.currency })
  }

  back() {
    if (this.processing) return
    this.step = 'tariffs'
    this.error = null
  }

  async pay(card: { number: string; exp: string; cvc: string }) {
    if (this.processing) return
    this.processing = true
    this.error = null
    const res = await provider.pay({
      productId: this.productId,
      period: this.period,
      currency: this.currency,
      amount: this.amount,
      email: this.email,
      card,
    })
    this.processing = false
    if (res.ok) {
      this.orderId = res.orderId
      this.step = 'success'
      // In prod the session would refresh from billing; here we just mark it owned.
      if (!demo.owned.includes(this.productId)) demo.owned.push(this.productId)
      track('payment_success', { product: this.productId, period: this.period, currency: this.currency, amount: this.amount })
    } else {
      this.error = res.error
      track('payment_failed', { product: this.productId, reason: res.error })
    }
  }

  close() {
    if (this.processing) return false
    if (this.open && this.step !== 'success') track('checkout_abandon', { product: this.productId, step: this.step })
    this.open = false
    return true
  }
}

export const checkout = new Checkout()
