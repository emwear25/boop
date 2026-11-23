<script setup lang="ts">
// "Every breed" strip: pinned on desktop, the row of breed photos slides sideways as you
// scroll down. On touch screens and with reduced motion it is a native swipeable row.
import { breedShots } from '~/data/breeds'
import { findProduct } from '~/data/catalog'

const shots = breedShots.map(s => ({ ...s, product: findProduct(s.slug)! }))
const section = ref<HTMLElement>()
const track = ref<HTMLElement>()
let ctx: { revert: () => void } | undefined

onMounted(async () => {
  const { $reducedMotion } = useNuxtApp()
  if ($reducedMotion || !window.matchMedia('(min-width: 900px) and (pointer: fine)').matches) return
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
  gsap.registerPlugin(ScrollTrigger)
  ctx = gsap.context(() => {
    const dist = () => track.value!.scrollWidth - window.innerWidth + 48
    gsap.to(track.value!, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: section.value!, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.7, invalidateOnRefresh: true },
    })
    // cards tilt slightly as they travel, like photos on a table
    gsap.utils.toArray<HTMLElement>('.shot').forEach((el, i) => {
      gsap.fromTo(el, { rotate: i % 2 ? 2.5 : -2.5 }, { rotate: i % 2 ? -1.5 : 1.5, ease: 'none',
        scrollTrigger: { trigger: section.value!, start: 'top top', end: () => `+=${dist()}`, scrub: true } })
    })
  }, section.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section ref="section" class="breeds" aria-labelledby="breeds-h">
    <div class="head wrap">
      <h2 id="breeds-h" class="h2">От чихуахуа до немска овчарка.</h2>
      <p class="lead">Три размера за всяка муцуна. Виж кой какво си избра.</p>
    </div>
    <div ref="track" class="track">
      <NuxtLink v-for="(s, i) in shots" :key="i" :to="`/product/${s.slug}`" class="shot">
        <img :src="`/img/p/${s.img}-4-sm.webp`" :alt="`${s.breed} с ${s.product.name}`" loading="lazy" width="700" height="933">
        <span class="cap">
          <b>{{ s.breed }}</b>
          <small>{{ s.product.name }}<template v-if="s.size">, {{ s.size }}</template></small>
        </span>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.breeds { padding-block: clamp(64px, 8vw, 96px); overflow: hidden; }
.head { display: flex; justify-content: space-between; align-items: end; gap: 24px; flex-wrap: wrap; margin-bottom: 40px; }
.head .lead { max-width: 26em; }
.track { display: flex; gap: 20px; padding-inline: var(--gutter); width: max-content; will-change: transform; }
.shot { position: relative; flex: none; width: clamp(240px, 24vw, 360px); aspect-ratio: 3/4; border-radius: 24px; overflow: hidden; background: #c9a37a; box-shadow: 0 30px 60px -36px rgba(80, 45, 15, .55); }
.shot:nth-child(3n + 2) { margin-top: 48px; }
.shot img { width: 100%; height: 100%; object-fit: cover; transition: transform 1s var(--ease); }
.shot:hover img { transform: scale(1.05); }
.cap { position: absolute; left: 12px; right: 12px; bottom: 12px; background: rgba(248, 247, 241, .92); backdrop-filter: blur(8px); border-radius: 16px; padding: 10px 14px; display: grid; }
.cap b { font: 500 22px/1.15 var(--serif); }
.cap small { font-size: 13px; color: var(--moss-2); }
@media (max-width: 899px), (pointer: coarse) {
  .track { width: auto; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; padding-bottom: 8px; }
  .track::-webkit-scrollbar { display: none; }
  .shot { width: 72vw; scroll-snap-align: center; }
  .shot:nth-child(3n + 2) { margin-top: 0; }
}
</style>
