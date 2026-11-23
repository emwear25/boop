<script setup lang="ts">
import { useCart } from '~/stores/cart'
import { categories } from '~/data/catalog'

const cart = useCart()
const route = useRoute()
const menu = ref(false)
watch(() => route.fullPath, () => { menu.value = false })

const isOn = (id: string) => route.path === `/category/${id}`
const bump = ref(false)
watch(() => cart.count, (n, o) => { if (n > o) { bump.value = false; requestAnimationFrame(() => { bump.value = true }) } })
</script>

<template>
  <div class="announce">Безплатна доставка до офис на Еконт при поръчка над 60&nbsp;€</div>
  <header class="head wrap">
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
      <button class="icon burger" :aria-expanded="menu" aria-label="Меню" @click="menu = !menu">
        <svg viewBox="0 0 24 24"><path :d="menu ? 'M6 6l12 12M18 6 6 18' : 'M4 8h16M4 16h16'" /></svg>
      </button>
    </div>
  </header>
  <Transition name="drop">
    <nav v-if="menu" class="mnav wrap" aria-label="Мобилно меню">
      <NuxtLink v-for="c in categories" :key="c.id" :to="`/category/${c.id}`">{{ c.title }}</NuxtLink>
      <NuxtLink to="/personalize">Създай с име</NuxtLink>
      <NuxtLink to="/products">Всички продукти</NuxtLink>
      <NuxtLink to="/about">За нас</NuxtLink>
      <SocialLinks class="m-social" />
    </nav>
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
.mnav { display: flex; flex-direction: column; padding-bottom: 20px; border-bottom: 1px solid var(--line); }
.mnav > a { font: 500 30px/1.5 var(--serif); }
.m-social { margin-top: 14px; }
.drop-enter-active, .drop-leave-active { transition: opacity .25s, transform .25s var(--ease); }
.drop-enter-from, .drop-leave-to { opacity: 0; transform: translateY(-8px); }
@media (max-width: 900px) {
  .nav, .hide-m { display: none; }
  .burger { display: grid; }
  .logo img { width: 84px; }
}
</style>
