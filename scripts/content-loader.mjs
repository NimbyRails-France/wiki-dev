import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import ts from 'typescript'

// Local content validation uses the same TS sources and raw snippets as Nuxt.
// No generated HTML or alternative test-only article copy is involved.
export function loadContent(entry = 'app/content/index.ts') {
  const cache = new Map()
  function load(path) {
    if (cache.has(path)) return cache.get(path).exports
    const module = { exports: {} }
    cache.set(path, module)
    const require = (id) => {
      if (!id.startsWith('.')) return createRequire(path)(id)
      const target = resolve(dirname(path), id.replace(/\?raw$/, ''))
      // Git checks out LF on Linux; existing Windows files can still have CRLF.
      // A snapshot must not depend on the machine that captures it.
      if (id.endsWith('?raw')) return readFileSync(target, 'utf8').replace(/\r\n/g, '\n')
      if (id.endsWith('.json')) return JSON.parse(readFileSync(target, 'utf8'))
      return load(existsSync(target) ? target : target + '.ts')
    }
    const { outputText } = ts.transpileModule(readFileSync(path, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    })
    vm.runInNewContext(outputText, { module, exports: module.exports, require }, { filename: path })
    return module.exports
  }
  return load(resolve(entry))
}

export function readableStrings(articles) {
  const strings = new Set()
  for (const article of articles) {
    strings.add(article.title)
    strings.add(article.description)
    strings.add(article.group)
    for (const section of article.sections) {
      strings.add(section.title)
      for (const block of section.blocks) {
        if (block.title) strings.add(block.title)
        if (block.kind === 'text' || block.kind === 'note') strings.add(block.text)
        if (block.kind === 'list') block.items.forEach((text) => strings.add(text))
        if (block.kind === 'table')
          [...block.columns, ...block.rows.flat()].forEach((text) => strings.add(text))
        if (block.kind === 'links') block.items.forEach((item) => strings.add(item.label))
      }
    }
  }
  return [...strings]
}
