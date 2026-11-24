<script setup lang="ts">
// The homepage hero: the visitor types their pet's name and sees it on the bowl straight away.
// Capable devices get the live 3D bowl (the scoop pours kibble in once on load, then the name
// is engraved); old/slow phones get a still picture of the full bowl with the name laid over it.
import type { BowlScene } from '~/utils/bowl3d'
import { canRun3D } from '~/utils/heroMode'

// The bowl is the "Лапа" raised bowl (povdignata-kupichka-s-ime-lapa), in its five colours
const PRODUCT = 'povdignata-kupichka-s-ime-lapa'
const COLOURS: { name: string; key: string; c: [string, string] }[] = [
  { name: 'Мляко и графит', key: 'grafit', c: ['#efe6d6', '#292b2d'] }, // deeper in 3D: the light washes it out
  { name: 'Пясък и какао', key: 'kakao', c: ['#d9b892', '#6e4630'] },
  { name: 'Мляко и салвия', key: 'salvia', c: ['#efe6d6', '#8c9e7a'] },
  { name: 'Мляко и мента', key: 'menta', c: ['#efe6d6', '#9fd3c0'] },
  { name: 'Пясък и праскова', key: 'praskova', c: ['#d9b892', '#f0a58c'] },
]
const DEMO = 'ЛУНА'
const POUR_MS = 3400

// Still pictures (rendered from the 3D scene). `name` is where the name sits on the bowl,
// in image pixels: centre, available width, letter height.
const STILLS = {
  wide: { media: '(min-aspect-ratio: 3/2)', w: 2400, h: 1166, name: { x: 1412, y: 632, w: 176, size: 61 } },
  mid: { media: '(min-aspect-ratio: 7/10)', w: 1522, h: 875, name: { x: 758, y: 351, w: 94, size: 34 } },
  tall: { media: '', w: 876, h: 1120, name: { x: 435, y: 474, w: 92, size: 33 } },
} as const
type StillKey = keyof typeof STILLS

const wall = ref<HTMLElement>()
const stage = ref<HTMLElement>()
const live = ref(false)      // the 3D canvas is showing
const lite = ref(false)      // still picture with the name laid over it
const name = ref('')
const colour = ref(0)
const shownName = computed(() => (name.value.trim() || DEMO).toUpperCase())
let bowl: BowlScene | null = null
let io: IntersectionObserver | null = null
let raf = 0

const configLink = computed(() => ({ path: `/product/${PRODUCT}`, query: { name: name.value.trim() || undefined, color: colour.value || undefined } }))

watch(shownName, v => bowl?.set({ name: v }))
watch(colour, i => bowl?.set({ colours: COLOURS[i]!.c }))

// --- still picture: which one is showing, and where the name goes on screen ---
const still = ref<StillKey>('wide')
const box = ref({ w: 0, h: 0 })
const stillSrc = (k: StillKey, c = colour.value) => `/img/hero/full-${COLOURS[c]!.key}-${k}.webp`
const namePos = computed(() => {
  const s = STILLS[still.value], { w, h } = box.value
  if (!w || !s.name.w) return null
  const k = Math.max(w / s.w, h / s.h) // object-fit: cover
  const dx = (w - s.w * k) / 2, dy = (h - s.h * k) / 2
  const len = shownName.value.length
  return {
    left: `${dx + s.name.x * k}px`, top: `${dy + s.name.y * k}px`,
    fontSize: `${s.name.size * k * (len > 6 ? 6 / len : 1)}px`,
  }
})
let ro: ResizeObserver | null = null
function measure() {
  const el = wall.value
  if (!el) return
  box.value = { w: el.clientWidth, h: el.clientHeight }
  // same thresholds the 3D scene uses to frame the bowl
  const a = el.clientWidth / el.clientHeight
  still.value = a > 1.75 ? 'wide' : a >= 0.8 ? 'mid' : 'tall'
}

function goLite() {
  lite.value = true
  live.value = false
  cancelAnimationFrame(raf)
  io?.disconnect()
  bowl?.dispose(); bowl = null
}

// Plays the pour once: kibble falls in, then the name is engraved, the bowl turns to face you.
function pour(scene: BowlScene) {
  const apply = (v: number) => scene.setProgress(Math.min(1, v / 0.62), Math.min(1, Math.max(0, (v - 0.6) / 0.18)), -1.1 + 1.1 * Math.min(1, v / 0.78) ** 0.8, Math.min(1, v / 0.75))
  apply(0)
  let t0 = 0, last = 0
  const slow: number[] = []
  const tick = (t: number) => {
    if (!t0) { t0 = t + 250; last = t }
    // Watchdog: if this phone can't keep up (frames slower than ~25 fps), switch to the still picture
    if (slow.length < 24) { slow.push(t - last); if (slow.length === 24 && slow.slice(4).sort((a, b) => a - b)[10]! > 40) return goLite() }
    last = t
    const v = Math.min(1, Math.max(0, (t - t0) / POUR_MS))
    apply(v < 0.5 ? 2 * v * v : 1 - (-2 * v + 2) ** 2 / 2)
    if (v < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

onMounted(async () => {
  measure()
  ro = new ResizeObserver(measure)
  ro.observe(wall.value!)
  if (!canRun3D()) { lite.value = true; return }
  try {
    const { BowlScene } = await import('~/utils/bowl3d')
    bowl = new BowlScene(stage.value!, { colours: COLOURS[colour.value]!.c, name: shownName.value, shape: 'lapa', hero: true })
  } catch { return goLite() }
  if (import.meta.dev) (window as unknown as { __bowl: unknown }).__bowl = bowl // dev only: still capture
  document.fonts?.ready.then(() => bowl?.set({}))
  io = new IntersectionObserver(([e]) => bowl?.setVisible(!!e?.isIntersecting))
  io.observe(wall.value!)
  requestAnimationFrame(() => { live.value = true; if (bowl) pour(bowl) })
})
onBeforeUnmount(() => { cancelAnimationFrame(raf); ro?.disconnect(); io?.disconnect(); bowl?.dispose(); bowl = null })
</script>

<template>
  <section class="hero" aria-label="Купичка с името на любимеца">
    <div ref="wall" class="wall">
      <LeafLight :strength=".2" />

      <!-- Before the 3D is ready (and on slow phones): pictures rendered from the same scene -->
      <picture v-if="!lite" class="still" :class="{ gone: live }" aria-hidden="true">
        <source :media="STILLS.wide.media" srcset="/img/hero/bowl-wide.webp">
        <source :media="STILLS.mid.media" srcset="/img/hero/bowl-mid.webp">
        <img src="/img/hero/bowl-tall.webp" alt="" fetchpriority="high" decoding="async">
      </picture>
      <template v-else>
        <img class="still" :src="stillSrc(still)" alt="" decoding="async">
        <span v-if="namePos" class="engraved" :style="namePos" aria-hidden="true">{{ shownName }}</span>
      </template>
      <div ref="stage" class="stage" :class="{ live }" aria-hidden="true" />

      <div class="copy">
        <h1 class="display">Звукът, който всяко куче познава.</h1>
        <p class="lead">Купички и лъжички с името на любимеца, изработени в България.</p>
      </div>

      <form class="make" @submit.prevent="navigateTo(configLink)">
        <label class="name">
          <span>Как се казва твоят?</span>
          <input v-model="name" maxlength="8" placeholder="ЛУНА" autocomplete="off" enterkeyhint="go">
        </label>
        <div class="sws" role="radiogroup" aria-label="Цвят на купичката">
          <button v-for="(c, i) in COLOURS" :key="c.name" type="button" role="radio" :aria-checked="colour === i" :aria-label="c.name" :title="c.name"
            :class="{ on: colour === i }" :style="{ background: `linear-gradient(135deg, ${c.c[0]} 50%, ${c.c[1]} 50%)` }" @click="colour = i" />
        </div>
        <NuxtLink :to="configLink" class="btn btn-solid">Създай купичката</NuxtLink>
      </form>
    </div>
  </section>
</template>

<style scoped>
.hero { padding: 12px; }
.wall {
  position: relative; height: calc(100svh - var(--hero-top, 146px)); min-height: 560px; border-radius: 32px; overflow: hidden; isolation: isolate;
  container: hero / size; /* layout follows the hero's own shape, like the 3D framing */
  /* the warm sunlit plaster wall and oak floor of the product photos */
  background:
    radial-gradient(120% 80% at 15% 10%, rgba(255, 214, 160, .55), transparent 55%),
    radial-gradient(90% 60% at 62% 78%, rgba(255, 222, 180, .35), transparent 70%),
    linear-gradient(180deg, #cf9469 0%, #c58659 55%, #b77548 100%);
}
.still { position: absolute; inset: 0; width: 100%; height: 100%; transition: opacity .35s ease-out .1s; }
.still :deep(img), img.still { width: 100%; height: 100%; object-fit: cover; }
.still.gone { opacity: 0; }
.stage { position: absolute; inset: 0; opacity: 0; transition: opacity .35s ease-out; }
.stage.live { opacity: 1; }
.stage :deep(canvas) { width: 100% !important; height: 100% !important; display: block; }
/* the name on the still picture, shaded like the 3D engraving */
.engraved {
  position: absolute; translate: -50% -50%; text-align: center; white-space: nowrap; pointer-events: none;
  font-family: var(--sans); font-weight: 400; letter-spacing: .14em; line-height: 1; text-indent: .14em;
  color: rgba(140, 124, 102, .4); text-shadow: 0 1px 0 rgba(255, 255, 255, .35), 0 -1px 0 rgba(60, 40, 20, .18);
}

.copy, .make { position: absolute; left: clamp(20px, 6vw, 96px); max-width: min(520px, 44vw); color: #fff8ee; }
.copy { top: clamp(40px, 12%, 120px); }
.copy h1 { font-size: clamp(44px, 5vw, 80px); text-shadow: 0 2px 30px rgba(90, 40, 10, .25); }
.copy .lead { color: rgba(255, 248, 238, .86); margin-top: 18px; }
.make { bottom: clamp(32px, 10%, 110px); }
.name { display: grid; gap: 12px; }
.name span { font-size: 17px; font-weight: 500; }
.name input {
  width: min(400px, 100%); height: 72px; border-radius: 20px; border: 1.5px solid rgba(255,255,255,.55);
  background: rgba(255, 248, 238, .16); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  color: #fff; padding: 0 24px; font: 600 32px var(--sans); letter-spacing: .14em; text-transform: uppercase; outline: none;
}
.name input::placeholder { color: rgba(255,255,255,.5); }
.name input:focus { border-color: #fff; background: rgba(255, 248, 238, .24); }
.sws { display: flex; gap: 12px; margin: 20px 0 24px; }
.sws button { width: 36px; height: 36px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(0,0,0,.15); transition: transform .2s; }
.sws button:hover { transform: scale(1.1); }
.sws button.on { outline: 2px solid #fff; outline-offset: 3px; }
.sws button:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
.make .btn { background: var(--paper); color: var(--moss); }

/* Squarer and tall screens: name at the top, bowl in the middle, form at the bottom */
@container hero (max-aspect-ratio: 7/4) {
  .copy, .make { right: clamp(20px, 6vw, 96px); max-width: none; }
  .copy { top: clamp(24px, 5%, 64px); }
  .copy .lead { max-width: 460px; }
  .make { bottom: clamp(20px, 4%, 48px); display: grid; grid-template-columns: 1fr auto; align-items: end; column-gap: 16px; }
  .make .name { grid-column: 1 / -1; }
  .make .sws { margin: 14px 0 0; }
  .make .btn { margin-top: 14px; }
}
@media (max-width: 760px) {
  .hero { padding: 6px; }
  .wall { height: calc(100svh - 149px); min-height: 540px; border-radius: 22px; }
  .copy .display { font-size: 38px; }
  .copy .lead { font-size: 16px; margin-top: 10px; }
  .name span { font-size: 15px; }
  .name input { width: 100%; height: 58px; font-size: 24px; }
  .make { grid-template-columns: 1fr; }
  .make .sws { justify-content: space-between; max-width: 300px; }
  .make .btn { width: 100%; }
}
</style>
