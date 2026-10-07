import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { loadContent } from '../scripts/content-loader.mjs'

test('raw snippets have identical snapshot content after Windows or Linux checkout', (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'nrf-wiki-content-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const expected = '// Example\n\nval answer = 42\n'
  writeFileSync(join(directory, 'windows.kt'), expected.replaceAll('\n', '\r\n'))
  writeFileSync(join(directory, 'linux.kt'), expected)
  writeFileSync(
    join(directory, 'entry.ts'),
    "export { default as windows } from './windows.kt?raw'\n" +
      "export { default as linux } from './linux.kt?raw'\n",
  )
  const content = loadContent(join(directory, 'entry.ts'))
  assert.equal(content.windows, expected)
  assert.equal(content.linux, expected)
})
