export type CardErrors = Partial<Record<'email' | 'number' | 'exp' | 'cvc', string>>

export function formatCardNumber(v: string): string {
  return v
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
}

export function formatExp(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

export function validateCard(
  v: { email: string; number: string; exp: string; cvc: string },
  now: Date,
): CardErrors {
  const e: CardErrors = {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = 'Введите email, например name@mail.com'

  const digits = v.number.replace(/\D/g, '')
  if (digits.length < 13) e.number = 'Проверьте номер карты'

  const m = /^(\d{2})\/(\d{2})$/.exec(v.exp)
  if (!m) e.exp = 'Формат ММ/ГГ'
  else {
    const month = Number(m[1])
    const year = 2000 + Number(m[2])
    const endOfMonth = new Date(year, month, 1) // first day of next month
    if (month < 1 || month > 12) e.exp = 'Нет такого месяца'
    else if (endOfMonth <= now) e.exp = 'Срок действия карты истёк'
  }

  if (!/^\d{3,4}$/.test(v.cvc)) e.cvc = '3 цифры на обороте'
  return e
}
