import registry from './editions/registry.json'

export type Locale = 'fr' | 'en'
export const editionRegistry = registry
export const currentEdition = registry.current

/** Parse URL prefixes independently of the article slug and query/fragment. */
export function wikiRoute(value: string) {
  const suffixAt = value.search(/[?#]/)
  const pathname = suffixAt < 0 ? value : value.slice(0, suffixAt)
  const suffix = suffixAt < 0 ? '' : value.slice(suffixAt)
  const locale: Locale = /^\/en(?:\/|$)/.test(pathname) ? 'en' : 'fr'
  const base = pathname.replace(/^\/en(?=\/|$)/, '').replace(/\/+$/, '') || '/'
  const versioned = /^\/version(?:\/|$)/.test(base)
  const match = base.match(/^\/version\/([^/]+)(?:\/(.*))?$/)
  const edition = versioned ? match?.[1] || '' : currentEdition
  const slug = versioned ? match?.[2] || '' : base.replace(/^\//, '')
  return { locale, edition, slug, suffix, versioned }
}

/** All links within an edition keep that edition, language, and fragment. */
export function editionPath(value: string, locale: Locale, edition = currentEdition): string {
  if (!value.startsWith('/') || value.startsWith('//')) return value
  const route = wikiRoute(value)
  return `${locale === 'en' ? '/en' : ''}/version/${edition}${route.slug ? '/' + route.slug : ''}${route.suffix}`
}
