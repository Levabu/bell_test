import type { Currency, PeriodId, ProductId } from './types'

export interface PaymentRequest {
  productId: ProductId
  period: PeriodId
  currency: Currency
  amount: number
  email: string
  card: { number: string; exp: string; cvc: string }
}

export type PaymentResult = { ok: true; orderId: string } | { ok: false; error: string }

/**
 * The only seam between the UI and billing. In production this calls the
 * existing thebell.site checkout / billing API (or redirects to its hosted
 * payment page and returns here); the UI does not change.
 */
export interface PaymentProvider {
  pay(req: PaymentRequest): Promise<PaymentResult>
}

export const TEST_CARDS = {
  success: '4242 4242 4242 4242',
  declined: '4000 0000 0000 0002',
}

export const mockPaymentProvider: PaymentProvider = {
  async pay(req) {
    await new Promise((r) => setTimeout(r, 1200))
    if (req.card.number.replace(/\D/g, '').endsWith('0002')) {
      return { ok: false, error: 'Банк отклонил платёж. Проверьте данные карты или попробуйте другую.' }
    }
    return { ok: true, orderId: `TB-${Date.now().toString(36).toUpperCase()}` }
  },
}
