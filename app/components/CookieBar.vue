<script setup lang="ts">
const c = consent()
const mounted = ref(false)
onMounted(() => { mounted.value = true })
</script>

<template>
  <div v-if="mounted && c === null" class="cb" role="dialog" aria-label="Бисквитки">
    <p>Ползваме бисквитки на Google Analytics и Meta, за да виждаме как се ползва сайтът и кои реклами водят до поръчки. Само ако ги приемеш. <NuxtLink to="/privacy">Повече</NuxtLink></p>
    <div class="bt">
      <button class="btn" @click="setConsent('no')">Само необходимите</button>
      <button class="btn" @click="setConsent('yes')">Приемам</button>
    </div>
  </div>
</template>

<style scoped>
.cb { position: fixed; z-index: 60; left: 16px; right: 16px; bottom: 16px; max-width: 560px; margin-left: auto; background: var(--paper); border: 1px solid var(--line); border-radius: 18px; padding: 16px 18px; box-shadow: 0 20px 40px -24px rgba(40,30,20,.45); display: grid; gap: 12px; font-size: 14px; }
.cb a { text-decoration: underline; text-underline-offset: 3px; }
.bt { display: flex; gap: 10px; }
.bt .btn { flex: 1; height: 44px; font-size: 14px; border: 1px solid var(--moss); border-radius: 999px; }
</style>
