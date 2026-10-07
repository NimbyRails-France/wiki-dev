import { createHash } from 'node:crypto'
import { maskKotlin } from './kotlin-api.mjs'

export const runtimeId = (runtime) => {
  if (runtime === 'Kotlin/Native') return 'native'
  if (runtime === 'Kotlin/JVM') return 'jvm'
  throw new Error(`Unknown API runtime: ${runtime}`)
}
export const fileIdentity = (file) =>
  `${runtimeId(file.runtime)}:${file.package}:${file.file.replace(/\.kt$/, '')}`

function parameterTypes(signature) {
  const masked = maskKotlin(signature),
    open = masked.indexOf('(')
  if (open < 0) return []
  let from = open + 1,
    depth = 0,
    generic = 0
  const types = []
  const append = (end) => {
    let value = masked.slice(from, end).trim()
    // Defaults do not distinguish overloads. Only a top-level equals is a default.
    let round = 0,
      angle = 0
    for (let i = 0; i < value.length; i++) {
      if ('([{'.includes(value[i])) round++
      if (')]}'.includes(value[i])) round--
      if (value[i] === '<') angle++
      if (value[i] === '>' && value[i - 1] !== '-') angle--
      if (value[i] === '=' && round === 0 && angle === 0) {
        value = value.slice(0, i)
        break
      }
    }
    if (value) types.push(value.slice(value.indexOf(':') + 1).replace(/\s+/g, ''))
  }
  for (let i = from; i < masked.length; i++) {
    const c = masked[i]
    if (c === ')' && depth === 0) {
      append(i)
      break
    }
    if ('([{'.includes(c)) depth++
    if (')]}'.includes(c)) depth--
    if (c === '<') generic++
    if (c === '>' && masked[i - 1] !== '-') generic--
    if (c === ',' && depth === 0 && generic === 0) {
      append(i)
      from = i + 1
    }
  }
  return types
}

export function symbolKey(symbol) {
  let name = [symbol.owner, symbol.name].filter(Boolean).join('.')
  if (symbol.kind === 'fun') {
    const prefix = symbol.signature.slice(0, symbol.signature.indexOf('('))
    const receiver = prefix.match(/([\w.<>?]+)\.[\w]+\s*$/)?.[1]
    if (receiver) name = [symbol.owner, receiver, symbol.name].filter(Boolean).join('.')
    name += `(${parameterTypes(symbol.signature).join(',')})`
  }
  return `${symbol.kind}:${name}`
}

export function catalogue(files, legacy = []) {
  const previous = new Map(legacy.map((file) => [file.id, file]))
  const fileIds = new Set(),
    symbolIds = new Set(),
    routes = new Set()
  const result = files.map((file) => {
    const id = fileIdentity(file),
      old = previous.get(id)
    const slug =
      old?.slug ||
      `reference/${runtimeId(file.runtime)}/${file.package}/${file.file.replace(/\.kt$/, '').toLowerCase()}`
    if (fileIds.has(id) || routes.has(slug))
      throw new Error(`Duplicate API file/route: ${id} / ${slug}`)
    fileIds.add(id)
    routes.add(slug)
    const oldSymbols = new Map(
      (old?.symbols || []).map((symbol) => [symbol.currentKey || symbol.key, symbol.anchor]),
    )
    const symbols = file.symbols.map((symbol) => {
      const key = symbolKey(symbol),
        symbolId = `${runtimeId(file.runtime)}:${file.package}:${key}`
      if (symbolIds.has(symbolId)) throw new Error(`Duplicate API symbol: ${symbolId}`)
      symbolIds.add(symbolId)
      const label = [symbol.owner, symbol.name]
        .filter(Boolean)
        .join('-')
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
      const anchor =
        oldSymbols.get(key) ||
        `api-${label}-${createHash('sha256').update(symbolId).digest('hex').slice(0, 10)}`
      return { ...symbol, id: symbolId, key, anchor }
    })
    return { ...file, id, slug, symbols }
  })
  const exports = result.flatMap((file) =>
    file.symbols
      .filter((symbol) => !symbol.owner)
      .map((symbol) => ({
        runtime: file.runtime,
        package: file.package,
        name: symbol.name,
        import: `${file.package}.${symbol.name}`,
        symbolId: symbol.id,
        to: `/${file.slug}#${symbol.anchor}`,
      })),
  )
  return { files: result, exports }
}
