<script setup lang="ts">
import { useCart } from '~/stores/cart'
const cart = useCart()
onMounted(() => cart.hydrate())
</script>

<template>
  <div>
    <TheHeader />
    <main><slot /></main>
    <TheFooter />
    <CartDrawer />
  </div>
</template>
