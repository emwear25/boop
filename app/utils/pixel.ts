/** Meta Pixel, loaded only after the visitor accepts marketing cookies (GDPR). */
export const PIXEL_ID = '1807954346989598'
const KEY = 'boop-consent'

type Fbq = ((...a: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue: unknown[]; loaded?: boolean; version?: string; push?: unknown }
declare global { interface Window { fbq?: Fbq; _fbq?: Fbq } }

export const consent = () => useState<'yes' | 'no' | null>('consent', () => null)

export function readConsent() {
  try { return (localStorage.getItem(KEY) as 'yes' | 'no' | null) ?? null } catch { return null }
}

export function setConsent(v: 'yes' | 'no') {
  try { localStorage.setItem(KEY, v) } catch {}
  consent().value = v
  if (v === 'yes') loadPixel()
}

let loaded = false
export function loadPixel() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  const q = function (...a: unknown[]) { q.callMethod ? q.callMethod(...a) : q.queue.push(a) } as Fbq
  q.queue = []; q.loaded = true; q.version = '2.0'; q.push = q
  window.fbq = window._fbq = q
  const s = document.createElement('script'); s.async = true; s.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(s)
  window.fbq('init', PIXEL_ID)
  window.fbq('track', 'PageView')
}

/** Standard event; no-op without consent. */
export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !loaded || !window.fbq) return
  window.fbq('track', event, params)
}
