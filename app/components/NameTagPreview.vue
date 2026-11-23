<script setup lang="ts">
// Live preview of a boop name tag, drawn from the design's colour layers.
// bubble  – cut along the letters, one colour + white letters
// rainbow – cut along the letters, cream outline, every letter its own colour
// shape   – layered shape (bone, paw, heart, cloud, cat, fish, mushroom, berry) with the name fitted in
import { tagDesign, type Slot } from '~/data/tagDesigns'

const props = withDefaults(defineProps<{ name: string; design?: string; way?: number; colour?: string; size?: number; placeholder?: string }>(),
  { design: 'balonche', way: 0, size: 120, placeholder: 'ИМЕ' })
const d = computed(() => tagDesign(props.design))
const cw = computed(() => d.value.colourways[props.way] ?? d.value.colourways[0]!)
const pal = computed<Record<Slot, string>>(() => {
  const c = { ...cw.value.c, ...(props.colour ? { a: props.colour } : {}) }
  return { a: c.a, b: c.b ?? c.a, c: c.c ?? c.a, d: c.d ?? c.a, t: c.t ?? '#fffdf8' }
})
const text = computed(() => (props.name.trim() || props.placeholder).toUpperCase().slice(0, 10))
const letters = computed(() => [...text.value])
const isShape = computed(() => d.value.kind === 'shape')
const svg = ref<SVGSVGElement>()
const box = ref({ x: 0, y: 0, w: 400, h: 160 })
const fit = ref(60)
const id = useId()
const darker = computed(() => shade(pal.value.a, -0.22))

function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16)
  const ch = (s: number) => Math.round(Math.min(255, Math.max(0, ((n >> s) & 255) * (1 + k))))
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`
}

async function measure() {
  await nextTick()
  if (!isShape.value) {
    const t = svg.value?.querySelector<SVGTextElement>('.base')
    if (!t) return
    const b = t.getBBox()
    const pad = props.size * 0.42
    box.value = { x: b.x - pad - props.size * 0.6, y: b.y - pad, w: b.width + pad * 2 + props.size * 0.6, h: b.height + pad * 2 }
  } else {
    box.value = { x: 0, y: 0, w: 400, h: 280 }
    const t = svg.value?.querySelector<SVGTextElement>('.probe')
    if (!t) return
    const w = t.getBBox().width || 1
    const [, , maxW, maxSize] = d.value.text
    fit.value = Math.min(maxSize, (100 * maxW) / w)
  }
}
watch(() => [props.name, props.size, props.design, props.placeholder], measure)
onMounted(async () => { await document.fonts?.ready; measure() })
</script>

<template>
  <svg ref="svg" class="nt" :viewBox="`${box.x} ${box.y} ${box.w} ${box.h}`" role="img" :aria-label="`Медальон ${d.name} с надпис ${text}`">
    <defs>
      <filter :id="`s${id}`" x="-20%" y="-30%" width="140%" height="170%">
        <feDropShadow dx="0" :dy="isShape ? 7 : size * 0.06" :stdDeviation="isShape ? 8 : size * 0.07" flood-color="#3a2410" flood-opacity=".28" />
      </filter>
      <linearGradient :id="`g${id}`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity=".3" />
        <stop offset=".5" stop-color="#fff" stop-opacity="0" />
        <stop offset="1" stop-color="#000" stop-opacity=".12" />
      </linearGradient>
      <template v-if="isShape">
        <clipPath :id="`c${id}`">
          <template v-for="(l, li) in d.layers" :key="`k${li}`">
            <template v-if="!l.line">
              <circle v-for="(c, i) in l.circles" :key="`kc${i}`" :cx="c[0]" :cy="c[1]" :r="c[2] + (l.merge ?? 0) / 2" />
              <rect v-for="(r, i) in l.rects" :key="`kr${i}`" :x="r[0]" :y="r[1]" :width="r[2]" :height="r[3]" :rx="r[4]" />
              <path v-for="(p, i) in l.paths" :key="`kp${i}`" :d="p" />
            </template>
          </template>
        </clipPath>
        <mask :id="`m${id}`" maskUnits="userSpaceOnUse" x="-60" y="-60" width="520" height="400">
          <rect x="-60" y="-60" width="520" height="400" fill="#fff" />
          <circle :cx="d.hole[0]" :cy="d.hole[1]" :r="d.hole[2]" fill="#000" />
        </mask>
      </template>
    </defs>

    <!-- Bubble and rainbow: the outline follows the letters -->
    <g v-if="!isShape" :filter="`url(#s${id})`">
      <circle :cx="-size * 0.42" :cy="-size * 0.55" :r="size * 0.27" :fill="pal.a" />
      <text class="base" x="0" y="0" :font-size="size" :fill="pal.a" :stroke="pal.a" :stroke-width="size * 0.5">{{ text }}</text>
      <text x="0" y="0" :font-size="size" :fill="`url(#g${id})`" :stroke="`url(#g${id})`" :stroke-width="size * 0.5">{{ text }}</text>
      <circle :cx="-size * 0.42" :cy="-size * 0.55" :r="size * 0.11" fill="#f3efe6" stroke="rgba(0,0,0,.15)" :stroke-width="size * 0.02" />
      <text v-if="d.kind === 'bubble'" x="0" y="0" :font-size="size" :fill="pal.t" stroke="rgba(0,0,0,.08)" :stroke-width="size * 0.03">{{ text }}</text>
      <text v-else x="0" y="0" :font-size="size" stroke="rgba(0,0,0,.1)" :stroke-width="size * 0.03">
        <tspan v-for="(ch, i) in letters" :key="i" :fill="cw.letters![i % cw.letters!.length]">{{ ch }}</tspan>
      </text>
    </g>

    <!-- Layered shapes -->
    <g v-else :filter="`url(#s${id})`">
      <g :mask="`url(#m${id})`">
        <template v-for="(l, li) in d.layers" :key="li">
          <g v-if="l.line" fill="none" :stroke="pal[l.slot]" :stroke-width="l.line" stroke-linecap="round">
            <path v-for="(p, i) in l.paths" :key="i" :d="p" />
          </g>
          <g v-else :fill="pal[l.slot]" :stroke="l.merge ? pal[l.slot] : 'none'" :stroke-width="l.merge ?? 0" stroke-linejoin="round">
            <circle v-for="(c, i) in l.circles" :key="`c${i}`" :cx="c[0]" :cy="c[1]" :r="c[2]" />
            <rect v-for="(r, i) in l.rects" :key="`r${i}`" :x="r[0]" :y="r[1]" :width="r[2]" :height="r[3]" :rx="r[4]" />
            <path v-for="(p, i) in l.paths" :key="`p${i}`" :d="p" />
          </g>
        </template>
        <rect x="-20" y="-20" width="440" height="320" :fill="`url(#g${id})`" :clip-path="`url(#c${id})`" />
      </g>
      <circle :cx="d.hole[0]" :cy="d.hole[1]" :r="d.hole[2] + 1.5" fill="none" :stroke="darker" stroke-width="3" />
      <text class="probe" x="-9999" y="-9999" font-size="100">{{ text }}</text>
      <text :x="d.text[0]" :y="d.text[1]" :font-size="fit" text-anchor="middle" dominant-baseline="central"
        :fill="pal.t" :stroke="darker" :stroke-width="fit * 0.09">{{ text }}</text>
    </g>
  </svg>
</template>

<style scoped>
.nt { width: 100%; height: auto; overflow: visible; }
text { font-family: 'Nunito', 'Jost Variable', system-ui, sans-serif; font-weight: 900; stroke-linejoin: round; stroke-linecap: round; paint-order: stroke; letter-spacing: -.01em; }
</style>
