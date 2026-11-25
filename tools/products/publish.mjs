/**
 * Publish the boop catalogue (app/data/catalog.ts) to the shared backend, store "boop".
 *
 *   ADMIN_USERNAME=… ADMIN_PASSWORD=… node tools/products/publish.mjs [--apply] [--update] [--only=slug,slug]
 *
 * Dry run by default. For every product in the local catalogue it:
 *   - creates the category if it is missing (kupichki-za-kucheta-i-kotki, kupichki-s-ime, medalyoni-s-ime, lazhichki-za-granuli, zakachalki-za-povod, koledni-kupichki)
 *   - creates the product with its 4 photos (uploaded to Cloudinary, boop/products)
 *   - creates one variant per size × colour, with the size price and made-to-order stock
 * Products are matched by name, which is also how the storefront finds them at checkout.
 * Each product keeps the site's slug, so feed and email links match /product/<slug>.
 * --update refreshes description, prices, sizes and colours of existing products (photos kept).
 *
 * API_BASE defaults to https://api.emwear.bg (use http://localhost:3030 for a local server).
 * Credentials come from the environment only; nothing is stored.
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const API = (process.env.API_BASE || 'https://api.emwear.bg').replace(/\/$/, '')
const STORE = 'boop'
const APPLY = process.argv.includes('--apply')
const UPDATE = process.argv.includes('--update')
const ONLY = process.argv.find((a) => a.startsWith('--only='))?.slice(7).split(',')
const STOCK = 999 // made to order: every variant stays available
const STANDARD = 'Стандартен'

// Load the TypeScript catalogue through esbuild (bundled with Nuxt)
const tmp = mkdtempSync(join(tmpdir(), 'boop-catalog-'))
execFileSync(join(ROOT, 'node_modules/.bin/esbuild'), [join(ROOT, 'app/data/catalog.ts'), '--bundle', '--format=esm', '--platform=node', `--outfile=${join(tmp, 'catalog.mjs')}`, '--log-level=warning'])
const { products, categories, productImages } = await import(join(tmp, 'catalog.mjs'))

export const sizeName = (cm) => `${cm} см`

async function api(path, { method = 'GET', token, json, form } = {}) {
  const headers = { 'X-Store': STORE, ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  if (json) headers['Content-Type'] = 'application/json'
  const r = await fetch(`${API}${path}`, { method, headers, body: json ? JSON.stringify(json) : form })
  const body = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status} ${body.message || ''} ${JSON.stringify(body.errors || '')}`)
  return body
}

function photos(p) {
  const key = productImages(p)[0].src.split('/').pop().replace(/-1\.webp$/, '')
  return [1, 2, 3, 4].map((n) => join(ROOT, 'tools/images/out', `${key}-${n}.jpg`)).filter(existsSync)
}
// Smaller copies for upload (Cloudinary resizes anyway)
function uploadCopy(file) {
  const out = join(tmp, file.split('/').pop())
  execFileSync('sips', ['-Z', '1600', '-s', 'formatOptions', '85', file, '--out', out], { stdio: 'ignore' })
  return new Blob([readFileSync(out)], { type: 'image/jpeg' })
}

const describe = (p) => `${p.description}\n\n${p.details.map((d) => `- ${d}`).join('\n')}`
const sizesOf = (p) => (p.sizes ? p.sizes.map((s) => ({ name: s.label ?? sizeName(s.cm), price: s.price })) : [{ name: STANDARD, price: p.price }])
const coloursOf = (p) => (p.colours ?? [p.colour]).map(({ name, hex }) => ({ name, hex }))

const selected = products.filter((p) => !ONLY || ONLY.includes(p.slug))
console.log(`${APPLY ? 'PUBLISHING' : 'DRY RUN'} ${selected.length} products → ${API} (store ${STORE})`)

// Ask for credentials if they are not in the environment (password typed hidden, never stored)
async function ask(q, hidden) {
  const { createInterface } = await import('node:readline')
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true })
  if (hidden) rl._writeToOutput = (s) => { if (s.startsWith(q)) process.stdout.write(q) }
  const a = await new Promise((r) => rl.question(q, r)); rl.close(); if (hidden) process.stdout.write('\n'); return a.trim()
}
const email = process.env.ADMIN_USERNAME || await ask('Admin email: ')
const password = process.env.ADMIN_PASSWORD || await ask('Admin password (hidden): ', true)
const login = await api('/api/admin/auth/login', { method: 'POST', json: { email, password } })
const token = login.data.token

const { data: serverCategories } = await api('/api/categories', { token })
async function ensureCategory(id) {
  const found = serverCategories.find((c) => c.slug === id || c.name === id)
  if (found) return found
  const c = categories.find((x) => x.id === id)
  console.log(`  + category ${id} (${c.name})`)
  if (!APPLY) { serverCategories.push({ slug: id }); return { slug: id } }
  const { data } = await api('/api/categories', {
    method: 'POST',
    token,
    json: {
      name: id,
      displayName: c.name,
      description: c.intro,
      sizes: id === 'lazhichki-za-granuli' ? ['½ чаша · 120 мл', '1 чаша · 240 мл', '2 чаши · 480 мл']
        : id === 'medalyoni-s-ime' || id === 'zakachalki-za-povod' ? [STANDARD] : ['13 см', '16 см', '20 см'],
      defaultWeight: id === 'medalyoni-s-ime' ? 0.05 : id === 'lazhichki-za-granuli' ? 0.2 : 0.6,
      defaultDimensions: id === 'medalyoni-s-ime' ? { length: 10, width: 8, height: 2 } : { length: 30, width: 30, height: 15 },
    },
  })
  serverCategories.push(data)
  return data
}

const { data: existingList } = await api('/api/products?showAll=true&limit=500', { token })
let created = 0
let updated = 0
for (const p of selected) {
  const category = await ensureCategory(p.category)
  const existing = existingList.find((x) => x.name === p.name)
  const sizes = sizesOf(p)
  const base = Math.min(...sizes.map((s) => s.price))
  const label = `${p.name} (${sizes.map((s) => `${s.name} ${s.price} €`).join(', ')}; ${coloursOf(p).length} цвята)`
  if (existing && !UPDATE) { console.log(`  = ${label} exists`); continue }
  if (!APPLY) { console.log(`  ${existing ? '~ update' : '+ create'} ${label}, ${photos(p).length} photos`); continue }

  const form = new FormData()
  form.append('name', p.name)
  form.append('slug', p.slug)
  form.append('description', describe(p))
  form.append('price', String(base))
  form.append('category', category.slug)
  form.append('sizes', JSON.stringify(sizes.map((s) => s.name)))
  form.append('colors', JSON.stringify(coloursOf(p)))
  let saved
  if (existing) {
    form.append('keepExistingImages', 'true')
    saved = (await api(`/api/products/${existing._id}`, { method: 'PUT', token, form })).data
    updated++
  } else {
    form.append('stock', String(STOCK))
    for (const f of photos(p)) form.append('images', uploadCopy(f), f.split('/').pop())
    saved = (await api('/api/products', { method: 'POST', token, form })).data
    created++
  }
  // Size prices and stock live on the variants
  const priceOf = (size) => sizes.find((s) => s.name === size)?.price
  const variants = saved.variants.map((v) => ({ _id: v._id, stock: STOCK, price: priceOf(v.size) !== base ? (priceOf(v.size) ?? null) : null }))
  await api(`/api/variant-stock/${saved._id}/variants/bulk`, { method: 'PUT', token, json: { variants } })
  console.log(`  ✓ ${existing ? 'updated' : 'created'} ${label} → ${saved._id}`)
}
console.log(APPLY ? `Done: ${created} created, ${updated} updated.` : 'Dry run - re-run with --apply.')
