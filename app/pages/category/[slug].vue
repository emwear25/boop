<script setup lang="ts">
import { categories } from '~/data/catalog'

const route = useRoute()
const cat = computed(() => categories.find(c => c.id === route.params.slug))
if (!cat.value) throw createError({ statusCode: 404, statusMessage: 'Няма такава категория', fatal: true })

useSeoMeta({
  title: () => cat.value?.title ?? 'Продукти',
  description: () => cat.value?.intro,
})
</script>

<template>
  <ProductListing :category="cat?.id" />
</template>
