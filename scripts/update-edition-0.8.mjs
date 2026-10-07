import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import assert from 'node:assert/strict'
import {
  captureEdition,
  historicalSource,
  digest,
  serialize,
  verifySnapshot,
} from './edition-snapshot.mjs'
import { readSdkSources } from './sdk-sources.mjs'
import { catalogue, symbolKey, fileIdentity } from './api-catalogue.mjs'
import { loadContent } from './content-loader.mjs'

// A deliberate, source-verified update requested by the owner. The normal
// snapshot command still refuses to recapture archives from the current SDK.
const sdkVersion = '0.8.0-alpha.8'
const sdkCommit = 'ea1ffc6ee68ffd650d1ceab5ca450ae0b8136434'
const sdkTag = 'v' + sdkVersion
const baseWikiCommit = '75c88420cb10dd5de17d1ca9ee0e805570597f5b'
const args = process.argv.slice(2)
const option = (name) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3)
if (!option('sdk') || (!args.includes('--apply') && !args.includes('--check')))
  throw new Error(
    'Use --sdk=<alpha.8 source export> and --check or --apply; optionally --sdk-repo=<Git checkout>',
  )
const sdk = resolve(option('sdk'))
const sdkRepo = resolve(option('sdk-repo') || '../sdk')
const sourceAtTag = (path) =>
  execFileSync('git', ['show', `${sdkCommit}:${path}`], {
    cwd: sdkRepo,
    maxBuffer: 16 * 1024 * 1024,
  })
assert.equal(
  execFileSync('git', ['rev-parse', `${sdkTag}^{commit}`], {
    cwd: sdkRepo,
    encoding: 'utf8',
  }).trim(),
  sdkCommit,
)
assert.equal(sourceAtTag('VERSION').toString().trim(), sdkVersion)
assert.equal(readFileSync(resolve(sdk, 'VERSION'), 'utf8').trim(), sdkVersion)
const { files } = await readSdkSources(sdk)
const tagFiles = execFileSync('git', ['ls-tree', '-r', '--name-only', sdkCommit], {
  cwd: sdkRepo,
  encoding: 'utf8',
}).split('\n')
const publicPaths = tagFiles.filter((path) =>
  /^(?:kotlin\/src\/nimby|kotlin-client\/src\/main\/kotlin\/fr\/nimby\/sdk)\/[^/]+\.kt$/.test(path),
)
assert.deepEqual(
  files.map((f) => f.path).sort(),
  publicPaths.sort(),
  'Every alpha.8 public source must be inventoried',
)
for (const file of files)
  assert.equal(file.sha256, digest(sourceAtTag(file.path)), `Wrong alpha.8 source: ${file.path}`)

const baseline = historicalSource(baseWikiCommit)
const oldCatalogue = JSON.parse(baseline.source('app/content/generated/api.json'))
const legacy = oldCatalogue.files.map((file) => ({
  id: fileIdentity(file),
  slug: 'reference/' + file.file.replace('.kt', '').toLowerCase(),
  symbols: file.symbols.map((symbol, i) => ({ key: symbolKey(symbol), anchor: `symbol-${i}` })),
}))
for (const file of files) {
  const oldFile = oldCatalogue.files.find((f) => f.path === file.path)
  if (!oldFile) continue
  const previous = legacy.find((f) => f.id === fileIdentity(file))
  // Added default parameters must not invalidate an existing unique method's URL.
  for (const symbol of file.symbols) {
    if (previous.symbols.some((s) => s.key === symbolKey(symbol))) continue
    const matches = oldFile.symbols
      .map((s, i) => ({ s, i }))
      .filter(
        ({ s }) => s.name === symbol.name && s.owner === symbol.owner && s.kind === symbol.kind,
      )
    if (matches.length === 1) previous.symbols[matches[0].i].currentKey = symbolKey(symbol)
  }
}
const api = { sdkVersion, ...catalogue(files, legacy) }
const apiText = serialize(api)
let snapshot = captureEdition('0.8', { commit: baseWikiCommit })
snapshot.sdkVersion = sdkVersion
snapshot.provenance = {
  source: 'Historical bilingual guides reviewed against the final published SDK 0.8 release',
  baseWikiCommit,
  sdkCommit,
  sdkTag,
  catalogueSha256: digest(apiText),
  files: api.files.map(({ path, sha256 }) => ({ path, sha256 })),
  amendments: [
    {
      operation: 'remove-article',
      slug: 'maintenance/distribution',
      locales: ['fr', 'en'],
      reason: 'Explicit owner request; retained when updating the 0.8 edition to alpha.8.',
    },
  ],
}
const { alpha8Contracts } = loadContent('app/content/editions/0.8-contracts.ts')
const symbols = new Set(api.files.flatMap((f) => f.symbols.map((s) => s.id)))
for (const id of Object.keys(alpha8Contracts))
  assert(symbols.has(id), `Contract absent from alpha.8: ${id}`)
for (const [locale, local] of Object.entries(snapshot.locales)) {
  const language = locale === 'fr' ? 0 : 1
  const t = (fr, en) => (language ? en : fr)
  local.articles = local.articles.filter((a) => a.slug !== 'maintenance/distribution')
  for (const file of api.files) {
    const oldArticle = local.articles.find((a) => a.slug === file.slug)
    const name = file.file.replace('.kt', '')
    const article = oldArticle || {
      slug: file.slug,
      title: name,
      group: t('Référence', 'Reference'),
      description: t(
        'Entiers persistants et bornés dans les panneaux de signaux.',
        'Persistent bounded integers in signal panels.',
      ),
      sections: [],
    }
    const sections = article.sections.filter((s) => !s.id.startsWith('symbol-'))
    const context = sections.find((s) => s.id === 'contexte') || {
      id: 'contexte',
      title: t('Contexte d’utilisation', 'Usage context'),
      blocks: [],
    }
    context.blocks = [
      {
        kind: 'table',
        columns: t(['Module', 'Package', 'Source SDK'], ['Module', 'Package', 'SDK source']),
        rows: [[file.runtime, file.package, file.path]],
      },
      {
        kind: 'text',
        text: t(
          `Signatures vérifiées dans le SDK ${sdkVersion}. Les propriétés publiques et les valeurs des enums sont aussi accessibles séparément. Les constructeurs réservés au SDK ne sont pas des points d’entrée pour les mods.`,
          `Signatures verified against SDK ${sdkVersion}. Public properties and enum values are also listed separately. SDK-only constructors are not mod entry points.`,
        ),
      },
    ]
    if (!sections.includes(context)) sections.unshift(context)
    for (const symbol of file.symbols) {
      const previous = article.sections.find((s) => s.id === symbol.anchor)
      const blocks = [
        {
          kind: 'code',
          language: 'kotlin',
          title: `${file.package} · ${symbol.kind}`,
          code: symbol.signature,
        },
      ]
      const reviewed = alpha8Contracts[symbol.id]
      if (reviewed) blocks.push({ kind: 'text', text: reviewed[language] })
      else if (previous) blocks.push(...previous.blocks.filter((b) => b.kind !== 'code'))
      else {
        // Constructor properties / enum entries were previously contained in the
        // owner's signature. Link to that same historical contract rather than
        // importing the semantics of a similarly named 0.9 member.
        assert(
          symbol.owner && ['val', 'var', 'enum-entry'].includes(symbol.kind),
          `Unreviewed new API: ${symbol.id}`,
        )
        const parent = file.symbols.find(
          (s) =>
            [s.owner, s.name].filter(Boolean).join('.') === symbol.owner &&
            ['class', 'object', 'interface'].includes(s.kind),
        )
        assert(parent, `Missing owner for ${symbol.id}`)
        blocks.push({
          kind: 'links',
          items: [
            {
              label: t(`Contrat du type ${symbol.owner}`, `${symbol.owner} type contract`),
              to: `/${file.slug}#${parent.anchor}`,
            },
          ],
        })
      }
      if (symbol.defaultNotes?.includes('model-title'))
        blocks.push({
          kind: 'note',
          title: t('Valeur par défaut', 'Default value'),
          text: t(
            'Le nom constructible utilise par défaut le titre du modèle.',
            'The construction name defaults to the model title.',
          ),
        })
      sections.push({
        id: symbol.anchor,
        title: symbol.owner ? `${symbol.owner}.${symbol.name}` : symbol.name,
        blocks,
      })
    }
    // An alpha.3 qualification note is not a statement about the released alpha.8.
    if (file.file === 'ToolContext.kt') {
      for (const section of sections.filter((s) => s.id === 'contrat-outil'))
        for (const block of section.blocks)
          if (block.kind === 'note')
            block.text = t(
              'Ces API de construction restent expérimentales. Utilisez le SDK du jeu et le kit 0.8.0-alpha.8 ensemble et contrôlez le résultat de chaque opération.',
              'These construction APIs remain experimental. Use the game SDK and kit 0.8.0-alpha.8 together and check every operation result.',
            )
    }
    article.sections = sections
    if (!oldArticle)
      local.articles.splice(
        local.articles.findIndex((a) => a.slug === 'reference/signalmodel'),
        0,
        article,
      )
  }
  const index = local.articles.find((a) => a.slug === 'reference')
  for (const section of index.sections) {
    if (section.id === 'mod' || section.id === 'outil') {
      const runtime = section.id === 'mod' ? 'Kotlin/Native' : 'Kotlin/JVM'
      const links = section.blocks.find((b) => b.kind === 'links')
      links.items = api.files
        .filter((f) => f.runtime === runtime)
        .map((file) => {
          const article = local.articles.find((a) => a.slug === file.slug)
          return { label: `${article.title} — ${article.description}`, to: '/' + article.slug }
        })
    }
    if (section.id === 'couverture')
      section.blocks[0] = {
        kind: 'text',
        text: t(
          `${api.files.length} fichiers publics Kotlin et ${symbols.size} déclarations sont vérifiés contre le SDK ${sdkVersion}, y compris les propriétés de constructeur et valeurs d’enums. Les implémentations internes ne sont pas des API pour les mods.`,
          `${api.files.length} public Kotlin files and ${symbols.size} declarations are verified against SDK ${sdkVersion}, including constructor properties and enum values. Internal implementations are not mod APIs.`,
        ),
      }
  }
}
const { updateGuides } = loadContent('app/content/editions/0.8-guides.ts')
snapshot = updateGuides(snapshot)
assert(
  !serialize(snapshot.locales).includes('0.8.0-alpha.3'),
  'An old version remains in reader content',
)

const directory = resolve('app/content/editions')
const registry = JSON.parse(readFileSync(resolve(directory, 'registry.json'), 'utf8'))
const entry = registry.editions.find((e) => e.id === '0.8')
verifySnapshot(entry, readFileSync(resolve(directory, '0.8.json'), 'utf8'))
assert(entry.archived && ['0.8.0-alpha.3', sdkVersion].includes(entry.sdkVersion))
const currentPath = resolve(directory, registry.current + '.json')
const currentHash = digest(readFileSync(currentPath))
const snapshotText = serialize(snapshot)
if (args.includes('--check')) {
  assert.equal(
    readFileSync(resolve(directory, '0.8-api.json'), 'utf8'),
    apiText,
    '0.8 API is stale',
  )
  assert.equal(
    readFileSync(resolve(directory, '0.8.json'), 'utf8'),
    snapshotText,
    '0.8 guides are stale',
  )
} else {
  writeFileSync(resolve(directory, '0.8-api.json'), apiText)
  writeFileSync(resolve(directory, '0.8.json'), snapshotText)
  entry.sdkVersion = sdkVersion
  entry.sha256 = digest(snapshotText)
  writeFileSync(resolve(directory, 'registry.json'), serialize(registry))
}
assert.equal(digest(readFileSync(currentPath)), currentHash, 'The current edition must not change')
console.log(
  `${args.includes('--check') ? 'Verified' : 'Updated'} 0.8: ${sdkVersion}, ${files.length} sources, ${symbols.size} declarations, ${snapshot.locales.fr.articles.length} bilingual articles. Current ${registry.current} unchanged. Nothing published.`,
)
