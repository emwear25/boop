<script setup lang="ts">
import { type Product, productImages, fromPrice } from '~/data/catalog'

const props = defineProps<{ product: Product; eager?: boolean }>()
const colours = computed(() => props.product.colours ?? [props.product.colour])
const sel = ref(0)
const imgs = computed(() => productImages(props.product, sel.value))
const to = computed(() => ({ path: `/product/${props.product.slug}`, query: sel.value ? { color: sel.value } : undefined }))
const swatch = (c: { hex: string; hex2?: string }) => c.hex2 ? `linear-gradient(135deg, ${c.hex} 50%, ${c.hex2} 50%)` : c.hex
const from = computed(() => (props.product.sizes ? 'от ' : '') + euro(fromPrice(props.product)))
</script>

<template>
  <div class="card">
  <NuxtLink :to="to" class="lnk">
    <div class="ph">
      <img :src="imgs[0]!.sm" :alt="productSeoName(product)" :loading="eager ? 'eager' : 'lazy'" width="700" height="933">
      <!-- second photo shows the product in use; revealed on hover/focus -->
      <img class="alt" :src="imgs[1]!.sm" alt="" loading="lazy" width="700" height="933">
      <span v-if="product.badge" class="badge" :class="{ red: product.badge === 'Ново' }">{{ product.badge }}</span>
    </div>
    <div class="poster nm">{{ product.name.toUpperCase() }}</div>
    <div class="tl">{{ product.tagline }}</div>
  </NuxtLink>
    <div class="pr">
      <NuxtLink :to="to" tabindex="-1">{{ from }}</NuxtLink>
      <div class="dots" role="radiogroup" :aria-label="`Цветове на ${product.name}`">
        <button v-for="(c, i) in colours" :key="c.name" type="button" role="radio" :aria-checked="sel === i" :aria-label="c.name" :title="c.name"
          :class="{ on: sel === i && colours.length > 1 }" @click="sel = i"><i :style="{ background: swatch(c) }" /></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card { display: block; }
.ph { aspect-ratio: 3/4; border-radius: 22px; overflow: hidden; background: #c9a37a; position: relative; isolation: isolate; }
.ph img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: opacity .6s var(--ease), transform 1.2s var(--ease); }
.ph .alt { opacity: 0; }
.lnk:hover .alt, .lnk:focus-visible .alt { opacity: 1; }
.lnk:hover img { transform: scale(1.03); }
.badge { position: absolute; z-index: 2; top: 14px; left: 14px; background: var(--paper); color: var(--moss); font-size: 12px; padding: 4px 11px; border-radius: 999px; }
.badge.red { background: var(--cherry); color: #fff; }
.nm { margin-top: 18px; }
.tl { font: italic 400 19px/1.3 var(--serif); color: var(--moss-2); margin-top: 4px; }
.pr { margin-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 15px; }
.lnk { display: block; }
.dots { display: flex; flex-wrap: wrap; justify-content: flex-end; margin: -6px -6px -6px 0; }
.dots button { padding: 6px; border-radius: 50%; display: grid; }
.dots i { width: 14px; height: 14px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(0,0,0,.14); }
.dots button.on i { outline: 1.5px solid var(--moss); outline-offset: 2px; }
@media (max-width: 760px) { .nm { font-size: 11px; letter-spacing: .26em; } .tl { font-size: 16px; } .ph { border-radius: 16px; } }
</style>
