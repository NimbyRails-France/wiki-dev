import { readFileSync } from 'node:fs'
import { resolve, posix } from 'node:path'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import vm from 'node:vm'
import ts from 'typescript'
import { loadContent } from './content-loader.mjs'

export const digest = (value) => createHash('sha256').update(value).digest('hex')
export const serialize = (value) => JSON.stringify(value, null, 2) + '\n'

// Read an entire historical module graph from one Git commit. Never mix its
// articles or translations with files in the current working tree.
export function historicalSource(commit, cwd = process.cwd()) {
  const source = (path) =>
    execFileSync('git', ['show', `${commit}:${path}`], {
      cwd,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    })
  const cache = new Map()
  function load(path) {
    if (cache.has(path)) return cache.get(path).exports
    const module = { exports: {} }
    cache.set(path, module)
    const require = (id) => {
      if (!id.startsWith('.')) throw new Error(`Unexpected historical dependency: ${id}`)
      const target = posix.normalize(posix.join(posix.dirname(path), id.replace(/\?raw$/, '')))
      if (id.endsWith('?raw')) return source(target)
      if (id.endsWith('.json')) return JSON.parse(source(target))
      return load(target.endsWith('.ts') ? target : target + '.ts')
    }
    const { outputText } = ts.transpileModule(source(path), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    })
    vm.runInNewContext(outputText, { module, exports: module.exports, require }, { filename: path })
    return module.exports
  }
  return { source, load }
}

export function captureEdition(id, { commit, sdkCommit } = {}) {
  const historical = commit && historicalSource(commit)
  const source = historical ? historical.source : (path) => readFileSync(resolve(path), 'utf8')
  const localization = historical
    ? historical.load('app/content/localization.ts')
    : loadContent('app/content/localization.ts')
  const catalogueText = source('app/content/generated/api.json')
  const catalogue = JSON.parse(catalogueText)
  if (!catalogue.sdkVersion.startsWith(id + '.'))
    throw new Error(`Edition ${id} does not match SDK ${catalogue.sdkVersion}`)
  return {
    schema: 1,
    id,
    sdkVersion: catalogue.sdkVersion,
    provenance: {
      ...(commit ? { wikiCommit: commit } : { source: 'authoring modules in this repository' }),
      ...(sdkCommit ? { sdkCommit } : {}),
      catalogueSha256: digest(catalogueText),
      files: catalogue.files.map(({ path, sha256 }) => ({ path, sha256 })),
    },
    locales: Object.fromEntries(
      ['fr', 'en'].map((locale) => [
        locale,
        { groups: localization.groupsFor(locale), articles: localization.articlesFor(locale) },
      ]),
    ),
  }
}

export function verifySnapshot(entry, text) {
  if (digest(text) !== entry.sha256) throw new Error(`Snapshot ${entry.id}: SHA-256 mismatch`)
  const data = JSON.parse(text)
  if (data.schema !== 1 || data.id !== entry.id || data.sdkVersion !== entry.sdkVersion)
    throw new Error(`Snapshot ${entry.id}: incompatible metadata`)
  for (const locale of ['fr', 'en']) {
    if (!data.locales[locale]?.articles?.length)
      throw new Error(`Snapshot ${entry.id}: missing ${locale} content`)
  }
  return data
}
