<script setup lang="ts">
import { type Product, productImages, fromPrice } from '~/data/catalog'

const props = defineProps<{ product: Product; eager?: boolean }>()
const imgs = computed(() => productImages(props.product))
const from = computed(() => (props.product.sizes ? 'от ' : '') + euro(fromPrice(props.product)))
</script>

<template>
  <NuxtLink :to="`/product/${product.slug}`" class="card">
    <div class="ph">
      <img :src="imgs[0]!.sm" :alt="productSeoName(product)" :loading="eager ? 'eager' : 'lazy'" width="700" height="933">
      <!-- second photo shows the product in use; revealed on hover/focus -->
      <img class="alt" :src="imgs[1]!.sm" alt="" loading="lazy" width="700" height="933">
      <span v-if="product.badge" class="badge" :class="{ red: product.badge === 'Ново' }">{{ product.badge }}</span>
    </div>
    <div class="poster nm">{{ product.name.toUpperCase() }}</div>
    <div class="tl">{{ product.tagline }}</div>
    <div class="pr">
      <span>{{ from }}</span>
      <i class="dot" :style="{ background: product.colour.hex }" :title="product.colour.name" />
    </div>
  </NuxtLink>
</template>

<style scoped>
.card { display: block; }
.ph { aspect-ratio: 3/4; border-radius: 22px; overflow: hidden; background: #c9a37a; position: relative; isolation: isolate; }
.ph img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: opacity .6s var(--ease), transform 1.2s var(--ease); }
.ph .alt { opacity: 0; }
.card:hover .alt, .card:focus-visible .alt { opacity: 1; }
.card:hover img { transform: scale(1.03); }
.badge { position: absolute; z-index: 2; top: 14px; left: 14px; background: var(--paper); color: var(--moss); font-size: 12px; padding: 4px 11px; border-radius: 999px; }
.badge.red { background: var(--cherry); color: #fff; }
.nm { margin-top: 18px; }
.tl { font: italic 400 19px/1.3 var(--serif); color: var(--moss-2); margin-top: 4px; }
.pr { margin-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 15px; }
.dot { width: 14px; height: 14px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(0,0,0,.14); }
@media (max-width: 760px) { .nm { font-size: 11px; letter-spacing: .26em; } .tl { font-size: 16px; } .ph { border-radius: 16px; } }
</style>
