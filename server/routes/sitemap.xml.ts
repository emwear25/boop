import { abs, buildDate, categories, guides, productImageUrls, products, productSeoName, staticPages, xml } from '../utils/site'

export default defineEventHandler((event) => {
  const url = (loc: string, priority: string, lastmod = buildDate, images: { src: string; title: string }[] = []) =>
    `<url><loc>${xml(abs(loc))}</loc><lastmod>${lastmod}</lastmod><priority>${priority}</priority>${
      images.map(i => `<image:image><image:loc>${xml(i.src)}</image:loc><image:title>${xml(i.title)}</image:title></image:image>`).join('')}</url>`
  const body = [
    ...staticPages.map(p => url(p.path, p.priority)),
    ...categories.map(c => url(`/category/${c.id}`, '0.9')),
    ...products.map(p => url(`/product/${p.slug}`, '0.8', buildDate, productImageUrls(p).map(src => ({ src, title: productSeoName(p) })))),
    ...guides.map(g => url(`/saveti/${g.slug}`, '0.6', g.date)),
  ].join('\n')
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>`
})
