<script setup lang="ts">
import { products, categories, fromPrice, type CategoryId } from '~/data/catalog'

/** Product grid for /products (all) and /category/[slug] (one category). */
const props = defineProps<{ category?: CategoryId | null }>()
const k = computed(() => props.category ?? null)
const cat = computed(() => categories.find(c => c.id === k.value) ?? null)
const sort = ref<'popular' | 'asc' | 'desc'>('popular')

const list = computed(() => {
  const l = products.filter(p => !k.value || p.category === k.value)
  if (sort.value === 'asc') return [...l].sort((a, b) => fromPrice(a) - fromPrice(b))
  if (sort.value === 'desc') return [...l].sort((a, b) => fromPrice(b) - fromPrice(a))
  return l
})
</script>

<template>
  <div class="wrap page">
    <header class="top">
      <h1 class="display">{{ cat?.title ?? 'Всички продукти' }}</h1>
      <p class="lead">{{ cat?.intro ?? 'Купички в три размера, закачалки за разходка и празнична колекция. Всичко е отпечатано в 3D в България.' }}</p>
    </header>

    <div class="bar">
      <nav class="chips" aria-label="Категории">
        <NuxtLink to="/products" class="chip" :class="{ 'is-on': !k }" :aria-current="!k ? 'page' : undefined">Всички</NuxtLink>
        <NuxtLink v-for="c in categories" :key="c.id" :to="`/category/${c.id}`" class="chip" :class="{ 'is-on': k === c.id }" :aria-current="k === c.id ? 'page' : undefined">{{ c.name }}</NuxtLink>
      </nav>
      <label class="sort">
        <span class="muted">Подреди</span>
        <select v-model="sort">
          <option value="popular">Препоръчани</option>
          <option value="asc">Цена: ниска към висока</option>
          <option value="desc">Цена: висока към ниска</option>
        </select>
      </label>
    </div>
    <p class="count muted">{{ list.length }} продукта</p>

    <TransitionGroup name="grid" tag="div" class="grid">
      <ProductCard v-for="(p, i) in list" :key="p.slug" :product="p" :eager="i < 4" />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.page { padding-top: clamp(24px, 4vw, 56px); }
.top { max-width: 900px; }
.top .lead { margin-top: 20px; }
.bar { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-top: 48px; padding-bottom: 16px; border-bottom: 1px solid var(--line); flex-wrap: wrap; }
.chips { display: flex; gap: 8px; overflow-x: auto; max-width: 100%; scrollbar-width: none; }
.sort { display: flex; gap: 10px; align-items: center; font-size: 14px; }
.sort select { border: 1px solid var(--line); background: var(--paper); border-radius: 999px; padding: 8px 14px; }
.count { font-size: 14px; margin: 16px 0 28px; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 48px 24px; position: relative; }
.grid > * { min-width: 0; }
.grid-move, .grid-enter-active, .grid-leave-active { transition: all .5s var(--ease); }
.grid-enter-from, .grid-leave-to { opacity: 0; transform: translateY(16px); }
.grid-leave-active { position: absolute; visibility: hidden; }
@media (max-width: 960px) { .grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 760px) { .grid { grid-template-columns: 1fr 1fr; gap: 32px 12px; } }
</style>
