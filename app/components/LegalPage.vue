<script setup lang="ts">
import { company } from '~/data/company'
const props = defineProps<{ title: string; lead: string }>()
useHead({ title: props.title })
</script>

<template>
  <div class="wrap page">
    <header>
      <h1 class="display">{{ title }}</h1>
      <p class="lead">{{ lead }}</p>
      <p class="muted">Последна актуализация: ноември 2026</p>
    </header>
    <div class="body">
      <slot />
      <h2>Контакти</h2>
      <p>{{ company.legalName }}, ЕИК {{ company.eik }}, {{ company.address }}<br>Имейл: <a :href="`mailto:${company.email}`">{{ company.email }}</a>, телефон: <a :href="company.phoneHref">{{ company.phone }}</a></p>
    </div>
  </div>
</template>

<style scoped>
.page { padding-top: clamp(24px, 4vw, 56px); }
header { display: grid; gap: 16px; max-width: 860px; }
.body { max-width: 72ch; margin-top: 48px; line-height: 1.7; }
.body :deep(h2) { font: 500 clamp(24px, 3vw, 32px)/1.2 var(--serif); margin: 40px 0 12px; }
.body :deep(p), .body :deep(ul) { margin-bottom: 12px; }
.body :deep(ul) { padding-left: 20px; }
.body :deep(a) { text-decoration: underline; text-underline-offset: 3px; }
</style>
