/**
 * Client for the shared emWear backend.
 *
 * Every request carries `X-Store: boop`, so the server only ever returns or
 * changes boop data (products, categories, orders, customers). Works during
 * SSR too, where no Origin header could identify the store.
 *
 *   const api = useApi()
 *   const { data } = await api<{ data: Product[] }>('/api/products')
 */
export function useApi() {
  const { apiBase, storeId } = useRuntimeConfig().public

  return $fetch.create({
    // tolerate typos in the env value such as a trailing dot or slash ("https://api.emwear.bg.")
    baseURL: String(apiBase).trim().replace(/[./]+$/, ''),
    headers: { 'X-Store': storeId },
    credentials: 'include',
  })
}
