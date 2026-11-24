// Start downloading the homepage 3D scene as early as possible (before hydration finishes).
export default defineNuxtPlugin(() => {
  if (useRoute().path === '/') import('~/utils/bowl3d')
})
