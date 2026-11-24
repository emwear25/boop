<script setup lang="ts">
import { categories, products } from '~/data/catalog'
import { categorySeo } from '~/data/categorySeo'

const route = useRoute()
const cat = computed(() => categories.find(c => c.id === route.params.slug))
if (!cat.value) throw createError({ statusCode: 404, statusMessage: 'Няма такава категория', fatal: true })

const seo = computed(() => categorySeo[cat.value!.id])
const items = computed(() => products.filter(p => p.category === cat.value!.id))
usePageSeo({
  title: () => seo.value.title,
  description: () => seo.value.description,
  image: () => (items.value[0] ? productImageUrls(items.value[0])[0] : undefined),
})
useHead(() => ({
  script: [
    ldScript(breadcrumbJsonLd([{ name: 'Начало', path: '/' }, { name: 'Продукти', path: '/products' }, { name: seo.value.title, path: `/category/${cat.value!.id}` }]), 'ld-crumbs'),
    ldScript({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: seo.value.title,
      description: seo.value.description,
      url: abs(`/category/${cat.value!.id}`),
      mainEntity: { '@type': 'ItemList', itemListElement: items.value.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`/product/${p.slug}`), name: productSeoName(p) })) },
    }, 'ld-list'),
    ldScript(faqJsonLd(seo.value.faq), 'ld-faq'),
  ],
}))
</script>

<template>
  <ProductListing :category="cat?.id" />
</template>
