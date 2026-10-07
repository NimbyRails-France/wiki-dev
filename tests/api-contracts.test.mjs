import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { loadContent } from '../scripts/content-loader.mjs'

const snapshot = JSON.parse(
  await readFile(new URL('../app/content/generated/api.json', import.meta.url), 'utf8'),
)
const { reviewedApiContracts, apiContractSources, reviewedContractGuides } = loadContent('app/content/api-contracts.ts')
const expected = snapshot.files.flatMap((file) => file.symbols.map((symbol) => symbol.id)).sort()

test('every public declaration has its own reviewed French and English contract', () => {
  assert.deepEqual(Object.keys(reviewedApiContracts).sort(), expected)
  const assigned = Object.values(apiContractSources).flatMap(Object.keys)
  assert.equal(
    new Set(assigned).size,
    assigned.length,
    'A symbol has two competing contract owners',
  )
  for (const [id, pair] of Object.entries(reviewedApiContracts)) {
    assert.equal(pair.length, 2, id)
    for (const value of pair) {
      assert.equal(typeof value, 'string', id)
      assert(value.trim().length > 0, id)
      assert(!/\b(?:TODO|FIXME|undefined)\b/.test(value), id)
    }
  }
})

test('the rendered reference actually uses each reviewed contract', () => {
  const { referenceArticles, referenceEnglish } = loadContent('app/content/reference.ts')
  for (const file of snapshot.files) {
    const article = referenceArticles.find((entry) => entry.slug === file.slug)
    assert(article, file.id)
    for (const symbol of file.symbols) {
      const section = article.sections.find((entry) => entry.id === symbol.anchor)
      assert(section, symbol.id)
      const [fr, en] = reviewedApiContracts[symbol.id]
      assert(
        section.blocks.some((block) => block.kind === 'text' && block.text === fr),
        symbol.id,
      )
      assert.equal(referenceEnglish[fr], en, symbol.id)
    }
  }
})

test('related guides belong to real public declarations', () => {
  const ids = new Set(expected)
  for (const [id, routes] of Object.entries(reviewedContractGuides)) {
    assert(ids.has(id), `Orphaned guide association: ${id}`)
    assert(routes.length > 0, id)
    assert.equal(new Set(routes).size, routes.length, id)
    assert(routes.every((route) => route.startsWith('/') && !route.startsWith('//')), id)
  }
})
