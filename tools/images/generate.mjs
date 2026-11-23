// Generate Boop product/site imagery with BytePlus ModelArk Seedream.
// Usage: node tools/images/generate.mjs <jobs.json> [--only=slug1,slug2] [--force]
// Each job: { out, prompt, refs?: [file], size?, model? }
// Output files land in tools/images/out/<out>.jpg; existing files are skipped unless --force.
import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../..')
const env = await readFile(join(root, '.env'), 'utf8')
const KEY = env.match(/ARK_API_KEY=(.+)/)?.[1]?.trim()
if (!KEY) throw new Error('ARK_API_KEY missing in boop.bg/.env')

const API = 'https://ark.ap-southeast.bytepluses.com/api/v3/images/generations'
const DEFAULT_MODEL = 'dola-seedream-5-5-261028'
const args = process.argv.slice(2)
const jobsFile = args.find(a => !a.startsWith('--'))
const only = args.find(a => a.startsWith('--only='))?.slice(7).split(',')
const force = args.includes('--force')
const CONCURRENCY = 4
// Budget guard: worst-case prices for Seedream 5.5 (output $0.035, each input image $0.008).
const BUDGET_USD = 12
const ledgerFile = join(here, 'ledger.json')
const ledger = JSON.parse(await readFile(ledgerFile, 'utf8').catch(() => '{"images":0,"inputs":0,"usd":0}'))
const costOf = job => 0.035 + 0.008 * (job.refs?.length || 0)

let jobs = JSON.parse(await readFile(jobsFile, 'utf8'))
if (only) jobs = jobs.filter(j => only.includes(j.out))
const outDir = join(here, 'out')

const exists = p => access(p).then(() => true, () => false)
const toDataUrl = async f => `data:image/jpeg;base64,${(await readFile(join(here, 'refs', f))).toString('base64')}`

async function run(job) {
  const file = join(outDir, `${job.out}.jpg`)
  if (!force && await exists(file)) return console.log('skip', job.out)
  const body = {
    model: job.model || DEFAULT_MODEL,
    prompt: job.prompt,
    size: job.size || '1536x2048',
    response_format: 'b64_json',
    watermark: false,
  }
  if (job.refs?.length) {
    const imgs = await Promise.all(job.refs.map(toDataUrl))
    body.image = imgs.length === 1 ? imgs[0] : imgs
  }
  if (ledger.usd + costOf(job) > BUDGET_USD) return console.error('BUDGET STOP', job.out, ledger.usd.toFixed(2))
  for (let attempt = 1; attempt <= 2; attempt++) {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
      body: JSON.stringify(body),
    })
    const json = await res.json().catch(() => ({}))
    const b64 = json?.data?.[0]?.b64_json
    if (res.ok && b64) {
      await mkdir(dirname(file), { recursive: true })
      await writeFile(file, Buffer.from(b64, 'base64'))
      ledger.images++; ledger.inputs += job.refs?.length || 0; ledger.usd += costOf(job)
      await writeFile(ledgerFile, JSON.stringify(ledger))
      return console.log('ok  ', job.out, json.usage ? JSON.stringify(json.usage) : '')
    }
    console.error('fail', job.out, res.status, JSON.stringify(json.error || json).slice(0, 300))
  }
}

const queue = [...jobs]
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) await run(queue.shift())
}))
console.log(`Ledger: ${ledger.images} images, est. max $${ledger.usd.toFixed(2)} of $${BUDGET_USD} cap`)
