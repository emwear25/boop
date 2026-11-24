<script setup lang="ts">
import { guides } from '~/data/guides'

usePageSeo({
  title: 'Съвети за кучета и котки',
  description: 'Кратки съвети за стопани на кучета и котки: каква купа да избереш, на каква височина, колко храна да даваш и идеи за подарък.',
})
useHead({ script: [ldScript(breadcrumbJsonLd([{ name: 'Начало', path: '/' }, { name: 'Съвети', path: '/saveti' }]), 'ld-crumbs')] })
</script>

<template>
  <div class="wrap page">
    <header class="top">
      <h1 class="display">Съвети</h1>
      <p class="lead">Кратко и по същество: как да избереш купа, колко храна да даваш и какво да подариш на куче.</p>
    </header>
    <ul class="list">
      <li v-for="g in guides" :key="g.slug">
        <NuxtLink :to="`/saveti/${g.slug}`">
          <h2>{{ g.title }}</h2>
          <p>{{ g.description }}</p>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.page { padding-top: clamp(24px, 4vw, 56px); }
.top .lead { margin-top: 20px; }
.list { margin-top: 48px; border-top: 1px solid var(--line); max-width: 860px; }
.list li { list-style: none; border-bottom: 1px solid var(--line); }
.list a { display: block; padding: 28px 0; }
.list h2 { font: 500 clamp(26px, 2.6vw, 34px)/1.1 var(--serif); text-wrap: balance; }
.list p { margin-top: 8px; color: var(--moss-2); max-width: 40em; }
.list a:hover h2 { text-decoration: underline; text-underline-offset: 6px; text-decoration-thickness: 1px; }
</style>
