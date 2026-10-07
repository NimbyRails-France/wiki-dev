import snapshots from './editions/snapshots'
import { currentEdition, editionPath, editionRegistry, wikiRoute } from './edition-paths'
import type { Locale } from './edition-paths'
import type { Article } from './schema'

export type EditionArticle = Omit<Article, 'group'> & { group: string }
export interface EditionSnapshot {
  schema: number
  id: string
  sdkVersion: string
  provenance: {
    wikiCommit?: string
    baseWikiCommit?: string
    sdkCommit?: string
    sdkTag?: string
    source?: string
    catalogueSha256: string
    files: { path: string; sha256: string }[]
  }
  locales: Record<Locale, { groups: string[]; articles: EditionArticle[] }>
}
const content = snapshots as unknown as Record<string, EditionSnapshot>
export function editionSnapshot(id: string): EditionSnapshot | undefined {
  return content[id]
}
export function resolveWikiRoute(value: string) {
  const route = wikiRoute(value)
  // Old links normally follow the current edition. A retired guide or section
  // remains available in its original archive. Explicit edition URLs never
  // fall back, so a missing API cannot silently become a different contract.
  const hash = route.suffix.includes('#') ? route.suffix.slice(route.suffix.indexOf('#') + 1) : ''
  const currentArticle = content[currentEdition]?.locales[route.locale].articles.find(
    (item) => item.slug === route.slug,
  )
  if (
    !route.versioned &&
    route.slug &&
    (!currentArticle || (hash && !currentArticle.sections.some((section) => section.id === hash)))
  ) {
    const previous = editionRegistry.editions.find((entry) => {
      const article = content[entry.id]?.locales[route.locale].articles.find(
        (item) => item.slug === route.slug,
      )
      return article && (!currentArticle || article.sections.some((section) => section.id === hash))
    })
    if (previous) route.edition = previous.id
  }
  const snapshot = content[route.edition]
  const exists = Boolean(
    snapshot &&
    (!route.slug ||
      snapshot.locales[route.locale].articles.some((item) => item.slug === route.slug)),
  )
  return {
    ...route,
    exists,
    canonical: editionPath('/' + route.slug + route.suffix, route.locale, route.edition),
  }
}

export function switchEdition(value: string, id: string) {
  const route = resolveWikiRoute(value)
  const snapshot = content[id]
  if (!snapshot) return undefined
  const target = snapshot.locales[route.locale].articles.find((item) => item.slug === route.slug)
  // A fragment belongs to a section, not merely to a matching page name.
  const hash = route.suffix.includes('#') ? route.suffix.slice(route.suffix.indexOf('#') + 1) : ''
  const anchor = target?.sections.some((section) => section.id === hash) ? '#' + hash : ''
  return editionPath(target ? '/' + target.slug + anchor : '/', route.locale, id)
}
