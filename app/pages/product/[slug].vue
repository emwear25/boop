<script setup lang="ts">
import { findProduct, productImages, products, categoryOf, fromPrice, defaultSize } from '~/data/catalog'
import { useCart } from '~/stores/cart'
import { tagDesigns, tagDesign } from '~/data/tagDesigns'

const route = useRoute()
const product = computed(() => findProduct(route.params.slug as string))
if (!product.value) throw createError({ statusCode: 404, statusMessage: 'Няма такъв продукт', fatal: true })

const p = computed(() => product.value!)
const imgs = computed(() => productImages(p.value, colour.value))
const isTag = computed(() => !!p.value.tagDesign)
const active = ref(isTag.value ? -1 : 0)
const forma: Record<string, string> = { 'kupichka-s-ime-valna': 'wave', 'povdignata-kupichka-s-ime-visoka-valna': 'raised', 'povdignata-kupichka-s-ime-prasteni': 'rings' }
const size = ref<number>(defaultSize(product.value!))
const qty = ref(1)
const note = ref(String(route.query.name ?? '').slice(0, 10))
const noteError = ref('')
const queryColour = () => Math.min(Math.max(0, Number(route.query.color) || 0), (product.value?.colours?.length ?? 1) - 1)
const colour = ref(queryColour())
watch(() => route.params.slug, () => { size.value = defaultSize(p.value); colour.value = queryColour(); note.value = String(route.query.name ?? '').slice(0, 10); noteError.value = ''; active.value = isTag.value ? -1 : 0 })
const colours = computed(() => p.value.colours ?? [p.value.colour])
const swatch = (c: { hex: string; hex2?: string }) => c.hex2 ? `linear-gradient(135deg, ${c.hex} 50%, ${c.hex2} 50%)` : c.hex
const cart = useCart()

const design = computed(() => p.value.tagDesign ?? 'balonche')
const price = computed(() => p.value.sizes ? p.value.sizes.find(s => s.cm === size.value)!.price : fromPrice(p.value))
const siblings = computed(() => tagDesigns.filter(t => t.id !== design.value))
const related = computed(() => products.filter(x => x.category === p.value.category && x.slug !== p.value.slug).slice(0, 4))
const open = ref<number | null>(0)
const sections = computed<{ t: string; list?: string[]; text?: string }[]>(() => [
  { t: 'Какво получаваш', list: p.value.details },
  { t: 'Грижа', text: 'Иноксовата купа се мие в съдомиялна. Обвивката се избърсва с влажна кърпа, без абразивни препарати и без гореща вода над 50°C.' },
  { t: 'Доставка и връщане', text: 'Доставка до офис или адрес с Еконт или Спиди. Безплатна до офис при поръчка над 60 €. Можеш да върнеш неперсонализиран продукт до 14 дни.' },
])

function add() {
  const v = note.value.trim()
  const pers = p.value.personalise
  if (pers?.required && !v) { noteError.value = 'Напиши името, което да гравираме.'; return }
  if (pers && !/^[\p{L}\p{N} .'-]*$/u.test(v)) { noteError.value = 'Използвай само букви, цифри и интервал.'; return }
  noteError.value = ''
  cart.add(p.value.slug, {
    size: p.value.sizes ? size.value : undefined,
    colour: p.value.colours ? colours.value[colour.value]!.name : undefined,
    note: v || undefined,
  }, qty.value)
  qty.value = 1
}

useHead(() => ({ title: p.value.name, meta: [{ name: 'description', content: `${p.value.name}. ${p.value.tagline} ${p.value.description}` }] }))
</script>

<template>
  <div class="wrap">
    <nav class="crumbs" aria-label="Път">
      <NuxtLink to="/">Начало</NuxtLink><span>/</span>
      <NuxtLink :to="`/category/${p.category}`">{{ categoryOf(p.category).title }}</NuxtLink><span>/</span>
      <span aria-current="page">{{ p.name }}</span>
    </nav>

    <section class="pdp">
      <div class="gal">
        <div class="thumbs" role="tablist" aria-label="Снимки">
          <button v-if="isTag" role="tab" :aria-selected="active === -1" :class="{ on: active === -1 }" class="live-thumb" @click="active = -1">
            <span>Твоят</span>
          </button>
          <button v-for="(im, i) in imgs" :key="im.src" role="tab" :aria-selected="active === i" :class="{ on: active === i }" @click="active = i">
            <img :src="im.sm" :alt="`${p.name}, снимка ${i + 1}`" width="700" height="933">
          </button>
        </div>
        <div class="main">
          <Transition name="xfade">
            <div v-if="active === -1" key="live" class="live">
              <NameTagPreview :name="note" :placeholder="tagDesign(design).demo" :way="colour" :size="120" :design="design" />
              <p>Така ще изглежда медальонът. Пиши името вдясно.</p>
            </div>
            <img v-else :key="active" :src="imgs[active]!.src" :alt="p.name" width="1400" height="1867">
          </Transition>
          <LeafLight v-if="active === 0" :strength=".12" />
        </div>
      </div>

      <div class="info">
        <div class="poster muted">{{ p.name.toUpperCase() }}</div>
        <h1 class="name">{{ p.name }}</h1>
        <p class="tl">{{ p.tagline }}</p>
        <div class="price">{{ euro(price) }}</div>
        <div class="vat muted">Цената включва ДДС.</div>
        <p class="desc">{{ p.description }}</p>

        <div v-if="p.sizes" class="opt">
          <div class="lbl">Размер <span class="muted">{{ p.sizes[0]?.label ? 'колко гранули побира' : 'на иноксовата купа' }}</span></div>
          <div class="sizes" role="radiogroup" aria-label="Размер">
            <button v-for="s in p.sizes" :key="s.cm" role="radio" :aria-checked="size === s.cm" :class="{ on: size === s.cm }" @click="size = s.cm">
              <b>{{ s.label?.split(' · ')[0] ?? `${s.cm} см` }}<i v-if="s.label">{{ s.label.split(' · ')[1] }}</i></b><small>{{ s.fits }}</small><em>{{ euro(s.price) }}</em>
            </button>
          </div>
        </div>

        <div v-if="p.personalise" class="opt">
          <label class="lbl" for="note">{{ p.personalise.label }}<span v-if="p.personalise.required" class="req" aria-hidden="true"> *</span></label>
          <div class="field" :class="{ err: noteError }">
            <input id="note" v-model="note" @focus="isTag && (active = -1)" :maxlength="p.personalise.max" :placeholder="p.personalise.placeholder" autocomplete="off">
            <span class="muted">{{ note.length }}/{{ p.personalise.max }}</span>
          </div>
          <p v-if="noteError" class="error" role="alert">{{ noteError }}</p>
          <p v-if="p.personalise.hint" class="hint muted">{{ p.personalise.hint }}</p>
          <NuxtLink v-if="forma[p.slug]" :to="{ path: '/personalize', query: { shape: forma[p.slug], name: note || undefined } }" class="see3d">Виж името си върху купичката</NuxtLink>
        </div>

        <div class="opt">
          <div class="lbl">Цвят: <span class="muted">{{ colours[colour]!.name }}</span></div>
          <div v-if="isTag" class="ways" role="radiogroup" aria-label="Цветова комбинация">
            <button v-for="(c, i) in colours" :key="c.name" role="radio" :aria-checked="colour === i" :class="{ on: colour === i }" @click="colour = i; active = -1">
              <NameTagPreview :name="note" :placeholder="tagDesign(design).demo" :way="i" :size="60" :design="design" />
            </button>
          </div>
          <div v-else class="sws" role="radiogroup" aria-label="Цвят">
            <button v-for="(c, i) in colours" :key="c.name" role="radio" :aria-checked="colour === i" :aria-label="c.name" :title="c.name"
              class="sw" :class="{ on: colour === i }" :style="{ background: swatch(c) }" @click="colour = i; active = 0" />
          </div>
          <p v-if="p.colours && !isTag" class="hint muted">{{ p.colours?.[1]?.img ? 'Първата снимка показва избрания цвят.' : `Снимките показват ${colours[0]!.name.toLowerCase()}.` }}</p>
        </div>

        <div class="buy">
          <div class="qty">
            <button aria-label="По-малко" @click="qty = Math.max(1, qty - 1)">−</button>
            <b>{{ qty }}</b>
            <button aria-label="Повече" @click="qty = Math.min(20, qty + 1)">+</button>
          </div>
          <button class="btn btn-solid" @click="add">Добави в количката</button>
        </div>

        <div class="ship">
          <svg viewBox="0 0 24 24"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" /><circle cx="7" cy="17.5" r="1.5" /><circle cx="17" cy="17.5" r="1.5" /></svg>
          <span>Изработваме я за 3 до 5 работни дни. Доставка с Еконт или Спиди, плащане с карта или при получаване.</span>
        </div>

        <div class="acc">
          <div v-for="(sec, i) in sections" :key="sec.t">
            <button :aria-expanded="open === i" @click="open = open === i ? null : i">{{ sec.t }}<span>{{ open === i ? '−' : '+' }}</span></button>
            <div v-show="open === i" class="panel">
              <ul v-if="sec.list"><li v-for="d in sec.list" :key="d">{{ d }}</li></ul>
              <p v-else>{{ sec.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="isTag" class="tag-gallery">
      <h2 class="h2">Още медальони с {{ note.trim() ? `името „${note.trim()}“` : 'неговото име' }}</h2>
      <p class="lead">Натисни форма и името ти идва с теб.</p>
      <div class="tg-grid">
        <NuxtLink v-for="t in siblings" :key="t.id" class="tg" :to="{ path: `/product/${t.slug}`, query: note.trim() ? { name: note.trim() } : {} }">
          <span class="tg-live"><NameTagPreview :name="note" :placeholder="t.demo" :size="80" :design="t.id" /></span>
          <span class="tg-txt"><b>{{ t.name }}</b><small>{{ t.tagline }} {{ euro(t.price) }}</small></span>
        </NuxtLink>
      </div>
    </section>

    <section v-if="p.mount" class="mount">
      <div class="mount-img"><img :src="`/img/p/${p.mount}-mount.webp`" alt="Схема на скрития монтаж" loading="lazy" width="1080" height="1440"></div>
      <div>
        <h2 class="h2">Скрит монтаж в три стъпки</h2>
        <ol class="steps">
          <li><b>Завий планката</b><span>Два винта с потъваща глава и дюбели според стената.</span></li>
          <li><b>Плъзни таблото надолу</b><span>Отзад таблото има жлеб. Подравни го над планката и го спусни с около 2,5 см.</span></li>
          <li><b>Сложи фиксатора (по желание)</b><span>Т-образното ключе влиза отдолу и се завива с два винта, за да не се вдига таблото.</span></li>
        </ol>
        <p class="muted">Винтовете и дюбелите не са включени, защото зависят от стената.</p>
      </div>
    </section>

    <section v-if="related.length" class="related">
      <h2 class="h2">Може да ти хареса и</h2>
      <div class="grid"><ProductCard v-for="r in related" :key="r.slug" :product="r" /></div>
    </section>
  </div>
</template>

<style scoped>
.crumbs { font-size: 14px; color: var(--moss-2); padding: 12px 0 28px; display: flex; gap: 10px; flex-wrap: wrap; }
.crumbs a:hover { text-decoration: underline; }
.pdp { display: grid; grid-template-columns: 7fr 5fr; gap: clamp(32px, 5vw, 72px); align-items: start; }
.pdp > * { min-width: 0; }
.gal { display: grid; grid-template-columns: 88px 1fr; gap: 16px; position: sticky; top: 16px; }
.thumbs { display: flex; flex-direction: column; gap: 12px; }
.thumbs button { border-radius: 12px; overflow: hidden; opacity: .65; transition: opacity .2s; }
.thumbs button:hover { opacity: .9; }
.thumbs button.on { opacity: 1; outline: 1.5px solid var(--moss); outline-offset: 3px; }
.thumbs img { aspect-ratio: 3/4; object-fit: cover; width: 100%; }
.main { border-radius: 28px; overflow: hidden; aspect-ratio: 3/4; position: relative; background: #c9a37a; }
.main img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.live { position: absolute; inset: 0; display: grid; place-items: center; align-content: center; gap: 28px; padding: 12%;
  background: radial-gradient(120% 80% at 20% 10%, rgba(255, 214, 160, .5), transparent 60%), linear-gradient(180deg, #d9b48c, #c79a6c); }
.live p { color: #fff8ee; font-size: 14px; text-align: center; }
.live-thumb { aspect-ratio: 3/4; display: grid; place-items: center; background: linear-gradient(180deg, #d9b48c, #c79a6c); color: #fff8ee; font-size: 13px; font-weight: 500; }
.see3d { display: inline-block; margin-top: 12px; font-size: 14px; font-weight: 500; text-decoration: underline; text-underline-offset: 5px; }
.xfade-enter-active, .xfade-leave-active { transition: opacity .5s var(--ease); }
.xfade-enter-from, .xfade-leave-to { opacity: 0; }

.name { font: 500 clamp(48px, 5vw, 72px)/1 var(--serif); margin: 10px 0 8px; text-wrap: balance; }
.tl { font: italic 400 24px var(--serif); color: var(--moss-2); }
.price { font: 500 34px var(--sans); margin-top: 28px; letter-spacing: -.01em; }
.vat { font-size: 13px; }
.desc { margin-top: 20px; color: var(--moss-2); max-width: 36em; }
.opt { margin-top: 28px; }
.lbl { display: block; font-weight: 500; font-size: 15px; margin-bottom: 12px; }
.lbl .muted { font-weight: 400; }
.sizes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.sizes button { text-align: left; border: 1px solid var(--line); border-radius: 16px; padding: 14px 14px 12px; background: var(--paper); transition: border-color .2s, box-shadow .2s; }
.sizes button:hover { border-color: var(--moss-3); }
.sizes button.on { border: 1.5px solid var(--moss); box-shadow: 0 0 0 3px rgba(35,48,31,.08); }
.sizes b { display: block; font: 500 20px var(--sans); white-space: nowrap; }
.sizes b i { display: block; font: 400 13px/1.4 var(--sans); font-style: normal; color: var(--moss-3); }
.sizes small { display: block; color: var(--moss-2); font-size: 13px; line-height: 1.35; margin-top: 2px; }
.sizes em { display: block; font-style: normal; font-size: 14px; margin-top: 8px; }
.field { display: flex; align-items: center; border: 1px solid var(--line); border-radius: 14px; background: var(--paper); padding: 0 16px; }
.field.err { border-color: var(--cherry); }
.field input { flex: 1; border: 0; background: none; height: 52px; outline: none; font-size: 16px; }
.error { color: var(--cherry); font-size: 14px; margin-top: 6px; }
.hint { font-size: 13px; margin-top: 6px; }
.sws { display: flex; gap: 12px; flex-wrap: wrap; }
.sw { display: block; width: 38px; height: 38px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(0,0,0,.1); transition: transform .2s; }
.sw:hover { transform: scale(1.08); }
.sw.on { outline: 1.5px solid var(--moss); outline-offset: 3px; }
.req { color: var(--cherry); }
.buy { display: flex; gap: 12px; margin-top: 32px; }
.qty { display: flex; align-items: center; gap: 18px; border: 1px solid var(--line); border-radius: 999px; padding: 0 20px; height: 58px; background: var(--paper); }
.buy .btn { flex: 1; height: 58px; font-size: 17px; }
.ship { margin-top: 20px; padding: 16px 18px; border-radius: 16px; background: var(--paper); font-size: 14px; display: flex; gap: 12px; align-items: center; }
.ship svg { width: 22px; height: 22px; flex: none; stroke: var(--moss); fill: none; stroke-width: 1.6; }
.acc { margin-top: 28px; border-top: 1px solid var(--line); }
.acc > div { border-bottom: 1px solid var(--line); }
.acc button { width: 100%; display: flex; justify-content: space-between; padding: 18px 0; font-weight: 500; text-align: left; }
.panel { padding-bottom: 18px; color: var(--moss-2); font-size: 15px; }
.panel ul { padding-left: 18px; }
.designs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.designs button { border: 1px solid var(--line); border-radius: 16px; padding: 10px 10px 12px; background: var(--paper); display: grid; justify-items: center; gap: 2px; transition: border-color .2s, box-shadow .2s; }
.designs button:hover { border-color: var(--moss-3); }
.designs button.on { border: 1.5px solid var(--moss); box-shadow: 0 0 0 3px rgba(35,48,31,.08); }
.designs .mini { width: 100%; height: 64px; display: grid; place-items: center; }
.designs .mini :deep(svg) { max-height: 64px; width: auto; max-width: 100%; }
.designs b { font-weight: 500; font-size: 14px; }
.designs small { font-size: 12px; color: var(--moss-2); }
.tag-gallery { margin-top: clamp(72px, 9vw, 120px); }
.tag-gallery .lead { margin: 14px 0 32px; }
.tg-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
@media (min-width: 1100px) { .tg-grid { grid-template-columns: repeat(5, 1fr); } }
.tg { border-radius: 24px; overflow: hidden; background: var(--paper); display: grid; transition: transform .4s var(--ease), box-shadow .4s; }
.tg:hover { transform: translateY(-4px); box-shadow: 0 24px 40px -28px rgba(80,45,15,.5); }
.tg-live { aspect-ratio: 4/3; display: grid; place-items: center; padding: 14%; background: radial-gradient(120% 80% at 20% 10%, rgba(255,214,160,.5), transparent 60%), linear-gradient(180deg, #d9b48c, #c79a6c); }
.tg-live :deep(svg) { max-height: 100%; }
.tg-txt { display: grid; padding: 14px 18px 18px; }
.ways { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.ways button { border: 1px solid var(--line); border-radius: 14px; padding: 10px; background: var(--paper); height: 72px; display: grid; place-items: center; transition: border-color .2s; }
.ways button.on { border: 1.5px solid var(--moss); box-shadow: 0 0 0 3px rgba(35,48,31,.08); }
.ways :deep(svg) { max-height: 50px; }
.tg b { font: 500 24px var(--serif); }
.tg small { color: var(--moss-2); font-size: 14px; }
@media (max-width: 760px) { .tg-grid { grid-template-columns: 1fr 1fr; gap: 12px; } }
.mount { margin-top: clamp(72px, 9vw, 120px); display: grid; grid-template-columns: 5fr 6fr; gap: clamp(32px, 5vw, 72px); align-items: center; }
.mount > * { min-width: 0; }
.mount-img { border-radius: 24px; overflow: hidden; background: var(--paper); }
.steps { list-style: none; counter-reset: s; margin: 28px 0 16px; }
.steps li { counter-increment: s; display: grid; grid-template-columns: 52px 1fr; padding: 18px 0; border-top: 1px solid var(--line); }
.steps li::before { content: counter(s); grid-row: span 2; font: 500 32px/1 var(--serif); color: var(--sage); }
.steps b { font-weight: 500; }
.steps span { color: var(--moss-2); }
.related { margin-top: clamp(72px, 9vw, 120px); }
.related .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-top: 36px; }
.related .grid > * { min-width: 0; }
@media (max-width: 900px) {
  .pdp, .mount { grid-template-columns: 1fr; }
  .gal { position: static; grid-template-columns: 1fr; }
  .thumbs { flex-direction: row; order: 2; }
  .thumbs button { width: 72px; }
  .related .grid { grid-template-columns: 1fr 1fr; gap: 28px 12px; }
}
@media (max-width: 480px) { .sizes { grid-template-columns: 1fr; } .sizes button { display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: center; } .sizes small, .sizes em { margin: 0; } }
</style>
