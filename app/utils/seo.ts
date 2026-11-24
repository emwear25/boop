// SEO helpers shared by pages and the server routes (sitemap, llms.txt, merchant feed).
// Plain TS, no Nuxt imports, so Nitro can use it too.
import { categoryOf, fromPrice, productImages, type Product, type CategoryId } from '../data/catalog'

export const SITE = 'https://boop.bg'
export const SITE_NAME = 'boop'
export const OG_IMAGE = `${SITE}/og.jpg`

export const abs = (path: string) => (path.startsWith('http') ? path : `${SITE}${path.startsWith('/') ? '' : '/'}${path}`)

/** Fit text in n characters: whole sentences when possible, otherwise cut at a word. */
export function clip(text: string, n: number) {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= n) return t
  const sentences = t.match(/[^.!?]+[.!?]+/g) ?? []
  let out = ''
  for (const s of sentences) { if ((out + s).trim().length > n) break; out += s }
  if (out.trim().length >= n * 0.55) return out.trim()
  const comma = t.lastIndexOf(',', n - 1)
  if (comma >= n * 0.5) return `${t.slice(0, comma)}.`
  const cut = t.slice(0, n - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.;:–-]+$/, '')}…`
}

export const productShortName = (name: string) => name.replace(/ с име$/, '').replace(/^(Медальон|Лъжичка) /, '')

/** What the product is, in the words people search with ("Повдигната купичка за куче с име"). */
export function productKind(p: Product) {
  switch (p.category as CategoryId) {
    case 'kupichki-s-ime':
      if (p.slug.startsWith('dve-')) return 'Две повдигнати купички за куче с име'
      return p.slug.startsWith('povdignata-') ? 'Повдигната купичка за куче с име' : 'Купичка за куче с име'
    case 'medalyoni-s-ime': return 'Медальон за куче с име'
    case 'lazhichki-za-granuli': return 'Лъжичка за гранули с име'
    case 'zakachalki-za-povod': return p.personalise ? 'Закачалка за повод с име' : 'Закачалка за повод'
    case 'koledni-kupichki': return 'Коледна купичка за куче'
    default: return p.slug.startsWith('dvoyna-') ? 'Двойна купичка за куче и котка' : 'Купичка за куче и котка'
  }
}

/** "Повдигната купичка за куче с име „Лапа“" */
export const productSeoName = (p: Product) => `${productKind(p)} „${productShortName(p.name)}“`

export function productSeoTitle(p: Product) {
  const full = productSeoName(p)
  return full.length <= 52 ? full : `${productKind(p).replace(' за куче', '')} „${productShortName(p.name)}“`
}

export function productSeoDescription(p: Product) {
  const from = fromPrice(p).toFixed(2).replace('.', ',')
  const tail = ` ${p.sizes ? 'От' : 'Цена'} ${from} €. Изработка в България, доставка с Еконт и Спиди.`
  return clip(`${p.tagline} ${p.description}`, 158 - tail.length) + tail
}

export const productImageUrls = (p: Product) => productImages(p).map(i => abs(i.src))

const returnPolicy = (p: Product) => (p.personalise?.required
  ? { '@type': 'MerchantReturnPolicy', applicableCountry: 'BG', returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted' }
  : { '@type': 'MerchantReturnPolicy', applicableCountry: 'BG', returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow', merchantReturnDays: 14, returnMethod: 'https://schema.org/ReturnByMail', returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility' })

const shipping = {
  '@type': 'OfferShippingDetails',
  shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'BG' },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 5, unitCode: 'DAY' },
    transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
  },
}

/** Valid for 1 year from build; Google wants a date for priceValidUntil. */
const validUntil = () => `${new Date().getFullYear() + 1}-12-31`

export function productJsonLd(p: Product) {
  const url = abs(`/product/${p.slug}`)
  const base = {
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
    priceValidUntil: validUntil(),
    url,
    seller: { '@id': `${SITE}/#org` },
    hasMerchantReturnPolicy: returnPolicy(p),
    shippingDetails: shipping,
  }
  const offers = p.sizes
    ? p.sizes.map(s => ({ '@type': 'Offer', ...base, name: s.label ?? `${s.cm} см`, sku: `${p.slug}-${s.cm}`, price: s.price.toFixed(2) }))
    : [{ '@type': 'Offer', ...base, sku: p.slug, price: fromPrice(p).toFixed(2) }]
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: productSeoName(p),
    description: `${p.tagline} ${p.description}`,
    sku: p.slug,
    image: productImageUrls(p),
    url,
    brand: { '@type': 'Brand', name: SITE_NAME },
    category: categoryOf(p.category).title,
    color: (p.colours ?? [p.colour]).map(c => c.name).join(', '),
    material: p.category === 'medalyoni-s-ime' ? undefined : 'PLA, неръждаема стомана',
    countryOfOrigin: 'BG',
    offers: offers.length === 1 ? offers[0] : {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      lowPrice: Math.min(...offers.map(o => Number(o.price))).toFixed(2),
      highPrice: Math.max(...offers.map(o => Number(o.price))).toFixed(2),
      offerCount: offers.length,
      availability: 'https://schema.org/InStock',
      offers,
    },
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
  }
}

export function faqJsonLd(faq: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
}

/** <script type="application/ld+json"> entry for useHead. */
export const ldScript = (data: object, key: string) => ({ key, type: 'application/ld+json' as const, innerHTML: JSON.stringify(data) })
