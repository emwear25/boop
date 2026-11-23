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
    baseURL: apiBase,
    headers: { 'X-Store': storeId },
    credentials: 'include',
  })
}
