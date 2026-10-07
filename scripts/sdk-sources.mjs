import { readFile, readdir } from 'node:fs/promises'
import { resolve, relative, basename } from 'node:path'
import { createHash } from 'node:crypto'
import { declarations, maskKotlin } from './kotlin-api.mjs'

export const sdkScopes = [
  {
    directory: 'kotlin/src/nimby',
    runtime: 'Kotlin/Native',
    package: 'nimby',
    excludedPackages: ['nimby.internal'],
  },
  {
    directory: 'kotlin-client/src/main/kotlin/fr/nimby/sdk',
    runtime: 'Kotlin/JVM',
    package: 'fr.nimby.sdk',
    excludedPackages: ['fr.nimby.sdk.internal'],
  },
]

// Enumerate subpackages too: adding a public source below the root must make
// api:check fail until its signatures and explanations have been reviewed.
async function kotlinFiles(directory) {
  const result = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isSymbolicLink()) throw new Error(`SDK source symlink is not supported: ${path}`)
    if (entry.isDirectory()) result.push(...(await kotlinFiles(path)))
    else if (entry.isFile() && entry.name.endsWith('.kt')) result.push(path)
  }
  return result.sort()
}

export async function readSdkSources(sdk, scopes = sdkScopes) {
  const files = [],
    inventory = []
  for (const scope of scopes) {
    for (const path of await kotlinFiles(resolve(sdk, scope.directory))) {
      const source = (await readFile(path, 'utf8')).replace(/\r\n/g, '\n')
      const sourcePath = relative(sdk, path).replaceAll('\\', '/')
      const sha256 = createHash('sha256').update(source).digest('hex')
      const actualPackage = maskKotlin(source).match(/^\s*package\s+([\w.]+)/m)?.[1]
      const internalNamespace = (scope.excludedPackages || []).some(
        (prefix) => actualPackage === prefix || actualPackage?.startsWith(prefix + '.'),
      )
      // Internal namespaces are inventoried without applying public-contract
      // inference rules to their implementation expressions.
      const symbols = internalNamespace ? [] : declarations(source)
      // Kotlin implementation helpers sometimes have public members inside a
      // deliberately internal namespace. Inventory them, but do not advertise
      // them as a supported mod-author API.
      inventory.push({
        path: sourcePath,
        runtime: scope.runtime,
        package: actualPackage,
        sha256,
        declarations: internalNamespace ? null : symbols.length,
        exclusion: internalNamespace
          ? 'internal-namespace'
          : !symbols.length
            ? 'no-public-declarations'
            : null,
      })
      if (internalNamespace || !symbols.length) continue
      if (actualPackage !== scope.package && !actualPackage?.startsWith(scope.package + '.'))
        throw new Error(`Unexpected public package in ${sourcePath}: ${actualPackage}`)
      const signatures = symbols.map((symbol) => symbol.signature).join('\n')
      const imports = [...source.matchAll(/^import\s+([\w.]+)(?:\s+as\s+(\w+))?\s*$/gm)]
        .filter(
          ([, imported, alias]) =>
            /^(?:java|kotlin)\./.test(imported) &&
            new RegExp(`\\b${alias || imported.split('.').at(-1)}\\b`).test(signatures),
        )
        .map(([, imported, alias]) => (alias ? `${imported} as ${alias}` : imported))
      files.push({
        file: basename(path),
        path: sourcePath,
        runtime: scope.runtime,
        package: actualPackage,
        imports,
        sha256,
        symbols,
      })
    }
  }
  return { files, inventory }
}
