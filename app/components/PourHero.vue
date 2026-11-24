<script setup lang="ts">
// The homepage moment: scroll pours kibble into a 3D bowl, then the pet's name
// is engraved on it, then the visitor types their own pet's name and picks a colour.
import type { BowlScene } from '~/utils/bowl3d'

const COLOURS: { name: string; c: [string, string] }[] = [
  { name: 'Мляко и салвия', c: ['#efe6d6', '#8fa27c'] },
  { name: 'Мляко и розово', c: ['#efe6d6', '#e3a9a3'] },
  { name: 'Мляко и теракота', c: ['#efe6d6', '#c4704f'] },
  { name: 'Мляко и графит', c: ['#efe6d6', '#45484a'] },
  { name: 'Мляко и какао', c: ['#efe6d6', '#6e4630'] },
]
const DEMO = 'ЛУНА'

const section = ref<HTMLElement>()
const stage = ref<HTMLElement>()
const p = ref(0)
const ready = ref(false)
const name = ref('')
const colour = ref(0)
let bowl: BowlScene | null = null
let st: { kill: () => void } | null = null
let io: IntersectionObserver | null = null

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const step = (a: number, b: number) => clamp((p.value - a) / (b - a))
// visibility of each caption: fades in over [a,b], out over [c,d]
const show = (a: number, b: number, c: number, d: number) => Math.min(step(a, b), 1 - step(c, d))

const finalOn = computed(() => p.value > 0.8)
const configLink = computed(() => ({ path: '/personalize', query: { name: name.value.trim() || undefined, color: colour.value || undefined } }))

watch(name, v => bowl?.set({ name: v.trim() || DEMO }))
watch(colour, i => bowl?.set({ colours: COLOURS[i]!.c }))

// Start downloading three.js + GSAP during hydration instead of after mount
const libs = import.meta.client
  ? Promise.all([import('~/utils/bowl3d'), import('gsap'), import('gsap/ScrollTrigger')])
  : null

onMounted(async () => {
  const [{ BowlScene }, { gsap }, { ScrollTrigger }] = await libs!
  bowl = new BowlScene(stage.value!, { colours: COLOURS[0]!.c, name: DEMO, shape: 'wave' })
  if (import.meta.dev) (window as unknown as { __bowl: unknown }).__bowl = bowl // dev only: poster capture
  const { $reducedMotion } = useNuxtApp()
  const apply = () => {
    const v = p.value
    bowl!.setProgress(clamp(v / 0.62), clamp((v - 0.6) / 0.18), -1.1 + 1.1 * clamp(v / 0.78) ** 0.8, clamp(v / 0.75))
  }
  if ($reducedMotion) { p.value = 1; apply() }
  else {
    gsap.registerPlugin(ScrollTrigger)
    st = ScrollTrigger.create({
      trigger: section.value!, start: 'top top', end: 'bottom bottom', scrub: 0.15,
      onUpdate: self => { p.value = self.progress; apply() },
    })
    apply()
  }
  document.fonts?.ready.then(() => bowl?.set({}))
  io = new IntersectionObserver(([e]) => bowl?.setVisible(!!e?.isIntersecting))
  io.observe(section.value!)
  requestAnimationFrame(() => { ready.value = true })
})
onBeforeUnmount(() => { st?.kill(); io?.disconnect(); bowl?.dispose(); bowl = null })
</script>

<template>
  <section ref="section" class="pour" aria-label="Купичка boop">
    <div class="sticky">
      <div class="wall">
        <LeafLight :strength=".2" />
        <!-- First frame of the 3D scene as an image, shown instantly; the canvas fades in over it
             (rendered from the scene at the same framing: wide / square-ish / tall screens) -->
        <picture class="poster" :class="{ gone: ready }" aria-hidden="true">
          <source media="(min-aspect-ratio: 23/20)" srcset="/img/hero/bowl-wide.webp">
          <source media="(min-aspect-ratio: 4/5)" srcset="/img/hero/bowl-mid.webp">
          <img src="/img/hero/bowl-tall.webp" alt="" fetchpriority="high" decoding="async">
        </picture>
        <div ref="stage" class="stage" :class="{ ready }" aria-hidden="true" />

        <div class="captions">
          <div class="cap first" :style="{ opacity: 1 - step(0.06, 0.16), transform: `translateY(${-step(0.06, 0.16) * 30}px)` }">
            <h1 class="display">Звукът, който всяко куче познава.</h1>
            <p class="lead">Купички и лъжички с името на любимеца, изработени в България. Скролни и ги напълни.</p>
          </div>
          <div class="cap" :style="{ opacity: show(0.2, 0.28, 0.48, 0.56) }">
            <h2 class="h2">Инокс отвътре.<br>Мекота отвън.</h2>
            <p class="lead">Храната докосва само иноксова купа, която се вади и мие в съдомиялна.</p>
          </div>
          <div class="cap" :style="{ opacity: show(0.58, 0.64, 0.76, 0.82) }">
            <h2 class="h2">А отпред е неговото име.</h2>
            <p class="lead">Гравираме го в самата купичка. На кирилица или латиница.</p>
          </div>
          <div class="cap final" :class="{ on: finalOn }" :style="{ opacity: step(0.8, 0.88) }">
            <h2 class="h2">Как се казва твоят?</h2>
            <label class="name">
              <span class="visually-hidden">Име на любимеца</span>
              <input v-model="name" maxlength="8" placeholder="ЛУНА" autocomplete="off" :tabindex="finalOn ? 0 : -1">
            </label>
            <div class="sws" role="radiogroup" aria-label="Цвят">
              <button v-for="(c, i) in COLOURS" :key="c.name" role="radio" :aria-checked="colour === i" :aria-label="c.name" :title="c.name"
                :class="{ on: colour === i }" :style="{ background: `linear-gradient(135deg, ${c.c[0]} 50%, ${c.c[1]} 50%)` }" :tabindex="finalOn ? 0 : -1" @click="colour = i" />
            </div>
            <NuxtLink :to="configLink" class="btn btn-solid" :tabindex="finalOn ? 0 : -1">Създай своята купичка</NuxtLink>
          </div>
        </div>

        <div class="hint" :style="{ opacity: 1 - step(0.02, 0.08) }" aria-hidden="true"><span />Скролни</div>
        <div class="bar" aria-hidden="true"><span :style="{ transform: `scaleX(${p})` }" /></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pour { height: 260vh; position: relative; }
.sticky { position: sticky; top: 0; height: 100vh; height: 100svh; padding: 12px; }
.wall {
  position: relative; height: 100%; border-radius: 32px; overflow: hidden; isolation: isolate;
  /* the warm sunlit plaster wall and oak floor of the product photos */
  background:
    radial-gradient(120% 80% at 15% 10%, rgba(255, 214, 160, .55), transparent 55%),
    radial-gradient(90% 60% at 62% 78%, rgba(255, 222, 180, .35), transparent 70%),
    linear-gradient(180deg, #cf9469 0%, #c58659 55%, #b77548 100%);
}
.stage { position: absolute; inset: 0; opacity: 0; transition: opacity .35s ease-out; }
.poster { position: absolute; inset: 0; transition: opacity .35s ease-out .1s; }
.poster img { width: 100%; height: 100%; object-fit: cover; }
.poster.gone { opacity: 0; }
.stage.ready { opacity: 1; }
.stage :deep(canvas) { width: 100% !important; height: 100% !important; display: block; }
.captions { position: absolute; inset: 0; pointer-events: none; color: #fff8ee; }
.cap { position: absolute; left: clamp(20px, 6vw, 96px); top: 50%; translate: 0 -50%; max-width: min(560px, 44vw); }
.cap .lead { color: rgba(255, 248, 238, .86); margin-top: 18px; }
.cap h1, .cap h2 { text-shadow: 0 2px 30px rgba(90, 40, 10, .25); }
.final { pointer-events: none; }
.final.on { pointer-events: auto; }
.name input {
  margin-top: 26px; width: min(420px, 100%); height: 76px; border-radius: 20px; border: 1.5px solid rgba(255,255,255,.55);
  background: rgba(255, 248, 238, .16); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  color: #fff; padding: 0 24px; font: 600 34px var(--sans); letter-spacing: .14em; text-transform: uppercase; outline: none;
}
.name input::placeholder { color: rgba(255,255,255,.5); }
.name input:focus { border-color: #fff; background: rgba(255, 248, 238, .24); }
.sws { display: flex; gap: 12px; margin: 22px 0 28px; }
.sws button { width: 36px; height: 36px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(0,0,0,.15); transition: transform .2s; }
.sws button:hover { transform: scale(1.1); }
.sws button.on { outline: 2px solid #fff; outline-offset: 3px; }
.final .btn { background: var(--paper); color: var(--moss); }
.hint { position: absolute; left: 50%; bottom: 28px; translate: -50% 0; color: #fff8ee; font-size: 13px; letter-spacing: .2em; display: grid; justify-items: center; gap: 10px; }
.hint span { width: 1.5px; height: 40px; background: linear-gradient(#fff8ee, transparent); animation: drip 1.8s var(--ease) infinite; transform-origin: top; }
@keyframes drip { 0% { transform: scaleY(0); } 50% { transform: scaleY(1); } 100% { transform: scaleY(1); opacity: 0; } }
.bar { position: absolute; left: 24px; right: 24px; bottom: 14px; height: 2px; background: rgba(255,255,255,.18); border-radius: 2px; overflow: hidden; }
.bar span { display: block; height: 100%; background: #fff8ee; transform-origin: left; }
@media (max-width: 760px) {
  .sticky { padding: 6px; }
  .wall { border-radius: 22px; }
  .cap { top: 9%; translate: 0 0; max-width: none; right: 20px; }
  .cap .display { font-size: 42px; }
  .cap .h2 { font-size: 34px; }
  .final { top: auto; bottom: 34px; }
  .name input { height: 60px; font-size: 26px; margin-top: 14px; }
  .sws { margin: 14px 0 16px; }
  .hint { display: none; }
}
@media (prefers-reduced-motion: reduce) { .pour { height: auto; } .sticky { position: relative; height: 90vh; } }
</style>
