import registry from './app/content/editions/registry.json'
import snapshots from './app/content/editions/snapshots'

const routes = new Set<string>(['/', '/en'])
for (const [id, data] of Object.entries(snapshots)) {
  for (const locale of ['fr', 'en'] as const) {
    const prefix = locale === 'en' ? '/en' : ''
    routes.add(`${prefix}/version/${id}`)
    for (const article of data.locales[locale].articles) {
      routes.add(`${prefix}/version/${id}/${article.slug}`)
      // Keep every historical URL accessible, including retired guides.
      routes.add(`${prefix}/${article.slug}`)
    }
  }
}
if (!registry.current) throw new Error('Capture a current documentation edition before building')

export default defineNuxtConfig({
  compatibilityDate: '2026-09-27',
  devtools: { enabled: false },
  css: ['~/assets/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'Wiki développeurs — NimbyRails France',
      meta: [{ name: 'theme-color', content: '#111216' }],
      script: [{ src: '/theme.js' }],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  nitro: { prerender: { crawlLinks: true, failOnError: true, routes: [...routes] } },
  typescript: { strict: true },
})
