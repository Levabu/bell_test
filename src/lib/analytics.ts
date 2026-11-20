// Stub: pushes to GTM's dataLayer (the site already uses GTM) and logs in dev.
declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

export function track(event: string, params: Record<string, unknown> = {}): void {
  window.dataLayer ??= []
  window.dataLayer.push({ event, ...params })
  if (import.meta.env.DEV) console.debug('[track]', event, params)
}
