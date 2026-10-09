<script setup lang="ts">
import { resolveWikiRoute } from '~/content/editions'
definePageMeta({
  validate: (route) => resolveWikiRoute(route.path).exists,
})
const route = useRoute()
const { articles: localizedArticles, path, t, edition } = useWikiLocale()
const slug = computed(() => resolveWikiRoute(route.path).slug)
const article = computed(() => localizedArticles.value.find((a) => a.slug === slug.value))
if (slug.value && !article.value)
  throw createError({ statusCode: 404, statusMessage: t('Page introuvable') })
const position = computed(() => localizedArticles.value.findIndex((a) => a.slug === slug.value))
const previous = computed(() => localizedArticles.value[position.value - 1])
const next = computed(() => localizedArticles.value[position.value + 1])
const activeSection = ref('')
const articleElement = ref<HTMLElement>()
let headings: { id: string; top: number }[] = []
let frame = 0
let sizeObserver: ResizeObserver | undefined
function measureSections() {
  headings = (article.value?.sections || []).map((section) => ({
    id: section.id,
    top:
      (document.getElementById(section.id)?.getBoundingClientRect().top ?? Infinity) +
      window.scrollY,
  }))
  updateSection()
}
function updateSection() {
  // Reference pages can contain hundreds of members. Layout is measured only
  // when it changes; scrolling uses a binary search over cached heading offsets.
  const limit = window.scrollY + 140
  let low = 0,
    high = headings.length
  while (low < high) {
    const middle = (low + high) >>> 1
    if (headings[middle]!.top <= limit) low = middle + 1
    else high = middle
  }
  activeSection.value = headings[Math.max(0, low - 1)]?.id || ''
}
function onScroll() {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    updateSection()
  })
}
onMounted(() => {
  measureSections()
  sizeObserver = new ResizeObserver(measureSections)
  if (articleElement.value) sizeObserver.observe(articleElement.value)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', measureSections, { passive: true })
})
onUnmounted(() => {
  sizeObserver?.disconnect()
  cancelAnimationFrame(frame)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', measureSections)
})
watch(article, () => nextTick(measureSections))
useSeoMeta({
  title: () =>
    `${article.value?.title || 'Documentation'} — SDK ${edition.value.id} — Wiki NimbyRails France`,
  description: () => article.value?.description,
})
</script>
<template>
  <WikiHome v-if="!slug" />
  <WikiShell v-if="article">
    <div class="article-layout">
      <article ref="articleElement" class="article">
        <div class="breadcrumbs">
          <NuxtLink :to="path('/')">Wiki</NuxtLink><span>/</span><span>{{ article.group }}</span>
        </div>
        <p class="eyebrow">{{ article.group }}</p>
        <h1>{{ article.title }}</h1>
        <p class="article-lead">{{ article.description }}</p>
        <aside v-if="article.status" class="note">
          <strong>{{
            t(article.status === 'experimental' ? 'Fonction expérimentale' : 'API en développement')
          }}</strong>
          <p>
            {{
              t(
                article.status === 'experimental'
                  ? 'Cette fonction demande une qualification spécifique. Sa présence dans la référence ne signifie pas qu’elle est disponible dans le kit distribué.'
                  : 'Utilisez un kit et un SDK installé correspondant à la version documentée dans cette édition.',
              )
            }}
          </p>
        </aside>
        <section
          v-for="section in article.sections"
          :id="section.id"
          :key="section.id"
          class="article-section"
        >
          <h2>
            <a :href="'#' + section.id">{{ section.title }}<span aria-hidden="true"> #</span></a>
          </h2>
          <ArticleBlocks :blocks="section.blocks" />
        </section>
        <div class="article-meta">
          <a href="https://github.com/NimbyRails-France/wiki-dev/issues/new">{{
            t('Signaler une erreur dans cette page ↗')
          }}</a
          ><span>Windows · SDK {{ edition.sdkVersion }}</span>
        </div>
        <nav class="page-navigation" :aria-label="t('Parcours du wiki')">
          <NuxtLink v-if="previous" :to="path('/' + previous.slug)"
            ><small>{{ t('← PRÉCÉDENT') }}</small
            >{{ previous.title }}</NuxtLink
          ><NuxtLink v-if="next" :to="path('/' + next.slug)"
            ><small>{{ t('SUIVANT →') }}</small
            >{{ next.title }}</NuxtLink
          >
        </nav>
      </article>
      <aside class="table-of-contents">
        <p>{{ t('Sur cette page') }}</p>
        <a
          v-for="section in article.sections"
          :key="section.id"
          :href="'#' + section.id"
          :aria-current="activeSection === section.id ? 'location' : undefined"
          >{{ section.title }}</a
        >
        <div class="toc-note">
          {{ t('Une question sur le SDK ?') }}
          <NuxtLink :to="path('/reference')">{{ t('Explorer les types Kotlin ↗') }}</NuxtLink>
        </div>
      </aside>
    </div>
  </WikiShell>
</template>
