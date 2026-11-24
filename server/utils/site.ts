// Server-side view of the catalogue for crawlers (sitemap, llms.txt, Merchant feed).
export { products, categories, fromPrice, productImages, categoryOf } from '../../app/data/catalog'
export { categorySeo } from '../../app/data/categorySeo'
export { guides } from '../../app/data/guides'
export { company } from '../../app/data/company'
export { SITE, abs, productSeoName, productSeoTitle, productSeoDescription, productKind, productImageUrls } from '../../app/utils/seo'

export const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Static pages worth indexing, besides products, categories and guides. */
export const staticPages = [
  { path: '/', priority: '1.0' },
  { path: '/products', priority: '0.9' },
  { path: '/personalize', priority: '0.8' },
  { path: '/saveti', priority: '0.6' },
  { path: '/about', priority: '0.5' },
  { path: '/terms', priority: '0.2' },
  { path: '/privacy', priority: '0.2' },
]

/** Build day, so lastmod moves with each deploy (catalogue lives in code). */
export const buildDate = new Date().toISOString().slice(0, 10)
