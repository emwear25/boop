import { abs, fromPrice, productImageUrls, products, productSeoName, xml } from '../utils/site'

// Google Merchant Center product feed (free listings in Google Shopping). One item per size,
// grouped by product. Add it in Merchant Center as a scheduled fetch of https://boop.bg/merchant-feed.xml.
const googleCategory = (cat: string) =>
  cat === 'medalyoni-s-ime' ? 'Animals & Pet Supplies > Pet Supplies > Pet ID Tags'
  : cat === 'zakachalki-za-povod' ? 'Animals & Pet Supplies > Pet Supplies'
  : 'Animals & Pet Supplies > Pet Supplies > Pet Bowls, Feeders & Waterers'

export default defineEventHandler((event) => {
  const items = products.flatMap((p) => {
    const imgs = productImageUrls(p)
    const variants = p.sizes ? p.sizes.map(s => ({ id: `${p.slug}-${s.cm}`, price: s.price, size: s.label ?? `${s.cm} см` })) : [{ id: p.slug, price: fromPrice(p), size: '' }]
    return variants.map(v => `<item>
<g:id>${xml(v.id)}</g:id>
<g:title>${xml(productSeoName(p) + (v.size ? `, ${v.size}` : ''))}</g:title>
<g:description>${xml(`${p.tagline} ${p.description} ${p.details.join('. ')}.`)}</g:description>
<g:link>${xml(abs(`/product/${p.slug}`))}</g:link>
<g:image_link>${xml(imgs[0]!)}</g:image_link>
${imgs.slice(1).map(i => `<g:additional_image_link>${xml(i)}</g:additional_image_link>`).join('\n')}
<g:availability>in_stock</g:availability>
<g:price>${v.price.toFixed(2)} EUR</g:price>
<g:brand>boop</g:brand>
<g:condition>new</g:condition>
<g:identifier_exists>no</g:identifier_exists>
<g:google_product_category>${xml(googleCategory(p.category))}</g:google_product_category>
<g:product_type>${xml(p.category)}</g:product_type>
${p.sizes ? `<g:item_group_id>${xml(p.slug)}</g:item_group_id>\n<g:size>${xml(v.size)}</g:size>` : ''}
<g:color>${xml((p.colours ?? [p.colour]).map(c => c.name).slice(0, 3).join('/'))}</g:color>
${p.personalise ? '<g:custom_label_0>personalised</g:custom_label_0>' : ''}
</item>`)
  }).join('\n')
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600')
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>boop.bg</title>
<link>https://boop.bg</link>
<description>Купички, лъжички, медальони и закачалки за кучета и котки, изработени в България.</description>
${items}
</channel>
</rss>`
})
