<script setup lang="ts">
const { articles, groups, path: localPath, t, locale, edition } = useWikiLocale()
useSeoMeta({
  title: () => t('Créer des mods en Kotlin — Wiki NimbyRails France'),
  description: () =>
    t(
      'Apprenez à créer des mods NIMBY Rails en Kotlin. Guides, exemples, types et référence du SDK NimbyRails France.',
    ),
})
const paths = [
  {
    number: '01',
    title: 'Votre premier mod',
    text: 'Créez votre projet, ajoutez le SDK et écrivez votre premier signal, étape par étape.',
    to: '/commencer/installation',
    label: 'Créer mon premier signal',
  },
  {
    number: '02',
    title: 'Donnez-lui vos règles',
    text: 'Réglages, indications, textures et conduite : votre mod choisit son comportement.',
    to: '/mods/signaux',
    label: 'Comprendre les signaux',
  },
  {
    number: '03',
    title: 'Explorez le SDK',
    text: 'Trains, voies, horloge et commandes. Retrouvez les signatures et les types Kotlin.',
    to: '/reference',
    label: 'Consulter la référence',
  },
]
const preview = computed(() =>
  locale.value === 'fr'
    ? `signalModel(
    "monmod.signal", "Mon signal", "mes_textures",
    fallback = fermé
) {
    rules {
        when {
            !fresh || !routeKnown -> fermé
            block == Occupancy.Clear -> ouvert
            else -> fermé
        }
    }
}`
    : `signalModel(
    "mymod.signal", "My signal", "my_textures",
    fallback = closed
) {
    rules {
        when {
            !fresh || !routeKnown -> closed
            block == Occupancy.Clear -> open
            else -> closed
        }
    }
}`,
)
</script>
<template>
  <WikiShell>
    <div v-if="edition.archived" class="home-content archive-home">
      <p class="eyebrow">{{ t('Archive') }}</p>
      <h1>{{ t('Documentation') }} SDK {{ edition.id }}</h1>
      <p class="article-lead">SDK {{ edition.sdkVersion }}</p>
      <section v-for="group in groups" :key="group">
        <h2>{{ group }}</h2>
        <ul class="prose-list">
          <li
            v-for="article in articles.filter((item) => item.group === group)"
            :key="article.slug"
          >
            <NuxtLink :to="localPath('/' + article.slug)">{{ article.title }}</NuxtLink>
          </li>
        </ul>
      </section>
    </div>
    <div v-else class="home-content">
      <div class="home-topline">
        <span>{{ t('Documentation officielle') }}</span
        ><span><i class="status-dot" /> Kotlin · Windows</span>
      </div>
      <section class="hero">
        <div>
          <p class="eyebrow"><span /> {{ t('LE GUIDE DES CRÉATEURS') }}</p>
          <h1>
            {{ t('Vos idées.') }}<br />{{ t('Votre réseau.') }}<br /><em>{{ t('Vos mods.') }}</em>
          </h1>
          <p class="hero-description">
            {{ t('Créez pour NIMBY Rails avec Kotlin.') }}<br />{{
              t(
                'Du premier signal aux comportements avancés, un guide pour comprendre et construire.',
              )
            }}
          </p>
          <div class="hero-actions">
            <NuxtLink class="button primary" :to="localPath('/commencer/installation')"
              >{{ t('Commencer un mod') }} <span>↗</span></NuxtLink
            ><NuxtLink class="button secondary" :to="localPath('/reference')"
              >{{ t('Explorer l’API') }} <span>→</span></NuxtLink
            >
          </div>
        </div>
        <div class="hero-code">
          <CodeBlock :code="preview" :title="t('Vos règles · Kotlin')" />
          <p class="hero-code-caption">
            <span>{{ t('Votre signal. Votre comportement.') }}</span
            ><span>{{ t('Extrait de déclaration') }}</span>
          </p>
        </div>
      </section>
      <div class="release-note">
        <span class="badge">SDK {{ edition.id }}</span>
        <p>
          {{
            t(
              'Cette édition décrit une version en développement. Les fonctions expérimentales sont indiquées sur leur page.',
            )
          }}
          · {{ edition.sdkVersion }}
        </p>
      </div>
      <section class="learning-path">
        <div class="section-heading">
          <div>
            <p class="eyebrow">{{ t('À VOTRE RYTHME') }}</p>
            <h2>{{ t('Un point de départ pour chacun.') }}</h2>
          </div>
          <span>{{ t('Kotlin, du débutant à l’avancé') }}</span>
        </div>
        <div class="path-grid">
          <NuxtLink
            v-for="path in paths"
            :key="path.number"
            :to="localPath(path.to)"
            class="path-card"
            ><span class="path-number">{{ path.number }}</span>
            <h3>{{ t(path.title) }}</h3>
            <p>{{ t(path.text) }}</p>
            <strong>{{ t(path.label) }} <span>→</span></strong></NuxtLink
          >
        </div>
      </section>
      <section class="reference-banner">
        <div>
          <p class="eyebrow">{{ t('LA RÉFÉRENCE À PORTÉE DE MAIN') }}</p>
          <h2>{{ t('Un type. Une question.') }}<br />{{ t('Une réponse concrète.') }}</h2>
          <p>
            {{
              t(
                'Paramètres, unités, valeurs absentes et exemples : retrouvez les contrats de l’API sans chercher dans le code natif.',
              )
            }}
          </p>
        </div>
        <div class="quick-links">
          <NuxtLink :to="localPath('/reference/trackmetric')"
            >TrackMetric <span>{{ t('Distance et position ↗') }}</span></NuxtLink
          ><NuxtLink :to="localPath('/reference/automaticdriving')"
            >AutomaticDriving <span>{{ t('Consignes du mod ↗') }}</span></NuxtLink
          ><NuxtLink :to="localPath('/lire/horloge')"
            >SimulationClock <span>{{ t('Le temps du jeu ↗') }}</span></NuxtLink
          >
        </div>
      </section>
      <p class="home-footnote">
        {{ articles.length }}
        {{ t('pages · Exemples en Kotlin · Documentation versionnée sur GitHub') }}
      </p>
    </div>
  </WikiShell>
</template>
