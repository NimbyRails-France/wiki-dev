import ui from '~/content/ui-en.json'
import messages from '~/content/en.json'
import { currentEdition, editionPath, editionRegistry, wikiRoute } from '~/content/edition-paths'
import type { Locale } from '~/content/edition-paths'
import { editionSnapshot, resolveWikiRoute, switchEdition } from '~/content/editions'

const english: Record<string, string> = { ...messages, ...ui }

export function useWikiLocale() {
  const route = useRoute()
  const location = computed(() => resolveWikiRoute(route.path))
  const locale = computed(() => location.value.locale)
  const edition = computed(
    () =>
      editionRegistry.editions.find((entry) => entry.id === location.value.edition) ||
      editionRegistry.editions.find((entry) => entry.id === currentEdition)!,
  )
  const snapshot = computed(() => editionSnapshot(edition.value.id)!)
  const path = (value: string) => editionPath(value, locale.value, edition.value.id)
  const t = (value: string) => {
    if (locale.value === 'fr') return value
    const translated = english[value]
    if (translated === undefined) throw new Error('Missing English interface translation: ' + value)
    return translated
  }
  const articles = computed(() => snapshot.value.locales[locale.value].articles)
  const groups = computed(() => snapshot.value.locales[locale.value].groups)
  // Fragments are not sent to the server; update only after hydration.
  const fragment = ref('')
  onMounted(() => {
    fragment.value = route.hash
  })
  watch(
    () => route.hash,
    (hash) => {
      fragment.value = hash
    },
  )
  const alternate = computed(
    () =>
      editionPath(
        '/' + location.value.slug,
        locale.value === 'en' ? 'fr' : 'en',
        edition.value.id,
      ) + fragment.value,
  )
  const editionTarget = (id: string) => switchEdition(route.path + fragment.value, id)
  return {
    locale,
    edition,
    snapshot,
    editions: editionRegistry.editions,
    path,
    t,
    articles,
    groups,
    alternate,
    editionTarget,
  }
}

export function useWikiHead() {
  const route = useRoute()
  useHead(() => {
    const location = resolveWikiRoute(route.path)
    const target = (locale: Locale) =>
      'https://wiki-dev.nimbyrails-france.fr' +
      editionPath('/' + location.slug, locale, location.edition || currentEdition)
    return {
      htmlAttrs: { lang: wikiRoute(route.path).locale },
      link: [
        { rel: 'canonical', href: target(location.locale) },
        ...(['fr', 'en'] as const).map((locale) => ({
          rel: 'alternate' as const,
          type: 'text/html',
          hreflang: locale,
          href: target(locale),
        })),
        { rel: 'alternate', type: 'text/html', hreflang: 'x-default', href: target('fr') },
      ],
    }
  })
}
