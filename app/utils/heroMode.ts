/**
 * Should this device get the live 3D bowl, or the still picture?
 * Old/cheap Android phones (little memory, few cores), data-saver or slow networks,
 * reduced motion and missing WebGL all get the picture, and never download three.js.
 */
export function canRun3D(): boolean {
  if (!import.meta.client) return false
  if (new URLSearchParams(location.search).has('lite')) return false // boop.bg/?lite shows the still version
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string } }
  if (nav.connection?.saveData) return false
  if (/2g|3g/.test(nav.connection?.effectiveType ?? '')) return false
  if (nav.deviceMemory && nav.deviceMemory < 4) return false
  if (nav.hardwareConcurrency && nav.hardwareConcurrency < 4) return false
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    const c = document.createElement('canvas')
    if (!(c.getContext('webgl2') || c.getContext('webgl'))) return false
  } catch { return false }
  return true
}
