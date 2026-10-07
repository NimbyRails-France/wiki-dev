import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { loadContent } from '../scripts/content-loader.mjs'
import { captureEdition, serialize, verifySnapshot, digest } from '../scripts/edition-snapshot.mjs'

const { editionRegistry, editionPath, wikiRoute } = loadContent('app/content/edition-paths.ts')
const { editionSnapshot, resolveWikiRoute, switchEdition } = loadContent('app/content/editions.ts')

test('each edition has an independent verified bilingual snapshot', () => {
  for (const entry of editionRegistry.editions) {
    const text = readFileSync(`app/content/editions/${entry.id}.json`, 'utf8')
    const snapshot = verifySnapshot(entry, text)
    assert.deepEqual(
      snapshot.locales.fr.articles.map((a) => a.slug),
      snapshot.locales.en.articles.map((a) => a.slug),
    )
    assert.throws(() => verifySnapshot(entry, text + ' '), /SHA-256 mismatch/)
  }
  const historical = editionSnapshot('0.8')
  assert.equal(historical.sdkVersion, '0.8.0-alpha.8')
  assert(!historical.locales.fr.articles.some((a) => a.slug === 'lire/trains-observations'))
  assert(
    editionSnapshot('0.9').locales.fr.articles.some((a) => a.slug === 'lire/trains-observations'),
  )
  assert.notEqual(historical, editionSnapshot('0.9'))
})

test('0.8 documents every alpha.8 declaration with exact signatures and SDK provenance', () => {
  const apiText = readFileSync('app/content/editions/0.8-api.json', 'utf8')
  const api = JSON.parse(apiText)
  const snapshot = editionSnapshot('0.8')
  assert.equal(api.sdkVersion, snapshot.sdkVersion)
  assert.equal(snapshot.provenance.catalogueSha256, digest(apiText))
  assert.equal(snapshot.provenance.sdkCommit, 'ea1ffc6ee68ffd650d1ceab5ca450ae0b8136434')
  assert.equal(snapshot.provenance.sdkTag, 'v0.8.0-alpha.8')
  assert.equal(snapshot.provenance.baseWikiCommit, '75c88420cb10dd5de17d1ca9ee0e805570597f5b')
  assert.deepEqual(
    snapshot.provenance.files,
    api.files.map(({ path, sha256 }) => ({ path, sha256 })),
  )
  const { alpha8Contracts } = loadContent('app/content/editions/0.8-contracts.ts')
  for (const [language, locale] of ['fr', 'en'].entries()) {
    const articles = snapshot.locales[locale].articles
    assert(!JSON.stringify(articles).includes('0.8.0-alpha.3'))
    for (const file of api.files) {
      const article = articles.find((a) => a.slug === file.slug)
      assert(article, `${locale}: ${file.slug}`)
      assert.equal(new Set(article.sections.map((s) => s.id)).size, article.sections.length)
      for (const symbol of file.symbols) {
        const section = article.sections.find((s) => s.id === symbol.anchor)
        assert(section, `${locale}: ${symbol.id}`)
        assert(
          section.blocks.some((b) => b.kind === 'code' && b.code === symbol.signature),
          `${locale}: ${symbol.id} signature`,
        )
        if (alpha8Contracts[symbol.id])
          assert(
            section.blocks.some(
              (b) => b.kind === 'text' && b.text === alpha8Contracts[symbol.id][language],
            ),
            `${locale}: ${symbol.id} reviewed contract`,
          )
      }
    }
  }
  assert.equal(api.files.length, 22)
  assert(
    !api.files.some((f) =>
      [
        'TrainTypes.kt',
        'ToolTopology.kt',
        'TrainObservation.kt',
        'ToolOperationException.kt',
      ].includes(f.file),
    ),
  )
  const number = api.files.find((f) => f.file === 'NumberSetting.kt')
  assert(number.symbols.some((s) => s.name === 'withValue'))
  assert(!number.symbols.some((s) => s.name === 'minimum'))
})

test('current snapshot exactly represents current localized authoring modules', () => {
  assert.equal(
    serialize(captureEdition(editionRegistry.current)),
    readFileSync(`app/content/editions/${editionRegistry.current}.json`, 'utf8'),
  )
})

test('capture refuses to overwrite an archived edition', () => {
  const before = readFileSync('app/content/editions/0.8.json', 'utf8')
  const result = spawnSync(process.execPath, ['scripts/snapshot-edition.mjs', '--id=0.8'], {
    encoding: 'utf8',
  })
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /archived and cannot be overwritten/)
  assert.equal(readFileSync('app/content/editions/0.8.json', 'utf8'), before)
})

test('the retired 0.8 distribution page is removed without hiding its current guide', () => {
  for (const locale of ['fr', 'en']) {
    const prefix = locale === 'en' ? '/en' : ''
    assert(!resolveWikiRoute(`${prefix}/version/0.8/maintenance/distribution`).exists)
    assert(
      !editionSnapshot('0.8').locales[locale].articles.some(
        (article) => article.slug === 'maintenance/distribution',
      ),
    )
    assert(resolveWikiRoute(`${prefix}/version/0.9/maintenance/distribution`).exists)
    assert.equal(
      resolveWikiRoute(`${prefix}/maintenance/distribution`).canonical,
      `${prefix}/version/0.9/maintenance/distribution`,
    )
    assert.equal(
      switchEdition(`${prefix}/version/0.9/maintenance/distribution`, '0.8'),
      `${prefix}/version/0.8`,
    )
  }
})

test('version URLs, aliases, language, queries and anchors resolve without cross-edition fallback', () => {
  assert.equal(
    editionPath('/en/mods/signaux#voisin', 'fr', '0.9'),
    '/version/0.9/mods/signaux#voisin',
  )
  assert.equal(
    editionPath('/version/0.8/mods/signaux?q=1#voisin', 'en', '0.8'),
    '/en/version/0.8/mods/signaux?q=1#voisin',
  )
  assert.equal(editionPath('#anchor', 'en', '0.8'), '#anchor')
  assert.equal(editionPath('https://example.com/a', 'en', '0.8'), 'https://example.com/a')
  assert.equal(
    resolveWikiRoute('/en/mods/signaux?q=1#voisin').canonical,
    '/en/version/0.9/mods/signaux?q=1#voisin',
  )
  assert.equal(resolveWikiRoute('/maintenance/contribuer#local').edition, '0.8')
  assert.equal(
    resolveWikiRoute('/en/lire/trains#memoire').canonical,
    '/en/version/0.8/lire/trains#memoire',
  )
  assert.equal(resolveWikiRoute('/en/version/0.9/lire/trains#memoire').edition, '0.9')
  assert(!resolveWikiRoute('/version/0.8/lire/trains-observations').exists)
  assert(!resolveWikiRoute('/version/9.9/mods/signaux').exists)
  assert(!resolveWikiRoute('/version').exists)
  assert.equal(wikiRoute('/enough').locale, 'fr')
})

test('edition selection keeps a shared section or returns to its own home', () => {
  const article = editionSnapshot('0.8').locales.fr.articles.find((a) => a.slug === 'mods/signaux')
  const shared = article.sections.find((a) =>
    editionSnapshot('0.9')
      .locales.fr.articles.find((b) => b.slug === article.slug)
      .sections.some((b) => b.id === a.id),
  )
  assert(shared)
  assert.equal(
    switchEdition(`/en/version/0.9/mods/signaux#${shared.id}`, '0.8'),
    `/en/version/0.8/mods/signaux#${shared.id}`,
  )
  assert.equal(
    switchEdition('/en/version/0.9/lire/trains-observations#groupes', '0.8'),
    '/en/version/0.8',
  )
  assert.equal(
    switchEdition('/version/0.9/mods/signaux#not-a-section', '0.8'),
    '/version/0.8/mods/signaux',
  )
  assert.equal(switchEdition('/version/0.9', '9.9'), undefined)
})

test('links in both snapshots stay within their own edition and resolve to real anchors', () => {
  for (const entry of editionRegistry.editions)
    for (const locale of ['fr', 'en']) {
      const articles = editionSnapshot(entry.id).locales[locale].articles
      for (const article of articles)
        for (const section of article.sections)
          for (const block of section.blocks) {
            if (block.kind !== 'links') continue
            for (const item of block.items) {
              if (!item.to.startsWith('/') || item.to.startsWith('//')) continue
              const target = wikiRoute(editionPath(item.to, locale, entry.id))
              if (!target.slug) continue
              const destination = articles.find((a) => a.slug === target.slug)
              assert(destination, `${entry.id}/${locale}: ${article.slug} → ${item.to}`)
              const hash = target.suffix.split('#')[1]
              if (hash)
                assert(
                  destination.sections.some((s) => s.id === hash),
                  `${entry.id}/${locale}: missing anchor ${item.to}`,
                )
            }
          }
    }
})
