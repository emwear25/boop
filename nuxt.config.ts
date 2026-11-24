// boop.bg storefront. Visual build with a local catalogue; the shared backend
// (../server) will serve it as store "boop" later.
export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt'],
  css: [
    '@fontsource/cormorant-garamond/cyrillic-500.css',
    '@fontsource/cormorant-garamond/latin-500.css',
    '@fontsource/cormorant-garamond/cyrillic-400-italic.css',
    '@fontsource/cormorant-garamond/latin-400-italic.css',
    '@fontsource-variable/jost/wght.css',
    '@fontsource/nunito/cyrillic-900.css',
    '@fontsource/nunito/latin-900.css',
    '~/assets/css/main.css',
  ],
  app: {
    head: {
      htmlAttrs: { lang: 'bg' },
      titleTemplate: '%s · boop',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'robots', content: 'index, follow, max-image-preview:large' },
        { name: 'theme-color', content: '#23301f' },
        { name: 'description', content: 'Купички, лъжички и медальони с името на любимеца. Изработени в България.' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/favicon.png' },
        { rel: 'alternate', type: 'text/plain', href: '/llms.txt', title: 'llms.txt' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  routeRules: {
    // Private flows stay out of search; everything else is indexable.
    '/checkout/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/checkout': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/track': { headers: { 'X-Robots-Tag': 'noindex, follow' } },
    // Old Bulgarian paths (already shared in social texts) -> English routes
    '/s-ime': { redirect: { to: '/personalize', statusCode: 301 } },
    '/produkti': { redirect: { to: '/products', statusCode: 301 } },
    '/za-nas': { redirect: { to: '/about', statusCode: 301 } },
    '/poruchka': { redirect: { to: '/checkout', statusCode: 301 } },
  },
  typescript: { strict: true },
  // emWear Client :3000, Imagoo :3001
  devServer: { port: 3002 },
  runtimeConfig: { public: { apiBase: 'http://localhost:3030', storeId: 'boop' } },
})
