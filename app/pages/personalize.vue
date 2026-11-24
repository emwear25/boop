<script setup lang="ts">
import type { BowlScene, ShapeId, Colours } from '~/utils/bowl3d'
import { findProduct } from '~/data/catalog'
import { tagDesigns } from '~/data/tagDesigns'
import { useCart } from '~/stores/cart'

usePageSeo({ title: 'Създай купичка с име онлайн', description: 'Напиши името на кучето или котката, избери форма и цвят и виж купичката в 3D, преди да поръчаш. Изработваме я в България за 3 до 5 работни дни.' })
const route = useRoute()
const cart = useCart()

// The four named bowls we sell, each drawn in 3D as the real product
const SHAPES: { id: ShapeId; label: string; slug: string; note: string }[] = [
  { id: 'lapa', label: 'Лапа', slug: 'povdignata-kupichka-s-ime-lapa', note: 'Повдигната, с лапичка' },
  { id: 'wave', label: 'Вълна', slug: 'kupichka-s-ime-valna', note: 'Ниска, в два цвята' },
  { id: 'raised', label: 'Висока вълна', slug: 'povdignata-kupichka-s-ime-visoka-valna', note: 'Повдигната, в два цвята' },
  { id: 'rings', label: 'Пръстени', slug: 'povdignata-kupichka-s-ime-prasteni', note: 'Повдигната, един цвят' },
]
// Medallion colours (Балонче), matched to the bowl's main colour
const TAG_COLOURS = tagDesigns.find(d => d.id === 'balonche')!.colourways.map(c => ({ name: c.name, hex: c.c.a }))
const hexRgb = (h: string): [number, number, number] => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const nearestTag = (hex: string) => {
  const [r, g, b] = hexRgb(hex)
  return TAG_COLOURS.reduce((best, t) => {
    const [r2, g2, b2] = hexRgb(t.hex), d = (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2
    return d < best.d ? { t, d } : best
  }, { t: TAG_COLOURS[0]!, d: Infinity }).t
}
// the light washes dark graphite out in 3D, so draw it a little deeper
const in3d = (hex: string) => (hex.toLowerCase() === '#45484a' ? '#292b2d' : hex)

const shapeI = ref(Math.max(0, SHAPES.findIndex(s => s.id === route.query.shape)))
const colourI = ref(Math.max(0, Number(route.query.color) || 0))
const name = ref(String(route.query.name ?? '').slice(0, 8))
const size = ref(16)
const withTag = ref(false)
const error = ref('')

const shape = computed(() => SHAPES[shapeI.value]!)
const product = computed(() => findProduct(shape.value.slug)!)
const colours = computed<{ name: string; hex: string; hex2?: string }[]>(() => product.value.colours ?? [product.value.colour])
const colour = computed(() => colours.value[Math.min(colourI.value, colours.value.length - 1)]!)
const tagColour = computed(() => nearestTag(colour.value.hex2 ?? colour.value.hex))
watch(shapeI, () => { if (colourI.value >= colours.value.length) colourI.value = 0 })
const unit = computed(() => product.value.sizes!.find(s => s.cm === size.value)!.price)
const tag = findProduct('medalyon-s-ime-balonche')!
const total = computed(() => unit.value + (withTag.value ? tag.price! : 0))
const bowlColours = computed<Colours>(() => [in3d(colour.value.hex), in3d(colour.value.hex2 ?? colour.value.hex)])

const stage = ref<HTMLElement>()
let bowl: BowlScene | null = null
let raf = 0

watch([name, shapeI, colourI], () => bowl?.set({ name: name.value.trim() || 'ИМЕ', shape: shape.value.id, colours: bowlColours.value }))

// drag to rotate, with a gentle idle spin
let dragging = false, lastX = 0, idle = true
const down = (e: PointerEvent) => { dragging = true; idle = false; lastX = e.clientX; (e.target as HTMLElement).setPointerCapture(e.pointerId) }
const move = (e: PointerEvent) => { if (!dragging || !bowl) return; bowl.rotation += (e.clientX - lastX) * 0.01; lastX = e.clientX; bowl.setProgress(1, 1, bowl.rotation, 1) }
const up = () => { dragging = false }

onMounted(async () => {
  const [{ BowlScene }, { gsap }] = await Promise.all([import('~/utils/bowl3d'), import('gsap')])
  await document.fonts?.ready
  bowl = new BowlScene(stage.value!, { colours: bowlColours.value, name: name.value.trim() || 'ИМЕ', shape: shape.value.id, kibble: 260 })
  bowl.offsetX = 0
  const st = { pour: 0, engrave: 0, rot: -1.4 }
  const apply = () => bowl?.setProgress(st.pour, st.engrave, st.rot, 1)
  const { $reducedMotion } = useNuxtApp()
  if ($reducedMotion) { st.pour = 1; st.engrave = 1; st.rot = 0; apply() }
  else gsap.timeline({ onUpdate: apply })
    .to(st, { pour: 1, duration: 2.6, ease: 'none' })
    .to(st, { rot: 0, duration: 2.8, ease: 'power2.out' }, 0)
    .to(st, { engrave: 1, duration: 0.9, ease: 'none' }, '-=0.6')
  const spin = () => {
    raf = requestAnimationFrame(spin)
    if (idle && bowl && st.engrave >= 1 && !$reducedMotion) { bowl.rotation = Math.sin(performance.now() / 2400) * 0.35; bowl.setProgress(1, 1, bowl.rotation, 1) }
  }
  spin()
})
onBeforeUnmount(() => { cancelAnimationFrame(raf); bowl?.dispose(); bowl = null })

function add() {
  const v = name.value.trim()
  if (!v) { error.value = 'Напиши името, което да гравираме.'; return }
  if (!/^[\p{L}\p{N} .'-]+$/u.test(v)) { error.value = 'Използвай само букви, цифри и интервал.'; return }
  error.value = ''
  cart.add(product.value.slug, { size: size.value, colour: colour.value.name, note: v })
  if (withTag.value) cart.add(tag.slug, { colour: tagColour.value.name, note: v })
}
</script>

<template>
  <div class="wrap page">
    <section class="cfg">
      <div class="stage-wrap">
        <div ref="stage" class="stage" aria-label="Преглед на купичката. Влачи, за да я завъртиш." role="img"
          @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="up" />
        <LeafLight :strength=".16" />
        <p class="drag" aria-hidden="true">Влачи, за да завъртиш</p>
        <div v-if="withTag" class="tag-float"><NameTagPreview :name="name" :colour="tagColour.hex" :size="90" /></div>
      </div>

      <div class="panel">
        <h1 class="h2">Създай купичка с име</h1>
        <p class="lead">Избери форма и цвят и напиши името. Виждаш го точно така, както ще го гравираме.</p>

        <div class="opt">
          <div class="lbl">Форма</div>
          <div class="shapes" role="radiogroup" aria-label="Форма">
            <button v-for="(s, i) in SHAPES" :key="s.id" role="radio" :aria-checked="shapeI === i" :class="{ on: shapeI === i }" @click="shapeI = i">
              <b>{{ s.label }}</b><small>{{ s.note }}</small>
            </button>
          </div>
        </div>

        <div class="opt">
          <label class="lbl" for="pet">Име <span class="req" aria-hidden="true">*</span></label>
          <div class="field" :class="{ err: error }">
            <input id="pet" v-model="name" maxlength="8" placeholder="напр. Луна" autocomplete="off">
            <span class="muted">{{ name.length }}/8</span>
          </div>
          <p v-if="error" class="error" role="alert">{{ error }}</p>
          <p class="hint muted">На кирилица или латиница. Провери правописа: гравираме точно каквото напишеш.</p>
        </div>

        <div class="opt">
          <div class="lbl">Цвят: <span class="muted">{{ colour.name }}</span></div>
          <div class="sws" role="radiogroup" aria-label="Цвят">
            <button v-for="(c, i) in colours" :key="c.name" role="radio" :aria-checked="colour.name === c.name" :aria-label="c.name" :title="c.name"
              :class="{ on: colour.name === c.name }"
              :style="{ background: c.hex2 ? `linear-gradient(135deg, ${c.hex} 50%, ${c.hex2} 50%)` : c.hex }" @click="colourI = i" />
          </div>
        </div>

        <div class="opt">
          <div class="lbl">Размер <span class="muted">на иноксовата купа</span></div>
          <div class="sizes" role="radiogroup" aria-label="Размер">
            <button v-for="s in product.sizes" :key="s.cm" role="radio" :aria-checked="size === s.cm" :class="{ on: size === s.cm }" @click="size = s.cm">
              <b>{{ s.cm }} см</b><small>{{ euro(s.price) }}</small>
            </button>
          </div>
        </div>

        <label class="addon">
          <input v-model="withTag" type="checkbox">
          <span class="box" aria-hidden="true" />
          <span><b>Добави медальон със същото име</b><small class="muted">+ {{ euro(tag.price!) }}, в цвят {{ tagColour.name.toLowerCase() }}</small></span>
        </label>

        <div class="buy">
          <div class="price">{{ euro(total) }}</div>
          <button class="btn btn-solid" @click="add">Добави в количката</button>
        </div>
        <p class="muted small">Изработваме я за 3 до 5 работни дни. Персонализираните продукти не подлежат на връщане.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page { padding-top: 12px; }
.cfg { display: grid; grid-template-columns: 7fr 5fr; gap: clamp(28px, 4vw, 64px); align-items: start; }
.cfg > * { min-width: 0; }
.stage-wrap {
  position: sticky; top: 12px; height: min(78vh, 760px); border-radius: 32px; overflow: hidden; isolation: isolate;
  background: radial-gradient(120% 80% at 15% 10%, rgba(255, 214, 160, .55), transparent 55%), linear-gradient(180deg, #cf9469 0%, #c58659 55%, #b77548 100%);
}
.stage { position: absolute; inset: 0; cursor: grab; touch-action: pan-y; z-index: 1; }
.stage:active { cursor: grabbing; }
.stage :deep(canvas) { width: 100% !important; height: 100% !important; display: block; }
.drag { position: absolute; left: 50%; bottom: 18px; translate: -50% 0; z-index: 2; font-size: 13px; color: #fff8ee; letter-spacing: .08em; pointer-events: none; }
.tag-float { position: absolute; z-index: 2; right: 24px; top: 24px; width: min(220px, 40%); animation: swing 4s ease-in-out infinite; transform-origin: 10% 0; }
@keyframes swing { 50% { transform: rotate(-4deg); } }
.panel .lead { margin-top: 14px; }
.opt { margin-top: 26px; }
.lbl { display: block; font-weight: 500; font-size: 15px; margin-bottom: 10px; }
.lbl .muted { font-weight: 400; }
.req { color: var(--cherry); }
.shapes, .sizes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.shapes { grid-template-columns: repeat(2, 1fr); }
.shapes button, .sizes button { text-align: left; border: 1px solid var(--line); border-radius: 16px; padding: 12px 14px; background: var(--paper); transition: border-color .2s, box-shadow .2s; }
.shapes button:hover, .sizes button:hover { border-color: var(--moss-3); }
.shapes button.on, .sizes button.on { border: 1.5px solid var(--moss); box-shadow: 0 0 0 3px rgba(35,48,31,.08); }
.shapes b, .sizes b { display: block; font-weight: 500; font-size: 17px; }
.shapes small, .sizes small { color: var(--moss-2); font-size: 13px; }
.field { display: flex; align-items: center; border: 1px solid var(--line); border-radius: 16px; background: var(--paper); padding: 0 18px; }
.field.err { border-color: var(--cherry); }
.field input { flex: 1; border: 0; background: none; height: 60px; outline: none; font: 600 22px var(--sans); letter-spacing: .12em; text-transform: uppercase; }
.field input::placeholder { text-transform: none; letter-spacing: 0; font-weight: 400; font-size: 16px; }
.error { color: var(--cherry); font-size: 14px; margin-top: 6px; }
.hint { font-size: 13px; margin-top: 6px; }
.sws { display: flex; gap: 12px; flex-wrap: wrap; }
.sws button { width: 38px; height: 38px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(0,0,0,.12); transition: transform .2s; }
.sws button:hover { transform: scale(1.08); }
.sws button.on { outline: 1.5px solid var(--moss); outline-offset: 3px; }
.addon { margin-top: 26px; display: flex; gap: 14px; align-items: center; padding: 16px 18px; border-radius: 16px; background: var(--paper); border: 1px solid var(--line); cursor: pointer; }
.addon input { position: absolute; opacity: 0; }
.addon .box { width: 22px; height: 22px; border-radius: 7px; border: 1.5px solid var(--moss-3); flex: none; display: grid; place-items: center; transition: background .2s; }
.addon input:checked + .box { background: var(--moss); border-color: var(--moss); }
.addon input:checked + .box::after { content: ''; width: 10px; height: 6px; border: 2px solid var(--paper); border-top: 0; border-right: 0; rotate: -45deg; translate: 0 -1px; }
.addon input:focus-visible + .box { outline: 2px solid var(--moss); outline-offset: 2px; }
.addon b { display: block; font-weight: 500; }
.addon small { font-size: 13px; }
.buy { display: flex; align-items: center; gap: 20px; margin-top: 28px; }
.price { font: 500 32px var(--sans); white-space: nowrap; }
.buy .btn { flex: 1; height: 58px; font-size: 17px; }
.small { font-size: 13px; margin-top: 14px; }
@media (max-width: 900px) {
  .cfg { grid-template-columns: 1fr; }
  .stage-wrap { position: relative; top: 0; height: 62vh; border-radius: 22px; }
}
</style>
