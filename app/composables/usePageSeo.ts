import type { MaybeRefOrGetter } from 'vue'

/** Title, meta description and the matching Open Graph / Twitter tags in one call. */
export function usePageSeo(o: { title: MaybeRefOrGetter<string>; description: MaybeRefOrGetter<string>; image?: MaybeRefOrGetter<string | undefined>; type?: 'website' | 'article' | 'product' }) {
  const title = () => toValue(o.title)
  const description = () => toValue(o.description)
  useSeoMeta({
    title,
    description,
    ogTitle: () => `${title()} · boop`,
    ogDescription: description,
    twitterTitle: () => `${title()} · boop`,
    twitterDescription: description,
    ...(o.image ? { ogImage: () => toValue(o.image) ?? OG_IMAGE, twitterImage: () => toValue(o.image) ?? OG_IMAGE } : {}),
    ...(o.type ? { ogType: o.type as 'website' } : {}),
  })
}
