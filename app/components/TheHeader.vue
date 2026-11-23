<script setup lang="ts">
import { useCart } from '~/stores/cart'
import { categories, products } from '~/data/catalog'

const cart = useCart()
const route = useRoute()
const menu = ref(false)
watch(() => route.fullPath, () => { menu.value = false })

const isOn = (id: string) => route.path === `/category/${id}`
const bump = ref(false)
watch(() => cart.count, (n, o) => { if (n > o) { bump.value = false; requestAnimationFrame(() => { bump.value = true }) } })

// Mobile menu: a full-screen sheet under the header; the page behind it does not scroll, Escape closes it
const thumb: Record<string, string> = {
  'kupichki-za-kucheta-i-kotki': 'pudding', 'kupichki-s-ime': 'name-wave', 'medalyoni-s-ime': 'tag-heart', 'lazhichki-za-granuli': 'scoop-plitka',
  'zakachalki-za-povod': 'bone-depot', 'koledni-kupichki': 'gingerbread',
}
const countIn = (id: string) => products.filter(p => p.category === id).length
const bar = ref<HTMLElement>()
const top = ref(0)
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') menu.value = false }
watch(menu, (open) => {
  document.documentElement.style.overflow = open ? 'hidden' : ''
  if (open) {
    top.value = Math.max(0, bar.value?.getBoundingClientRect().bottom ?? 0)
    window.addEventListener('keydown', onKey)
  } else window.removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => { if (import.meta.client) { document.documentElement.style.overflow = ''; window.removeEventListener('keydown', onKey) } })
</script>

<template>
  <div class="announce">Безплатна доставка до офис на Еконт при поръчка над 60&nbsp;€</div>
  <header ref="bar" class="head wrap">
    <NuxtLink to="/" class="logo" aria-label="boop, начало"><img src="/logo.png" alt="boop" width="96" height="54"></NuxtLink>
    <nav class="nav" aria-label="Основна навигация">
      <NuxtLink v-for="c in categories" :key="c.id" :to="`/category/${c.id}`" :class="{ 'is-on': isOn(c.id) }">{{ c.name }}</NuxtLink>
      <NuxtLink to="/personalize" active-class="is-on" class="make">Създай с име</NuxtLink>
      <NuxtLink to="/about" active-class="is-on">За нас</NuxtLink>
    </nav>
    <div class="tools">
      <NuxtLink to="/products" class="icon hide-m" aria-label="Всички продукти">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
      </NuxtLink>
      <button class="icon bag" :class="{ bump }" aria-label="Количка" @click="cart.open = true">
        <svg viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>
        <ClientOnly><i v-if="cart.count">{{ cart.count }}</i></ClientOnly>
      </button>
      <button class="icon burger" :aria-expanded="menu" aria-controls="mobile-menu" :aria-label="menu ? 'Затвори менюто' : 'Меню'" @click="menu = !menu">
        <svg viewBox="0 0 24 24"><path :d="menu ? 'M6 6l12 12M18 6 6 18' : 'M4 8h16M4 16h16'" /></svg>
      </button>
    </div>
  </header>
  <Transition name="sheet">
    <div v-if="menu" id="mobile-menu" class="sheet" :style="{ top: `${top}px` }">
      <nav class="sheet-in wrap" aria-label="Мобилно меню">
        <ul class="cats">
          <li v-for="(c, i) in categories" :key="c.id" :style="{ '--i': i }">
            <NuxtLink :to="`/category/${c.id}`" class="cat" :class="{ 'is-on': isOn(c.id) }">
              <img :src="`/img/p/${thumb[c.id]}-1-sm.webp`" alt="" width="56" height="56">
              <span><b>{{ c.title }}</b><small>{{ countIn(c.id) }} продукта</small></span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
            </NuxtLink>
          </li>
        </ul>
        <NuxtLink to="/personalize" class="make-cta">
          <span><b>Създай купичка с име</b><small>Виж името на любимеца в 3D</small></span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </NuxtLink>
        <ul class="more">
          <li><NuxtLink to="/products">Всички продукти</NuxtLink></li>
          <li><NuxtLink to="/about">За нас</NuxtLink></li>
          <li><NuxtLink to="/about#delivery">Доставка и плащане</NuxtLink></li>
          <li><NuxtLink to="/about#sizes">Кой размер да избера</NuxtLink></li>
        </ul>
        <div class="foot">
          <SocialLinks />
          <span>Следвай ни</span>
        </div>
      </nav>
    </div>
  </Transition>
</template>

<style scoped>
.announce { background: var(--moss); color: var(--mist); text-align: center; font-size: 13px; padding: 8px 16px; letter-spacing: .02em; }
.head { display: flex; align-items: center; gap: 48px; padding-block: 16px; }
.logo img { width: 96px; height: auto; }
.nav { display: flex; gap: 32px; font-size: 15px; }
.nav a { padding: 6px 0; border-bottom: 1.5px solid transparent; transition: border-color .2s; }
.nav a:hover, .nav a.is-on { border-color: var(--moss); }
.nav a.make { color: var(--cherry); }
.nav a.make.is-on, .nav a.make:hover { border-color: var(--cherry); }
.tools { margin-left: auto; display: flex; gap: 8px; align-items: center; }
.icon { position: relative; display: grid; place-items: center; width: 42px; height: 42px; border-radius: 50%; transition: background .2s; }
.icon:hover { background: var(--mist-2); }
.icon svg { width: 22px; height: 22px; stroke: var(--moss); fill: none; stroke-width: 1.6; stroke-linecap: round; }
.bag i { position: absolute; top: 3px; right: 1px; background: var(--cherry); color: #fff; font: 600 10px/17px var(--sans); min-width: 17px; height: 17px; padding: 0 4px; border-radius: 9px; text-align: center; font-style: normal; }
.bag.bump i { animation: bump .45s var(--ease); }
@keyframes bump { 40% { transform: scale(1.45); } }
.burger { display: none; }

/* Mobile sheet */
.sheet { position: fixed; left: 0; right: 0; bottom: 0; z-index: 40; background: var(--paper); border-top: 1px solid var(--line); overflow-y: auto; overscroll-behavior: contain; }
.sheet-in { display: flex; flex-direction: column; gap: 20px; padding-block: 4px 28px; min-height: 100%; }
.cats { list-style: none; }
.cats li + li { border-top: 1px solid var(--line); }
.cat { display: flex; align-items: center; gap: 14px; padding: 12px 0; }
.cat img { width: 56px; height: 56px; border-radius: 14px; object-fit: cover; background: var(--mist); flex: none; }
.cat span { display: grid; gap: 1px; flex: 1; min-width: 0; }
.cat b { font: 500 18px/1.25 var(--sans); color: var(--moss); }
.cat small, .make-cta small { font-size: 13px; color: var(--moss-3); }
.cat.is-on b { text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1.5px; }
.cat svg, .make-cta svg { width: 20px; height: 20px; flex: none; stroke: currentColor; fill: none; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; color: var(--moss-3); }
.make-cta { display: flex; align-items: center; gap: 12px; padding: 18px 20px; border-radius: 20px; background: var(--moss); color: var(--paper); }
.make-cta span { display: grid; gap: 2px; flex: 1; }
.make-cta b { font: 500 18px/1.25 var(--sans); }
.make-cta small { color: var(--mist-2); }
.make-cta svg { color: var(--amber); }
.more { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
.more a { display: block; padding: 10px 0; font: 400 15px/1.3 var(--sans); color: var(--moss-2); }
.foot { margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 16px; border-top: 1px solid var(--line); }
.foot span { font-size: 13px; color: var(--moss-3); }
.sheet-enter-active, .sheet-leave-active { transition: opacity .22s ease; }
.sheet-enter-active .cats li { transition: opacity .35s ease, transform .35s var(--ease); transition-delay: calc(var(--i) * 35ms); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .cats li { opacity: 0; transform: translateY(8px); }
@media (prefers-reduced-motion: reduce) { .sheet-enter-active .cats li { transition: none; } }

@media (max-width: 900px) {
  .nav, .hide-m { display: none; }
  .burger { display: grid; }
  .logo img { width: 84px; }
}
@media (min-width: 901px) { .sheet { display: none; } }
</style>
