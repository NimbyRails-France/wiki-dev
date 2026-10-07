import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { readSdkSources } from '../scripts/sdk-sources.mjs'
import { catalogue } from '../scripts/api-catalogue.mjs'

test('source coverage includes public subpackages, records internal files and rejects a foreign package', async () => {
  const root = await mkdtemp(join(tmpdir(), 'nrf-wiki-sources-'))
  try {
    await mkdir(join(root, 'src', 'services'), { recursive: true })
    await mkdir(join(root, 'src', 'internal'), { recursive: true })
    await writeFile(
      join(root, 'src', 'Types.kt'),
      'package nimby\ndata class Id(val value: Long)\n',
    )
    await writeFile(join(root, 'src', 'Hidden.kt'), 'package nimby\ninternal class Hidden\n')
    await writeFile(
      join(root, 'src', 'internal', 'Helpers.kt'),
      'package nimby.internal\nclass Helper { fun decode() = privateImplementation() }\n',
    )
    const nested = join(root, 'src', 'services', 'Types.kt')
    await writeFile(nested, 'package nimby.services\nclass Service\n')
    const scopes = [
      {
        directory: 'src',
        package: 'nimby',
        runtime: 'Kotlin/Native',
        excludedPackages: ['nimby.internal'],
      },
    ]
    const { files, inventory } = await readSdkSources(root, scopes)
    assert.equal(inventory.length, 4)
    assert.equal(inventory.find((entry) => entry.path === 'src/Hidden.kt').declarations, 0)
    assert.equal(
      inventory.find((entry) => entry.path === 'src/internal/Helpers.kt').exclusion,
      'internal-namespace',
    )
    assert.equal(inventory.find((entry) => entry.path === 'src/internal/Helpers.kt').declarations, null)
    assert.equal(files.length, 2)
    assert(
      files.some(
        (file) => file.package === 'nimby.services' && file.path === 'src/services/Types.kt',
      ),
    )
    const result = catalogue(files)
    assert.equal(new Set(result.files.map((file) => file.slug)).size, 2)
    assert(result.exports.some((item) => item.import === 'nimby.services.Service'))
    await writeFile(nested, 'package unrelated\nclass Service\n')
    await assert.rejects(readSdkSources(root, scopes), /Unexpected public package/)
  } finally {
    // The only recursive cleanup targets this test's freshly created temp dir.
    assert(root.startsWith(join(tmpdir(), 'nrf-wiki-sources-')))
    await rm(root, { recursive: true, force: true })
  }
})
