/**
 * boop products as they exist on the shared backend (store "boop").
 * The storefront shows its own catalogue (app/data/catalog.ts); at checkout every
 * cart line is matched to the backend product of the same name, which holds the
 * authoritative price and the size × colour variants (see tools/products/publish.mjs).
 */
interface ServerProduct { _id: string; name: string; isActive?: boolean }

let cache: Promise<Map<string, ServerProduct>> | null = null

export function useServerProducts() {
  const api = useApi()
  function load() {
    cache ??= api<{ data: ServerProduct[] }>('/api/products', { query: { limit: 500, active: 'true' } })
      .then((r) => new Map((r.data ?? []).map((p) => [p.name, p])))
      .catch((e) => { cache = null; throw e })
    return cache
  }
  return { load }
}

/** Variant size name on the backend (bowls are sold in 13/16/20 cm, the rest in one size). */
export const serverSize = (cm?: number) => (cm ? `${cm} см` : 'Стандартен')
