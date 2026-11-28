export default defineNuxtPlugin(() => {
  const c = readConsent()
  consent().value = c
  if (c === 'yes') loadPixel()
  // SPA navigations: one PageView per route change (the first one is sent by loadPixel)
  useRouter().afterEach((to, from) => { if (from.matched.length && to.fullPath !== from.fullPath) track('PageView') })
})
