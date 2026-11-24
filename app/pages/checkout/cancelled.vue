<script setup lang="ts">
useHead({ title: 'Плащането е прекъснато', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>

<template>
  <div class="wrap page">
    <h1 class="display">Плащането не мина.</h1>
    <p class="lead">Не сме взели пари от картата ти и поръчката не е създадена. Продуктите са си в количката.</p>
    <div class="actions">
      <NuxtLink to="/checkout" class="btn btn-solid">Опитай пак</NuxtLink>
      <a href="mailto:info@boop.bg" class="btn">Пиши ни</a>
    </div>
  </div>
</template>

<style scoped>
.page { padding-top: clamp(24px, 4vw, 56px); display: grid; gap: 24px; justify-items: start; max-width: 720px; }
.actions { display: flex; gap: 12px; flex-wrap: wrap; }
</style>
