/** Small declaration reader for this SDK's Kotlin sources. It deliberately
 * excludes method bodies and private/internal scopes. Not a Kotlin compiler:
 * compilation of the API and examples remains a separate required check. */
export function maskKotlin(source) {
  return source.replace(
    /\/\*[\s\S]*?\*\/|\/\/[^\n]*|"""[\s\S]*?"""|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,
    (value) => value.replace(/[^\n]/g, ' '),
  )
}

// These inferred public types are checked against their declarations and tests.
// A new non-literal inference must be reviewed, never replaced with its body.
const inferredTypes = {
  'AutomaticDriving.clear': 'DrivingRule',
  'AutomaticDriving.stop': 'DrivingRule',
  'SignallingMod.plan': 'DrivingPlan',
  'ToolMod.onTick': 'Unit',
  'ToolMod.onStop': 'Unit',
  'SignalContext.signal': 'Signal',
  'SignalModBuilder.signal': 'Unit',
  'SignalModelBuilder.observeApproach': 'Boolean',
  'SignalModelBuilder.approachBlocks': 'Int',
  ...Object.fromEntries(
    [
      'renew',
      'forceSignal',
      'restoreSignal',
      'setSetting',
      'restoreSetting',
      'constrainTrain',
      'restoreTrain',
      'readSignal',
      'readTrain',
      'clear',
    ].map((name) => [`ModControlSession.${name}`, 'ControlResponse']),
  ),
}

function stripAnnotations(header) {
  // An annotation and the declaration can share a line. Removing that whole
  // line used to drop the name and initial parameters of multiline functions.
  let value = header.trim()
  while (value.startsWith('@')) {
    const annotation = /^@[\w.]+/.exec(value)
    if (!annotation) break
    let end = annotation[0].length
    if (value[end] === '(') {
      const masked = maskKotlin(value)
      let depth = 1
      for (end++; end < value.length && depth; end++) {
        if (masked[end] === '(') depth++
        if (masked[end] === ')') depth--
      }
    }
    value = value.slice(end).trimStart()
  }
  return value
}

function publicParameters(params) {
  const masked = maskKotlin(params),
    result = []
  let from = 0,
    nested = 0,
    generic = 0
  for (let i = 0; i <= params.length; i++) {
    const c = masked[i]
    if (c === '(' || c === '[' || c === '{') nested++
    if (c === ')' || c === ']' || c === '}') nested--
    if (c === '<') generic++
    if (c === '>' && masked[i - 1] !== '-' && generic > 0) generic--
    if (i === params.length || (c === ',' && nested === 0 && generic === 0)) {
      const raw = params.slice(from, i).trim()
      const doc =
        raw
          .match(/^\/\*\*([\s\S]*?)\*\//)?.[1]
          ?.replace(/^\s*\* ?/gm, '')
          .trim() || ''
      const param = raw.replace(/\/\*[\s\S]*?\*\//g, '').trim()
      const property = /^(?:(?:public|override)\s+)*(val|var)\s+(\w+)\s*:/.exec(param)
      if (property)
        result.push({ name: property[2], kind: property[1], signature: param, documentation: doc })
      from = i + 1
    }
  }
  return result
}

function classSignature(header) {
  // Constructor parameters remain callable even when their backing property
  // is private. Show the parameter, not a fictitious public property.
  let value = header
  const masked = maskKotlin(value)
  const removals = [...masked.matchAll(/\b(?:private|internal|protected)\s+(?:val|var)\s+/g)]
  for (const match of removals.reverse())
    value = value.slice(0, match.index) + value.slice(match.index + match[0].length)
  // A superclass's initializer is implementation, not part of its public type.
  const mask = maskKotlin(value)
  let round = 0,
    angle = 0,
    parentStart = -1
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] === '(') round++
    if (mask[i] === ')') round--
    if (mask[i] === '<') angle++
    if (mask[i] === '>' && mask[i - 1] !== '-') angle--
    if (mask[i] === ':' && round === 0 && angle === 0) {
      parentStart = i
      break
    }
  }
  if (parentStart < 0) return value
  const ranges = []
  angle = 0
  for (let i = parentStart + 1; i < mask.length; i++) {
    if (mask[i] === '<') angle++
    if (mask[i] === '>' && mask[i - 1] !== '-') angle--
    if (mask[i] === '(' && angle === 0) {
      const from = i
      let depth = 1
      for (i++; i < mask.length && depth; i++) {
        if (mask[i] === '(') depth++
        if (mask[i] === ')') depth--
      }
      ranges.push([from, i])
      i--
    }
  }
  for (const [from, to] of ranges.reverse()) value = value.slice(0, from) + value.slice(to)
  return value
}

export function declarations(source) {
  source = source.replace(/\r\n/g, '\n')
  const mask = maskKotlin(source)
  const pairs = new Map(),
    stack = [],
    containers = new Map()
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] === '{') stack.push(i)
    if (mask[i] === '}') {
      const open = stack.pop()
      if (open !== undefined) pairs.set(open, i)
    }
  }
  const pattern =
    /^[ \t]*(?:@[\w.]+(?:\([^\n]*\))?[ \t]*)*((?:(?:public|private|internal|protected|abstract|open|override|data|enum|annotation|sealed|inline|suspend|operator|infix|tailrec|external|actual|expect|const|lateinit|companion)\s+)*)(class|object|interface|fun|val|var|typealias)\s+([^\n]*)/gm
  const records = [],
    headers = []
  for (const match of mask.matchAll(pattern)) {
    const start = match.index
    // Constructor properties are already present in the enclosing signature.
    // In particular, do not leak properties of an internal data class.
    if (headers.some(([begin, end]) => begin < start && start < end)) continue
    const modifiers = match[1].trim().split(/\s+/)
    const kind = match[2]
    const enclosing = [...containers.values()].filter((c) => c.open < start && start < c.close)
    // A declaration inside a function, lambda, initializer, or hidden type is
    // not public API. Public class and companion object bodies are allowed.
    const braceParents = [...pairs].filter(([open, close]) => open < start && start < close)
    const visible =
      !modifiers.some((m) => ['private', 'internal', 'protected'].includes(m)) &&
      braceParents.every(([open]) => containers.get(open)?.visible)
    let at = start + match[0].indexOf(kind),
      round = 0,
      square = 0,
      end = at,
      body = null
    for (; end < mask.length; end++) {
      const c = mask[end]
      if (c === '(') round++
      if (c === ')') round--
      if (c === '[') square++
      if (c === ']') square--
      if (round === 0 && square === 0) {
        if (c === '{') {
          body = end
          break
        }
        if (c === '=' || c === ';' || c === '\n') break
      }
    }
    const header = stripAnnotations(source.slice(start, end))
    // Function type parameters may precede a function name.
    const rest = mask.slice(at + kind.length, end).trim()
    const name =
      kind === 'fun'
        ? rest
            .split('(')[0]
            .trim()
            .match(/([\w]+)$/)?.[1]
        : rest.match(/^[\w]+/)?.[0]
    if (['class', 'object', 'interface'].includes(kind) && body !== null) {
      containers.set(body, {
        open: body,
        close: pairs.get(body) ?? mask.length,
        name: name || 'Companion',
        visible,
      })
    }
    if (['class', 'object', 'interface'].includes(kind)) headers.push([start, end])
    if (!visible || !name) continue
    const prefix = source.slice(0, start)
    const docStart = prefix.lastIndexOf('/**')
    const docEnd = docStart < 0 ? -1 : prefix.indexOf('*/', docStart)
    // An annotated *previous declaration* is not an annotation on this one.
    // The old greedy line regexp incorrectly copied its KDoc to the next method.
    const kdoc =
      docEnd >= 0 && stripAnnotations(prefix.slice(docEnd + 2)).trim() === ''
        ? prefix
            .slice(docStart + 3, docEnd)
            .replace(/^\s*\* ?/gm, '')
            .trim()
        : ''
    let signature = header
    let constructorProperties = []
    // An internal constructor is not an invitation to provide native handles
    // or callbacks. Keep its public properties as members, hide transport args.
    const hiddenConstructor =
      kind === 'class' && /\b(private|internal|protected)\s+constructor\s*\(/.exec(header)
    if (hiddenConstructor) {
      const headerMask = maskKotlin(header)
      const open = header.indexOf('(', hiddenConstructor.index)
      let close = open + 1,
        depth = 1
      for (; close < headerMask.length && depth; close++) {
        if (headerMask[close] === '(') depth++
        if (headerMask[close] === ')') depth--
      }
      const params = header.slice(open + 1, close - 1)
      constructorProperties = publicParameters(params)
      // Constructor annotations belong to the hidden constructor, not the type.
      signature =
        header
          .slice(0, hiddenConstructor.index)
          .replace(/(?:\s+@[\w.]+(?:\([^\n]*?\))?)+\s*$/, '')
          .trim() + header.slice(close)
    }
    if (kind === 'class' && !hiddenConstructor) {
      const open = header.indexOf('(')
      if (open >= 0) {
        const masked = maskKotlin(header)
        let close = open + 1,
          depth = 1
        for (; close < masked.length && depth; close++) {
          if (masked[close] === '(') depth++
          if (masked[close] === ')') depth--
        }
        constructorProperties = publicParameters(header.slice(open + 1, close - 1))
      }
    }
    const owner = enclosing.map((c) => c.name).join('.')
    const key = [owner, name].filter(Boolean).join('.')
    signature = signature
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\bget\(\)\s*$/, '')
      .trim()
    if (kind === 'class') signature = classSignature(signature)
    const defaultNotes = []
    if (
      key === 'SignalModelBuilder.construction' &&
      signature.includes('name: String = base.title')
    ) {
      signature = signature.replace('name: String = base.title', 'name: String = …')
      defaultNotes.push('model-title')
    }
    if (kind === 'fun' || kind === 'val' || kind === 'var') {
      const masked = maskKotlin(signature)
      let hasType = false
      if (kind === 'fun') {
        let depth = 0,
          close = -1
        for (let i = masked.indexOf('('); i < masked.length; i++) {
          if (masked[i] === '(') depth++
          if (masked[i] === ')' && --depth === 0) {
            close = i
            break
          }
        }
        hasType = close >= 0 && /^\s*:/.test(masked.slice(close + 1))
      } else hasType = /\b(?:val|var)\s+\w+\s*:/.test(masked)
      if (!hasType) {
        const expression = source
          .slice(end + 1)
          .trimStart()
          .split('\n')[0]
          .trim()
        const literalType = /^(true|false)$/.test(expression)
          ? 'Boolean'
          : /^"(?:\\.|[^"\\])*"$/.test(expression)
            ? 'String'
            : /^-?\d+L$/.test(expression)
              ? 'Long'
              : /^-?\d+$/.test(expression)
                ? 'Int'
                : undefined
        // A block-bodied function without a declared return type returns Unit,
        // even when a same-named property has a reviewed inferred value type.
        const type =
          kind === 'fun' && mask[end] !== '=' ? 'Unit' : inferredTypes[key] || literalType
        if (!type) throw new Error(`Public inferred type requires review: ${key}`)
        signature += `: ${type}`
      }
      // Literal constants/default property values are useful contracts. No
      // expression, getter body, private helper or bit manipulation is emitted.
      if (kind !== 'fun' && mask[end] === '=') {
        const value = source
          .slice(end + 1)
          .split('\n')[0]
          .trim()
        if (/^(?:true|false|-?\d+(?:\.\d+)?[LfF]?|"(?:\\.|[^"\\])*")$/.test(value))
          signature += ` = ${value}`
      }
    }
    if (kind === 'typealias' && mask[end] === '=') {
      signature +=
        ' = ' +
        source
          .slice(end + 1)
          .split('\n')[0]
          .trim()
    }
    const enumEntries = []
    if (modifiers.includes('enum') && body !== null) {
      // Only a top-level Kotlin semicolon terminates enum entries. A semicolon
      // inside KDoc (DrivingFlag.ApproachPassable), a string or an entry body
      // must never truncate the public values shown in the reference.
      let entriesEnd = pairs.get(body) ?? mask.length,
        depth = 0
      for (let i = body + 1; i < entriesEnd; i++) {
        if ('({['.includes(mask[i])) depth++
        else if (')}]'.includes(mask[i])) depth--
        else if (mask[i] === ';' && depth === 0) {
          entriesEnd = i
          break
        }
      }
      let from = body + 1
      depth = 0
      const appendEntry = (until) => {
        const raw = source.slice(from, until).trim()
        if (!raw) return
        const entryMask = maskKotlin(raw),
          entryName = entryMask.trim().match(/^(\w+)/)?.[1]
        if (!entryName) throw new Error(`Unrecognised public enum entry in ${name}`)
        const docs =
          raw
            .match(/\/\*\*([\s\S]*?)\*\//)?.[1]
            ?.replace(/^\s*\* ?/gm, '')
            .trim() || ''
        const entryBody = entryMask.indexOf('{')
        const entry = (entryBody < 0 ? raw : raw.slice(0, entryBody))
          .replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '')
          .trim()
        enumEntries.push({
          name: entryName,
          kind: 'enum-entry',
          signature: entry,
          documentation: docs,
          owner: [owner, name].filter(Boolean).join('.'),
          line: source.slice(0, from).split('\n').length,
        })
      }
      for (let i = from; i <= entriesEnd; i++) {
        if (i === entriesEnd || (mask[i] === ',' && depth === 0)) {
          appendEntry(i)
          from = i + 1
        } else if ('({['.includes(mask[i])) depth++
        else if (')}]'.includes(mask[i])) depth--
      }
      signature += ' {\n' + enumEntries.map((entry) => '    ' + entry.signature).join(',\n') + '\n}'
    }
    records.push({
      name,
      owner,
      kind,
      signature,
      defaultNotes,
      documentation: hiddenConstructor
        ? `${kdoc}\nConstruction réservée au SDK : utilisez la fonction de création ou le contexte fourni.`.trim()
        : kdoc,
      line: source.slice(0, start).split('\n').length,
    })
    for (const property of constructorProperties)
      records.push({
        ...property,
        owner: [owner, name].filter(Boolean).join('.'),
        documentation: property.documentation,
        line: source.slice(0, start).split('\n').length,
      })
    records.push(...enumEntries)
  }
  return records
}
