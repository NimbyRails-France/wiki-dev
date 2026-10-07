import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadContent } from '../scripts/content-loader.mjs'

const { articlesFor, localePath } = loadContent('app/content/localization.ts')
for (const locale of ['fr', 'en']) {
  test(`${locale} article links resolve to distinct pages and real section anchors before generation`, () => {
    const articles = articlesFor(locale)
    const paths = new Map(
      articles.map((article) => [localePath('/' + article.slug, locale), article]),
    )
    assert.equal(paths.size, articles.length, 'Duplicate article routes')
    for (const article of articles) {
      const path = localePath('/' + article.slug, locale)
      assert.equal(
        new Set(article.sections.map((section) => section.id)).size,
        article.sections.length,
        path,
      )
      for (const section of article.sections)
        for (const block of section.blocks) {
          if (block.kind !== 'links') continue
          for (const link of block.items) {
            if (!/^(?:\/(?!\/)|#)/.test(link.to)) continue
            const target = new URL(link.to, 'https://wiki.invalid' + path)
            if (target.pathname === localePath('/', locale)) continue
            const destination = paths.get(target.pathname)
            assert(destination, `${path} → ${link.to}: missing page`)
            if (target.hash)
              assert(
                destination.sections.some((item) => '#' + item.id === target.hash),
                `${path} → ${link.to}: missing anchor`,
              )
          }
        }
    }
  })
}
