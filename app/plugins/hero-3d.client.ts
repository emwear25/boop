// Start downloading the homepage 3D scene as early as possible (before hydration finishes),
// but only on devices that will actually run it.
import { canRun3D } from '~/utils/heroMode'

export default defineNuxtPlugin(() => {
  if (useRoute().path === '/' && canRun3D()) import('~/utils/bowl3d')
})
