<script setup lang="ts">
const { articles, groups, t, path, locale, alternate, edition, editions, snapshot, editionTarget } =
  useWikiLocale()
useWikiHead()
const query = ref('')
const menuOpen = ref(false)
const search = ref<HTMLInputElement>()
const menuButton = ref<HTMLButtonElement>()
const theme = ref('dark')
const route = useRoute()
function selectEdition(event: Event) {
  const target = editionTarget((event.target as HTMLSelectElement).value)
  if (target) navigateTo(target)
}
const closeMenu = () => {
  menuOpen.value = false
  menuButton.value?.focus()
}
watch(
  () => route.path,
  () => {
    menuOpen.value = false
    query.value = ''
  },
)
function setTheme(value: string) {
  theme.value = value
  document.documentElement.dataset.theme = value
  try {
    localStorage.setItem('nrf-wiki-theme', value)
  } catch {}
}
function shortcuts(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    menuOpen.value = true
    nextTick(() => search.value?.focus())
  }
  if (event.key === 'Escape') {
    query.value = ''
    closeMenu()
  }
}
onMounted(() => {
  theme.value = document.documentElement.dataset.theme || 'dark'
  window.addEventListener('keydown', shortcuts)
})
onUnmounted(() => window.removeEventListener('keydown', shortcuts))
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
// Articles change when the language changes, not on each search keystroke.
// Normalize the full reference once per language instead of repeatedly walking
// every signature and contract while the reader is typing.
const searchIndex = computed(() =>
  articles.value.map((article) => ({ article, text: normalize(JSON.stringify(article)) })),
)
const results = computed(() => {
  const terms = normalize(query.value).trim().split(/\s+/).filter(Boolean)
  return terms.length
    ? searchIndex.value
        .filter((entry) => terms.every((term) => entry.text.includes(term)))
        .map((entry) => entry.article)
    : []
})
</script>
<template>
  <a class="skip-link" href="#main">{{ t('Aller au contenu') }}</a>
  <header class="mobile-header">
    <NuxtLink class="brand" :to="path('/')"
      ><img src="/favicon.svg" alt="" width="28" height="28" />NRF
      <strong>SDK {{ edition.id }}</strong></NuxtLink
    >
    <button
      ref="menuButton"
      class="mobile-menu"
      :aria-expanded="menuOpen"
      aria-controls="wiki-navigation"
      @click="menuOpen = !menuOpen"
    >
      {{ t(menuOpen ? 'Fermer' : 'Menu') }}
    </button>
  </header>
  <button
    v-if="menuOpen"
    class="menu-backdrop"
    :aria-label="t('Fermer la navigation')"
    @click="closeMenu"
  />
  <div class="wiki-layout">
    <aside id="wiki-navigation" class="sidebar" :class="{ open: menuOpen }">
      <NuxtLink
        class="brand sidebar-brand"
        :to="path('/')"
        :aria-label="t('NimbyRails France — accueil du wiki')"
      >
        <img src="/favicon.svg" alt="" width="34" height="34" />
        <span
          >NimbyRails <strong>France</strong><small>{{ t('LE GUIDE DES CRÉATEURS') }}</small></span
        >
      </NuxtLink>
      <form class="search-form" role="search" @submit.prevent>
        <label for="wiki-search" class="sr-only">{{ t('Rechercher dans le wiki') }}</label>
        <div class="search-input">
          <svg
            viewBox="0 0 24 24"
            width="17"
            height="17"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            aria-hidden="true"
          >
            <circle cx="10" cy="10" r="6.5" />
            <path d="m15 15 5 5" />
          </svg>
          <input
            id="wiki-search"
            ref="search"
            v-model="query"
            type="search"
            :placeholder="t('Rechercher…')"
            autocomplete="off"
          />
          <kbd aria-hidden="true">Ctrl K</kbd>
        </div>
      </form>
      <div class="edition-picker">
        <label for="wiki-edition">{{ t('Documentation') }} SDK {{ edition.id }}</label>
        <select
          id="wiki-edition"
          :value="edition.id"
          :aria-label="t('Édition de la documentation')"
          @change="selectEdition"
        >
          <option v-for="item in editions" :key="item.id" :value="item.id">
            SDK {{ item.id }} · {{ t(item.archived ? 'Archive' : 'Édition actuelle') }}
          </option>
        </select>
        <small>{{ edition.sdkVersion }} · Windows</small>
      </div>
      <div class="sidebar-scroll">
        <nav v-if="query.trim()" :aria-label="t('Résultats de recherche')" class="search-results">
          <p role="status">
            {{ results.length }} {{ t('résultat') }}{{ results.length !== 1 ? 's' : '' }}
          </p>
          <NuxtLink v-for="article in results" :key="article.slug" :to="path('/' + article.slug)"
            ><small>{{ article.group }}</small
            >{{ article.title }}</NuxtLink
          >
          <p v-if="!results.length">
            {{ t('Essayez « signal », « horloge » ou « TrackMetric ».') }}
          </p>
        </nav>
        <nav v-else :aria-label="t('Documentation')">
          <NuxtLink class="nav-home" :to="path('/')"
            ><span aria-hidden="true">⌂</span> {{ t('Vue d’ensemble') }}</NuxtLink
          >
          <section v-for="group in groups" :key="group" class="nav-group">
            <h2>{{ group }}</h2>
            <NuxtLink
              v-for="article in articles.filter((a) => a.group === group)"
              :key="article.slug"
              :to="path('/' + article.slug)"
            >
              {{ article.title
              }}<span
                v-if="article.status === 'experimental'"
                class="experimental-dot"
                :title="t('Expérimental')"
                :aria-label="t('Expérimental')"
              />
            </NuxtLink>
          </section>
        </nav>
      </div>
      <div class="sidebar-footer">
        <NuxtLink
          :to="alternate"
          class="language-switch"
          :aria-label="t('Langue')"
          :lang="locale === 'en' ? 'fr' : 'en'"
          :hreflang="locale === 'en' ? 'fr' : 'en'"
        >
          {{ locale === 'en' ? 'Français' : 'English' }}
        </NuxtLink>
        <a href="https://github.com/NimbyRails-France/wiki" class="github-link"
          >GitHub <span aria-hidden="true">↗</span></a
        >
        <div class="theme-switch" role="group" :aria-label="t('Apparence')">
          <button
            :aria-label="t('Thème clair')"
            :aria-pressed="theme === 'light'"
            @click="setTheme('light')"
          >
            <svg
              viewBox="0 0 24 24"
              width="17"
              height="17"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <path
                d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"
              />
            </svg>
          </button>
          <button
            :aria-label="t('Thème sombre')"
            :aria-pressed="theme === 'dark'"
            @click="setTheme('dark')"
          >
            <svg
              viewBox="0 0 24 24"
              width="17"
              height="17"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              aria-hidden="true"
            >
              <path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
    <div class="main-column">
      <main id="main" tabindex="-1">
        <aside v-if="edition.archived" class="archive-banner">
          <strong>{{ t('Archive') }} · SDK {{ edition.sdkVersion }}</strong>
          <p>
            {{
              t(
                'Cette archive conserve la documentation de cette version. Elle ne décrit pas les ajouts ni les corrections des éditions suivantes.',
              )
            }}
          </p>
          <a
            v-if="snapshot.provenance.sdkCommit"
            :href="'https://github.com/NimbyRails-France/sdk/tree/' + snapshot.provenance.sdkCommit"
            >{{ t('Sources du SDK') }} · {{ snapshot.sdkVersion }} ↗</a
          >
          <a
            v-if="snapshot.provenance.baseWikiCommit"
            :href="
              'https://github.com/NimbyRails-France/wiki/tree/' + snapshot.provenance.baseWikiCommit
            "
            >{{ t('Base documentaire historique') }} ·
            {{ snapshot.provenance.baseWikiCommit.slice(0, 8) }} ↗</a
          >
          <a
            v-if="snapshot.provenance.wikiCommit"
            :href="
              'https://github.com/NimbyRails-France/wiki/tree/' + snapshot.provenance.wikiCommit
            "
            >{{ t('Source historique') }} · {{ snapshot.provenance.wikiCommit.slice(0, 8) }} ↗</a
          >
        </aside>
        <slot />
      </main>
      <footer class="site-footer">
        <span>{{
          t('Le wiki des créateurs de mods avec le SDK developer par NimbyRails France.')
        }}</span
        ><a href="https://nimbyrails-france.fr/">NimbyRails France ↗</a>
      </footer>
    </div>
  </div>
</template>
