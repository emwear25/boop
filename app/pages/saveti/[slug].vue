<script setup lang="ts">
import { findGuide, guides } from '~/data/guides'
import { findProduct, type Product } from '~/data/catalog'

const route = useRoute()
const guide = computed(() => findGuide(route.params.slug as string))
if (!guide.value) throw createError({ statusCode: 404, statusMessage: 'Няма такава статия', fatal: true })
const g = computed(() => guide.value!)
const items = computed(() => g.value.products.map(findProduct).filter((p): p is Product => !!p))
const more = computed(() => guides.filter(x => x.slug !== g.value.slug))

usePageSeo({
  title: () => g.value.title,
  description: () => g.value.description,
  image: () => (items.value[0] ? productImageUrls(items.value[0])[0] : undefined),
  type: 'article',
})
useHead(() => ({
  script: [
    ldScript({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: g.value.title,
      description: g.value.description,
      datePublished: g.value.date,
      dateModified: g.value.date,
      inLanguage: 'bg',
      mainEntityOfPage: abs(`/saveti/${g.value.slug}`),
      image: items.value[0] ? productImageUrls(items.value[0]).slice(0, 1) : [OG_IMAGE],
      author: { '@type': 'Organization', name: SITE_NAME, url: SITE },
      publisher: { '@id': `${SITE}/#org` },
    }, 'ld-article'),
    ldScript(breadcrumbJsonLd([{ name: 'Начало', path: '/' }, { name: 'Съвети', path: '/saveti' }, { name: g.value.title, path: `/saveti/${g.value.slug}` }]), 'ld-crumbs'),
  ],
}))
</script>

<template>
  <div class="wrap page">
    <nav class="crumbs" aria-label="Път">
      <NuxtLink to="/">Начало</NuxtLink><span>/</span><NuxtLink to="/saveti">Съвети</NuxtLink>
    </nav>
    <article class="art">
      <h1 class="h2">{{ g.title }}</h1>
      <p class="lead">{{ g.lead }}</p>
      <section v-for="s in g.sections" :key="s.h">
        <h2>{{ s.h }}</h2>
        <p v-for="(t, i) in s.p" :key="i">{{ t }}</p>
      </section>
      <NuxtLink :to="g.cta.to" class="btn btn-solid cta">{{ g.cta.label }}</NuxtLink>
    </article>

    <section v-if="items.length" class="prods">
      <h2 class="sub">Продуктите от статията</h2>
      <div class="grid">
        <ProductCard v-for="p in items" :key="p.slug" :product="p" />
      </div>
    </section>

    <section class="more">
      <h2 class="sub">Още съвети</h2>
      <ul>
        <li v-for="m in more" :key="m.slug"><NuxtLink :to="`/saveti/${m.slug}`">{{ m.title }}</NuxtLink></li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.page { padding-top: clamp(24px, 4vw, 56px); }
.crumbs { display: flex; gap: 8px; font-size: 14px; color: var(--moss-3); }
.crumbs a:hover { color: var(--moss); }
.art { max-width: 720px; margin-top: 24px; }
.art .lead { margin-top: 24px; }
.art section { margin-top: 40px; }
.art h2 { font: 500 clamp(24px, 2.4vw, 30px)/1.15 var(--serif); margin-bottom: 12px; }
.art section p { line-height: 1.7; color: var(--moss-2); text-wrap: pretty; }
.art section p + p { margin-top: 14px; }
.cta { margin-top: 44px; }
.sub { font: 500 clamp(28px, 3vw, 40px)/1.05 var(--serif); margin-bottom: 28px; }
.prods { margin-top: clamp(64px, 8vw, 104px); }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px 24px; }
.grid > * { min-width: 0; }
.more { margin-top: clamp(64px, 8vw, 104px); max-width: 720px; }
.more li { list-style: none; border-top: 1px solid var(--line); padding: 16px 0; font-size: 18px; }
.more a:hover { text-decoration: underline; text-underline-offset: 5px; }
@media (max-width: 960px) { .grid { grid-template-columns: repeat(2, 1fr); gap: 32px 12px; } }
</style>
