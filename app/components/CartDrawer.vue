<script setup lang="ts">
import { useCart } from '~/stores/cart'
import { productImages, sizeLabel, colourIndex } from '~/data/catalog'
import { tagDesign } from '~/data/tagDesigns'

const cart = useCart()
const left = computed(() => Math.max(0, FREE_SHIPPING_FROM - cart.subtotal))
const close = () => { cart.open = false }
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
watch(() => cart.open, o => {
  document.documentElement.style.overflow = o ? 'hidden' : ''
  if (o) window.addEventListener('keydown', onKey)
  else window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade"><div v-if="cart.open" class="scrim" @click="close" /></Transition>
    <Transition name="slide">
      <aside v-if="cart.open" class="drawer" role="dialog" aria-modal="true" aria-label="Количка" data-lenis-prevent>
        <header>
          <h2 class="h3">Количка</h2>
          <button class="x" aria-label="Затвори количката" @click="close">
            <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </header>

        <div v-if="!cart.items.length" class="empty">
          <p>Количката е празна. Започни с купичка или закачалка.</p>
          <NuxtLink to="/products" class="btn btn-solid" @click="close">Разгледай продуктите</NuxtLink>
        </div>

        <template v-else>
          <div class="ship">
            <template v-if="left > 0">Още {{ euro(left) }} до безплатна доставка до офис.</template>
            <template v-else>Доставката до офис на Еконт е безплатна.</template>
            <span class="bar"><span :style="{ width: Math.min(100, cart.subtotal / FREE_SHIPPING_FROM * 100) + '%' }" /></span>
          </div>
          <ul class="lines">
            <li v-for="i in cart.items" :key="i.id">
              <img :src="productImages(i.product, colourIndex(i.product, i.colour))[0]!.sm" alt="" width="80" height="106">
              <div>
                <NuxtLink :to="`/product/${i.product.slug}`" class="nm" @click="close">{{ i.product.name }}</NuxtLink>
                <div class="meta">
                  <span v-if="i.size">{{ sizeLabel(i.product, i.size) }}</span>
                  <span v-if="i.design">{{ tagDesign(i.design).name }}</span>
                  <span v-if="i.colour">{{ i.colour }}</span>
                  <span v-if="i.note">Надпис: {{ i.note }}</span>
                  <span v-if="i.back">Гръб: {{ i.back }}</span>
                </div>
                <div class="row">
                  <div class="qty">
                    <button :aria-label="`Махни един ${i.product.name}`" @click="cart.setQty(i.id, i.qty - 1)">−</button>
                    <span>{{ i.qty }}</span>
                    <button :aria-label="`Добави още един ${i.product.name}`" @click="cart.setQty(i.id, i.qty + 1)">+</button>
                  </div>
                  <b>{{ euro(i.total) }}</b>
                </div>
              </div>
            </li>
          </ul>
          <footer>
            <div class="sum"><span>Междинна сума</span><b>{{ euro(cart.subtotal) }}</b></div>
            <p class="muted">Доставката се изчислява при поръчката.</p>
            <NuxtLink to="/checkout" class="btn btn-solid go" @click="close">Към поръчката</NuxtLink>
          </footer>
        </template>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.scrim { position: fixed; inset: 0; background: rgba(35, 48, 31, .35); backdrop-filter: blur(2px); z-index: 90; }
.drawer { position: fixed; z-index: 91; top: 0; right: 0; bottom: 0; width: min(440px, 100vw); background: var(--paper); display: flex; flex-direction: column; box-shadow: -30px 0 60px -30px rgba(35,48,31,.4); }
header { display: flex; justify-content: space-between; align-items: center; padding: 22px 24px; border-bottom: 1px solid var(--line); }
.x { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 50%; }
.x:hover { background: var(--mist); }
.x svg { width: 20px; stroke: var(--moss); stroke-width: 1.6; fill: none; }
.empty { padding: 40px 24px; display: grid; gap: 20px; justify-items: start; color: var(--moss-2); }
.ship { padding: 16px 24px; font-size: 14px; color: var(--moss-2); }
.bar { display: block; height: 4px; background: var(--mist-2); border-radius: 4px; margin-top: 10px; overflow: hidden; }
.bar span { display: block; height: 100%; background: var(--sage); transition: width .5s var(--ease); }
.lines { list-style: none; overflow-y: auto; flex: 1; padding: 0 24px; }
.lines li { display: grid; grid-template-columns: 80px 1fr; gap: 16px; padding: 18px 0; border-bottom: 1px solid var(--line); }
.lines img { border-radius: 12px; aspect-ratio: 3/4; object-fit: cover; }
.nm { font-weight: 500; }
.meta { font-size: 13px; color: var(--moss-3); display: flex; gap: 10px; flex-wrap: wrap; }
.row { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
.qty { display: flex; align-items: center; gap: 14px; border: 1px solid var(--line); border-radius: 999px; padding: 4px 12px; }
.qty button { width: 20px; }
footer { padding: 20px 24px 28px; border-top: 1px solid var(--line); }
.sum { display: flex; justify-content: space-between; font-size: 17px; }
footer .muted { font-size: 13px; margin: 4px 0 16px; }
.go { width: 100%; }
.fade-enter-active, .fade-leave-active { transition: opacity .3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: transform .45s var(--ease); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>
