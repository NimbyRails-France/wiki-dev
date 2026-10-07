import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { catalogue, symbolKey } from '../scripts/api-catalogue.mjs'
import { declarations } from '../scripts/kotlin-api.mjs'
import { loadContent } from '../scripts/content-loader.mjs'

const snapshot = JSON.parse(
  await readFile(new URL('../app/content/generated/api.json', import.meta.url), 'utf8'),
)
const legacy = JSON.parse(
  await readFile(new URL('../scripts/api-legacy.json', import.meta.url), 'utf8'),
)

test('runtime, package and overload types distinguish public identities independently of order', () => {
  const make = (runtime, pkg) => ({
    runtime,
    package: pkg,
    file: 'TrainTypes.kt',
    symbols: declarations(`class TrainId(val value: Long)
fun read(id: Long): String = privateRead(id)
fun read(id: TrainId): String = privateRead(id.value)`),
  })
  const files = [make('Kotlin/Native', 'nimby'), make('Kotlin/JVM', 'fr.nimby.sdk')]
  const a = catalogue(files),
    b = catalogue(files.toReversed().map((f) => ({ ...f, symbols: f.symbols.toReversed() })))
  assert.equal(new Set(a.files.map((f) => f.slug)).size, 2)
  assert.deepEqual(
    a.files.flatMap((f) => f.symbols.map((s) => [s.id, s.anchor])).sort(),
    b.files.flatMap((f) => f.symbols.map((s) => [s.id, s.anchor])).sort(),
  )
  assert.notEqual(a.files[0].symbols.at(-1).id, a.files[0].symbols.at(-2).id)
  assert(a.exports.some((s) => s.import === 'nimby.TrainId'))
  assert(a.exports.some((s) => s.import === 'fr.nimby.sdk.TrainId'))
  assert.equal(
    symbolKey(declarations('fun value(input: Int = 1): String = hidden()')[0]),
    symbolKey(declarations('fun value(renamed: Int = 2): String = different()')[0]),
  )
  assert.throws(() => catalogue([files[0], files[0]]), /Duplicate/)
})

test('existing routes and resolved member anchors remain stable while TrainTypes has two pages', () => {
  for (const old of legacy) {
    const file = snapshot.files.find((f) => f.id === old.id)
    assert(file, old.id)
    assert.equal(file.slug, old.slug)
    for (const symbol of old.symbols) {
      const current = file.symbols.find((s) => s.key === (symbol.currentKey || symbol.key))
      assert(current, `Missing compatibility target: ${old.id}:${symbol.key}`)
      assert.equal(current.anchor, symbol.anchor, `${old.id}:${symbol.key}`)
    }
  }
  assert.equal(new Set(snapshot.files.map((f) => f.slug)).size, snapshot.files.length)
  const symbols = snapshot.files.flatMap((f) => f.symbols)
  assert.equal(new Set(symbols.map((s) => s.id)).size, symbols.length)
  const trainTypes = snapshot.files.filter((f) => f.file === 'TrainTypes.kt')
  assert.deepEqual(trainTypes.map((f) => f.slug).sort(), [
    'reference/jvm/fr.nimby.sdk/traintypes',
    'reference/native/nimby/traintypes',
  ])
})

test('rendered catalogue has complete bilingual comments and separates both import surfaces', () => {
  const { referenceArticles, referenceIndex, referenceEnglish } = loadContent(
    'app/content/reference.ts',
  )
  const native = referenceIndex.sections
    .find((s) => s.id === 'mod')
    .blocks.flatMap((b) => (b.kind === 'links' ? b.items : []))
  const jvm = referenceIndex.sections
    .find((s) => s.id === 'outil')
    .blocks.flatMap((b) => (b.kind === 'links' ? b.items : []))
  assert(native.some((link) => link.to === '/reference/native/nimby/traintypes'))
  assert(!native.some((link) => link.to === '/reference/jvm/fr.nimby.sdk/traintypes'))
  assert(jvm.some((link) => link.to === '/reference/jvm/fr.nimby.sdk/traintypes'))
  const both = referenceArticles.filter((a) => a.title.startsWith('TrainTypes'))
  assert.equal(both.length, 2)
  for (const article of both) {
    const imports = article.sections[0].blocks.find((b) => b.kind === 'code').code
    assert(
      imports.includes(
        article.slug.includes('/native/')
          ? 'import nimby.TrainQuery'
          : 'import fr.nimby.sdk.TrainQuery',
      ),
    )
    assert(!imports.includes('internal'))
    assert(!imports.includes('com.sun.jna'))
  }
  assert(!Object.values(referenceEnglish).some((s) => s.includes('undefined')))
  const service = referenceArticles.find((a) => a.slug === 'reference/observation')
  const state = service.sections.find((s) => s.title === 'Service.state')
  const contract = state.blocks
    .filter((block) => block.kind === 'text')
    .map((block) => block.text)
    .join('\n')
  assert.match(contract, /null.*indisponible/)
  assert.match(contract, /non reconnu.*Other/)
})
