/** Meta Pixel + Google Analytics 4 + PostHog, loaded only after the visitor accepts cookies (GDPR). */
export const PIXEL_ID = '1807954346989598'
export const GA_ID = 'G-FSB2QR5QZQ'
export const POSTHOG_KEY = 'phc_rQ3mYDkujunBdzV27RNBLNtY6waJpYA4kNgPKxMJTfP5' // public project token

type PostHog = typeof import('posthog-js').default
let ph: PostHog | null = null
const KEY = 'boop-consent'

type Fbq = ((...a: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue: unknown[]; loaded?: boolean; version?: string; push?: unknown }
declare global { interface Window { fbq?: Fbq; _fbq?: Fbq; dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void } }

export const consent = () => useState<'yes' | 'no' | null>('consent', () => null)

export function readConsent() {
  try { return (localStorage.getItem(KEY) as 'yes' | 'no' | null) ?? null } catch { return null }
}

export function setConsent(v: 'yes' | 'no') {
  try { localStorage.setItem(KEY, v) } catch {}
  consent().value = v
  if (v === 'yes') loadPixel()
  else ph?.opt_out_capturing()
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

  // GA4: page views on SPA navigation come from enhanced measurement (history changes)
  window.dataLayer = window.dataLayer || []
  window.gtag = function () { window.dataLayer!.push(arguments) } // eslint-disable-line prefer-rest-params
  window.gtag('js', new Date())
  window.gtag('config', GA_ID)
  const g = document.createElement('script'); g.async = true; g.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(g)

  // PostHog: page views on SPA navigation, session replay with every input masked
  import('posthog-js').then(({ default: posthog }) => {
    posthog.init(POSTHOG_KEY, {
      api_host: 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: 'history_change',
      session_recording: { maskAllInputs: true },
    })
    ph = posthog
  }).catch(() => {})
}

const PH_EVENT: Record<string, string> = { ViewContent: 'product_viewed', AddToCart: 'product_added_to_cart', InitiateCheckout: 'checkout_started', Purchase: 'order_completed' }

// Meta standard event -> GA4 recommended e-commerce event
const GA_EVENT: Record<string, string> = { ViewContent: 'view_item', AddToCart: 'add_to_cart', InitiateCheckout: 'begin_checkout', Purchase: 'purchase' }

/** Standard event; no-op without consent. */
export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !loaded) return
  window.fbq?.('track', event, params)
  if (ph && PH_EVENT[event]) ph.capture(PH_EVENT[event], params)
  const ga = GA_EVENT[event]
  if (ga && window.gtag) {
    const ids = (params?.content_ids as string[] | undefined) ?? []
    window.gtag('event', ga, {
      currency: params?.currency ?? 'EUR', value: params?.value,
      ...(params?.transaction_id ? { transaction_id: params.transaction_id } : {}),
      items: ids.map(id => ({ item_id: id, item_name: params?.content_name ?? id })),
    })
  }
}
