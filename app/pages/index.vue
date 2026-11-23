<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { products, categories, type CategoryId } from '~/data/catalog'
import { tagDesigns } from '~/data/tagDesigns'

useHead({ title: 'Купички и закачалки за домашни любимци' })

const filter = ref<CategoryId | 'all'>('all')
const favourites = ['povdignata-kupichka-s-ime-lapa', 'kupichka-za-kuche-pregradka', 'kupichka-s-ime-valna', 'kupichka-za-kuche-plitka', 'kupichka-za-kuche-puding', 'povdignata-kupichka-s-ime-visoka-valna', 'kupichka-za-kuche-puhche', 'koledna-kupichka-snezhen-pan', 'povdignata-kupichka-s-ime-prasteni', 'koledna-kupichka-medenka', 'zakachalka-za-povod-s-ime-kokalche', 'medalyon-s-ime-lapichka', 'medalyon-s-ime-gabka', 'kupichka-za-kuche-sladoled', 'kupichka-za-kuche-vazel', 'dvoyna-kupichka-za-kuche-pleteno-sartse', 'kupichka-za-kuche-glazura', 'zakachalka-za-povod-opashchitsi', 'povdignata-kupichka-s-ime-konus', 'koledna-kupichka-komin']
const shown = computed(() => favourites
  .map(s => products.find(p => p.slug === s)!)
  .filter(p => filter.value === 'all' || p.category === filter.value)
  .slice(0, 8))
const size = ref(16)

// Medallion row: a pet wearing each design
const medals = tagDesigns.filter(d => ['gabka', 'yagoda', 'oblache', 'lapichka', 'kotence', 'dyga'].includes(d.id))

const root = ref<HTMLElement>()
let ctx: gsap.Context | undefined

onMounted(() => {
  const { $reducedMotion } = useNuxtApp()
  if ($reducedMotion) return
  ctx = gsap.context(() => {
    // Steel section: the insert photo lifts as the copy scrolls past.
    gsap.fromTo('.steel-img img', { yPercent: -8, scale: 1.12 }, {
      yPercent: 8, scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.steel', start: 'top bottom', end: 'bottom top', scrub: true },
    })
    // Holiday banner parallax
    gsap.fromTo('.holiday img', { yPercent: -10 }, {
      yPercent: 10, ease: 'none',
      scrollTrigger: { trigger: '.holiday', start: 'top bottom', end: 'bottom top', scrub: true },
    })
  }, root.value)
})
onBeforeUnmount(() => { ctx?.revert(); ScrollTrigger.refresh() })
</script>

<template>
  <div ref="root">
    <PourHero />

    <!-- Categories -->
    <section class="cats wrap" aria-label="Категории">
      <NuxtLink :to="'/category/kupichki-za-kucheta-i-kotki'" class="cat big">
        <img src="/img/scene-lineup.webp" alt="" loading="lazy">
        <span class="label"><b class="h3">Купички</b><small>{{ products.filter(p => p.category === 'kupichki-za-kucheta-i-kotki').length }} форми, 3 размера</small></span>
      </NuxtLink>
      <NuxtLink :to="'/category/zakachalki-za-povod'" class="cat">
        <img src="/img/p/walk-club-2-sm.webp" alt="" loading="lazy">
        <span class="label"><b class="h3">За разходка</b><small>Закачалки с диспенсър</small></span>
      </NuxtLink>
      <NuxtLink :to="'/category/koledni-kupichki'" class="cat">
        <img src="/img/p/gingerbread-2-sm.webp" alt="" loading="lazy">
        <span class="label"><b class="h3">Коледа</b><small>Празнична колекция</small></span>
      </NuxtLink>
    </section>

    <!-- Favourites -->
    <section class="sec wrap">
      <div class="sec-head">
        <h2 class="h2">Любими в момента</h2>
        <div class="chips" role="group" aria-label="Филтър">
          <button class="chip" :class="{ 'is-on': filter === 'all' }" @click="filter = 'all'">Всички</button>
          <button v-for="c in categories" :key="c.id" class="chip" :class="{ 'is-on': filter === c.id }" @click="filter = c.id">{{ c.name }}</button>
        </div>
      </div>
      <TransitionGroup name="grid" tag="div" class="grid">
        <ProductCard v-for="p in shown" :key="p.slug" :product="p" />
      </TransitionGroup>
      <div class="more"><NuxtLink to="/products" class="btn btn-link">Виж всички {{ products.length }} продукта</NuxtLink></div>
    </section>

    <!-- Every breed -->
    <BreedStrip />

    <!-- Personalised -->
    <section class="sec wrap names">
      <div class="names-top">
        <div>
          <h2 class="h2">С неговото име.</h2>
          <p class="lead">Гравираме името в купичката или го изписваме върху медальон в десет форми и много цветове.</p>
        </div>
        <div class="cta-row">
          <NuxtLink to="/personalize" class="btn btn-solid">Създай купичка с име</NuxtLink>
          <NuxtLink :to="'/category/medalyoni-s-ime'" class="btn btn-link">Всички медальони</NuxtLink>
        </div>
      </div>
      <NuxtLink :to="'/category/medalyoni-s-ime'" class="names-hero">
        <img src="/img/p/tag-all.webp" alt="Медальони boop в различни форми и цветове" loading="lazy" width="2400" height="1350">
      </NuxtLink>
      <div class="names-row">
        <NuxtLink v-for="m in medals" :key="m.slug" :to="`/product/${m.slug}`" class="medal">
          <img :src="`/img/p/${m.photos}-2-sm.webp`" :alt="`Медальон ${m.name}`" loading="lazy" width="700" height="933">
          <span><b>{{ m.name }}</b><small>{{ euro(m.price) }}</small></span>
        </NuxtLink>
      </div>
    </section>

    <!-- Steel inside -->
    <section class="steel">
      <div class="steel-copy">
        <h2 class="h2">Инокс отвътре. Мекота отвън.</h2>
        <p>Храната докосва само иноксова купа, която се вади с едно движение. Обвивката пази пода и стои стабилно, дори когато някой яде прекалено ентусиазирано.</p>
        <dl class="facts">
          <div><dt>Иноксова купа</dt><dd>Мие се в съдомиялна</dd></div>
          <div><dt>Основа</dt><dd>Неплъзгаща се</dd></div>
          <div><dt>Размери</dt><dd>13, 16 и 20 см</dd></div>
          <div><dt>Изработка</dt><dd>В България, за 3 до 5 работни дни</dd></div>
        </dl>
      </div>
      <div class="steel-img"><img src="/img/p/pudding-2.webp" alt="Бигъл яде от купичка Пудинг" loading="lazy"></div>
    </section>

    <!-- Size -->
    <section class="sec wrap size">
      <div>
        <h2 class="h2">Кой размер е за твоя любимец?</h2>
        <p class="lead">Размерът е диаметърът на иноксовата купа. Обвивката е с около 5 см по-широка. Ако се колебаеш между два размера, вземи по-големия.</p>
      </div>
      <SizeScale v-model="size" />
    </section>

    <!-- Walk -->
    <section class="sec wrap split">
      <div class="pic"><img src="/img/p/bone-depot-2.webp" alt="Закачалка Кокалче в коридор, ретривър чака за разходка" loading="lazy"></div>
      <div>
        <h2 class="h2">Повод, нагръдник и торбички на едно място.</h2>
        <p class="lead">Закачалките се монтират на скрита планка и се свалят за секунда. Има място за повод, нагръдник и ролка торбички, които се дърпат с една ръка.</p>
        <div class="minis">
          <NuxtLink v-for="m in [['zakachalka-za-povod-s-ime-kokalche','bone-depot','Кокалче'],['zakachalka-za-povod-kam-planinata','happy-camper','Към планината'],['zakachalka-za-povod-opashchitsi','tail-trail','Опашчици']]" :key="m[0]" :to="`/product/${m[0]}`">
            <img :src="`/img/p/${m[1]}-1-sm.webp`" alt="" loading="lazy">
            <small class="poster">{{ m[2]!.toUpperCase() }}</small>
          </NuxtLink>
        </div>
        <NuxtLink :to="'/category/zakachalki-za-povod'" class="btn btn-solid">Виж закачалките</NuxtLink>
      </div>
    </section>

    <!-- Holiday -->
    <section class="holiday">
      <img src="/img/scene-holiday.webp" alt="Коледните купички boop на маса с елхови клонки" loading="lazy">
      <div class="holiday-copy wrap"><div class="box">
        <h2 class="h2">Коледа идва и за тях.</h2>
        <p>Снежен пън, Меденка, Комин и още. Изработваме ги за 3 до 5 дни, така че поръчай навреме за празниците.</p>
        <NuxtLink :to="'/category/koledni-kupichki'" class="btn btn-light">Коледната колекция</NuxtLink>
      </div></div>
    </section>

    <!-- Instagram -->
    <section class="sec wrap insta">
      <div class="insta-head">
        <h2 class="h2">Следвай ни</h2>
        <a href="https://www.instagram.com/boop_bg/" target="_blank" rel="noopener" class="btn btn-link">@boop_bg в Instagram</a>
      </div>
      <a href="https://www.instagram.com/boop_bg/" target="_blank" rel="noopener" class="insta-grid" aria-label="boop в Instagram">
        <img v-for="n in 6" :key="n" :src="`/img/ig/${n}.webp`" alt="" loading="lazy" width="540" height="720">
      </a>
      <SocialLinks class="insta-social" />
    </section>

    <!-- Process: a real sequence, so it is numbered -->
    <section class="sec wrap make">
      <div class="make-img"><img src="/img/scene-lineup.webp" alt="Купички boop в различни цветове" loading="lazy"></div>
      <div>
        <h2 class="h2">Изработена, след като поръчаш.</h2>
        <ol class="steps">
          <li><b>Избираш форма и размер</b><span>Всяка купичка идва с иноксова купа в съответния размер.</span></li>
          <li><b>Изработваме я специално за теб</b><span>В нашето студио в България, за 3 до 5 работни дни.</span></li>
          <li><b>Изпращаме с Еконт или Спиди</b><span>Плащаш с карта или при получаване. Безплатно до офис над 60&nbsp;€.</span></li>
        </ol>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Categories */
.cats { margin-top: clamp(48px, 6vw, 96px); display: grid; grid-template-columns: 2fr 1fr; grid-template-rows: 1fr 1fr; gap: 16px; height: clamp(520px, 52vw, 720px); }
.cat { position: relative; border-radius: 26px; overflow: hidden; background: #c9a37a; }
.cat.big { grid-row: span 2; }
.cat img { width: 100%; height: 100%; object-fit: cover; transition: transform 1.2s var(--ease); }
.cat.big img { object-position: 60% 80%; }
.cat:hover img { transform: scale(1.04); }
.label { position: absolute; left: 16px; bottom: 16px; background: var(--paper); border-radius: 18px; padding: 12px 20px 14px; display: grid; }
.label small { color: var(--moss-3); font-size: 14px; }

/* Sections */
.sec { padding-block: clamp(64px, 8vw, 112px); }
.sec-head { display: flex; align-items: end; justify-content: space-between; margin-bottom: 44px; gap: 24px; flex-wrap: wrap; }
.chips { display: flex; gap: 8px; overflow-x: auto; max-width: 100%; scrollbar-width: none; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 44px 24px; }
.grid > * { min-width: 0; }
.grid-move, .grid-enter-active, .grid-leave-active { transition: all .5s var(--ease); }
.grid-enter-from, .grid-leave-to { opacity: 0; transform: translateY(16px); }
.grid-leave-active { position: absolute; visibility: hidden; }
.more { margin-top: 40px; text-align: center; }

/* Steel */
.steel { background: var(--moss); color: var(--mist); border-radius: 36px; margin-inline: clamp(8px, 2vw, 24px); overflow: hidden; display: grid; grid-template-columns: 1fr 1fr; }
.steel > * { min-width: 0; }
.steel-copy { padding: clamp(48px, 7vw, 96px) clamp(24px, 6vw, 80px); display: flex; flex-direction: column; justify-content: center; }
.steel-copy p { margin-top: 22px; font-size: 18px; color: #c9d0bf; max-width: 28em; }
.facts { margin-top: 44px; border-top: 1px solid rgba(233,235,223,.18); }
.facts div { padding: 18px 0; border-bottom: 1px solid rgba(233,235,223,.18); display: flex; justify-content: space-between; gap: 24px; }
.facts dd { color: #aab49d; text-align: right; }
.steel-img { min-height: 640px; overflow: hidden; }
.steel-img img { width: 100%; height: 100%; object-fit: cover; }

/* Size */
.size { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.size .lead { margin-top: 20px; }

/* Split */
.split { display: grid; grid-template-columns: 7fr 5fr; gap: clamp(32px, 6vw, 80px); align-items: center; }
.split > * { min-width: 0; }
.pic { border-radius: 28px; overflow: hidden; aspect-ratio: 5/4; }
.pic img { width: 100%; height: 100%; object-fit: cover; object-position: center 35%; }
.split .lead { margin: 22px 0 30px; }
.minis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 32px; }
.minis img { border-radius: 14px; aspect-ratio: 1; object-fit: cover; object-position: center 60%; width: 100%; transition: transform .5s var(--ease); }
.minis a:hover img { transform: translateY(-4px); }
.minis small { display: block; margin-top: 8px; font-size: 11px; letter-spacing: .22em; }

/* Names */
.names-top { display: flex; justify-content: space-between; align-items: end; gap: 24px 48px; flex-wrap: wrap; margin-bottom: 32px; }
.names-top .lead { margin-top: 16px; max-width: 30em; }
.cta-row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
.names-hero { display: block; border-radius: 32px; overflow: hidden; aspect-ratio: 16/7; background: #c9a37a; }
.names-hero img { width: 100%; height: 100%; object-fit: cover; object-position: 70% 50%; transition: transform 1.4s var(--ease); }
.names-hero:hover img { transform: scale(1.03); }
.names-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; margin-top: 16px; }
.medal { border-radius: 20px; overflow: hidden; background: var(--paper); }
.medal img { aspect-ratio: 4/5; object-fit: cover; width: 100%; transition: transform .8s var(--ease); }
.medal:hover img { transform: scale(1.05); }
.medal span { display: flex; justify-content: space-between; align-items: baseline; padding: 10px 14px 12px; }
.medal b { font: 500 19px var(--serif); }
.medal small { font-size: 13px; color: var(--moss-2); }

/* Holiday */
.holiday { position: relative; height: clamp(520px, 56vw, 760px); overflow: hidden; margin-inline: clamp(8px, 2vw, 24px); border-radius: 36px; color: var(--paper); }
.holiday img { position: absolute; inset: -10% 0; width: 100%; height: 120%; object-fit: cover; }
.holiday::after { content: ''; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(30,22,14,.45), transparent 50%); }
.box { background: rgba(30, 22, 14, .5); backdrop-filter: blur(18px) saturate(1.2); -webkit-backdrop-filter: blur(18px) saturate(1.2); border: 1px solid rgba(255,255,255,.12); border-radius: 28px; padding: clamp(24px, 3vw, 40px); max-width: 520px; }
.holiday-copy { position: relative; z-index: 1; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-start; padding-bottom: clamp(16px, 3vw, 40px); }
.holiday-copy p { max-width: 26em; margin: 18px 0 30px; font-size: 18px; color: #f1e7d8; }

/* Instagram */
.insta-head, .insta-grid, .insta-social { max-width: 860px; margin-inline: auto; }
.insta-head { display: flex; justify-content: space-between; align-items: end; gap: 16px; flex-wrap: wrap; margin-bottom: 28px; }
.insta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; border-radius: 24px; overflow: hidden; max-width: 860px; }
.insta-grid img { aspect-ratio: 3/4; object-fit: cover; width: 100%; transition: opacity .3s; }
.insta-grid:hover img { opacity: .92; }
.insta-social { margin-top: 20px; justify-content: center; }

/* Make */
.make { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px, 6vw, 80px); align-items: center; }
.make > * { min-width: 0; }
.make-img { border-radius: 28px; overflow: hidden; aspect-ratio: 4/3; }
.make-img img { width: 100%; height: 100%; object-fit: cover; }
.steps { list-style: none; counter-reset: s; margin-top: 32px; }
.steps li { counter-increment: s; display: grid; grid-template-columns: 56px 1fr; padding: 20px 0; border-top: 1px solid var(--line); }
.steps li::before { content: counter(s); grid-row: span 2; font: 500 34px/1 var(--serif); color: var(--sage); }
.steps b { font-weight: 500; font-size: 17px; }
.steps span { color: var(--moss-2); }

@media (max-width: 960px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 760px) {
  .cats { grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; height: auto; }
  .cat { aspect-ratio: 3/4; }
  .cat.big { grid-column: 1 / -1; grid-row: auto; aspect-ratio: 4/3; }
  .label { left: 10px; bottom: 10px; padding: 8px 14px 10px; }
  .label small { display: none; }
  .grid { grid-template-columns: 1fr 1fr; gap: 32px 12px; }
  .steel, .size, .split, .make { grid-template-columns: 1fr; }
  .names-hero { aspect-ratio: 4/3; border-radius: 22px; }
  .names-row { grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .steel-img { min-height: 380px; order: -1; }
  .size { gap: 32px; }
  .holiday-copy { padding-bottom: 12px; }
  .box { border-radius: 20px; }
}
</style>
