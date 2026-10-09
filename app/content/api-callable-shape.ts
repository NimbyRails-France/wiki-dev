/** Reads the public signature, never a Kotlin implementation or an inferred unit.
 * Nested generics, function types and quoted defaults must remain one argument. */
export interface CallableParameter {
  name: string
  type: string
  defaultValue?: string
  vararg: boolean
}
export interface CallableShape {
  parameters: CallableParameter[]
  returnType: string
  constructor: boolean
}
function boundaries(value: string, delimiter: string): number[] {
  const found: number[] = []
  let round = 0,
    square = 0,
    angle = 0,
    brace = 0,
    quote = '',
    escaped = false
  for (let i = 0; i < value.length; i++) {
    const c = value[i]!
    if (quote) {
      if (escaped) escaped = false
      else if (c === '\\') escaped = true
      else if (c === quote) quote = ''
      continue
    }
    if (c === '"' || c === "'") {
      quote = c
      continue
    }
    if (c === delimiter && !round && !square && !angle && !brace) found.push(i)
    if (c === '(') round++
    if (c === ')') round--
    if (c === '[') square++
    if (c === ']') square--
    if (c === '{') brace++
    if (c === '}') brace--
    if (c === '<') angle++
    if (c === '>' && value[i - 1] !== '-' && angle) angle--
  }
  return found
}
export function callableShape(symbol: {
  kind: string
  name: string
  owner?: string
  signature: string
}): CallableShape | null {
  if (symbol.kind !== 'fun' && symbol.kind !== 'class') return null
  // Enum constructors are not callable by a mod author.
  if (/\benum\s+class\b/.test(symbol.signature)) return null
  const open = symbol.signature.indexOf('(')
  if (open < 0) return null
  let depth = 1,
    close = open + 1,
    quote = '',
    escaped = false
  for (; close < symbol.signature.length && depth; close++) {
    const c = symbol.signature[close]!
    if (quote) {
      if (escaped) escaped = false
      else if (c === '\\') escaped = true
      else if (c === quote) quote = ''
    } else if (c === '"' || c === "'") quote = c
    else if (c === '(') depth++
    else if (c === ')') depth--
  }
  if (depth) throw new Error(`Unclosed public signature: ${symbol.signature}`)
  const raw = symbol.signature.slice(open + 1, close - 1)
  const cuts = [-1, ...boundaries(raw, ','), raw.length]
  const parameters = cuts
    .slice(1)
    .map((end, index) => raw.slice(cuts[index]! + 1, end).trim())
    .filter(Boolean)
    .map((part) => {
      const colon = boundaries(part, ':')[0]
      if (colon === undefined) throw new Error(`Unnamed public parameter: ${part}`)
      const before = part.slice(0, colon).trim()
      const name = before.match(/([A-Za-z_]\w*)$/)?.[1]
      if (!name) throw new Error(`Invalid public parameter: ${part}`)
      const after = part.slice(colon + 1).trim()
      const equals = boundaries(after, '=')[0]
      return {
        name,
        type: (equals === undefined ? after : after.slice(0, equals)).trim(),
        ...(equals === undefined ? {} : { defaultValue: after.slice(equals + 1).trim() }),
        vararg: /\bvararg\b/.test(before),
      }
    })
  return {
    parameters,
    returnType:
      symbol.kind === 'class'
        ? symbol.owner
          ? `${symbol.owner}.${symbol.name}`
          : symbol.name
        : symbol.signature.slice(close).trim().replace(/^:\s*/, ''),
    constructor: symbol.kind === 'class',
  }
}
