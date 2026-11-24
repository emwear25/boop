<script setup lang="ts">
import { company } from '~/data/company'

// Site-wide SEO: canonical without query (?name=&color= would make duplicates), Open Graph defaults,
// and Organization + WebSite structured data. Pages override title/description/og:image.
const route = useRoute()
const canonical = computed(() => abs(route.path === '/' ? '/' : route.path.replace(/\/+$/, '')))

useHead({
  link: [{ rel: 'canonical', href: canonical }],
  script: [ldScript({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'OnlineStore'],
        '@id': `${SITE}/#org`,
        name: SITE_NAME,
        alternateName: 'boop.bg',
        url: SITE,
        logo: abs('/logo.png'),
        image: OG_IMAGE,
        description: 'Български онлайн магазин за купички, лъжички, медальони и закачалки за кучета и котки, повечето с името на любимеца. Изработени в България.',
        email: company.email,
        telephone: company.phone,
        legalName: company.legalName,
        taxID: company.eik,
        areaServed: { '@type': 'Country', name: 'BG' },
        sameAs: ['https://www.instagram.com/boop_bg/', 'https://www.facebook.com/profile.php?id=61596606881457'],
        contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', email: company.email, telephone: company.phone, availableLanguage: ['bg', 'en'] },
      },
      { '@type': 'WebSite', '@id': `${SITE}/#website`, url: SITE, name: 'boop.bg', inLanguage: 'bg', publisher: { '@id': `${SITE}/#org` } },
    ],
  }, 'ld-org')],
})

useSeoMeta({
  ogSiteName: 'boop.bg',
  ogLocale: 'bg_BG',
  ogType: 'website',
  ogUrl: canonical,
  ogImage: OG_IMAGE,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
