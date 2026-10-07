import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { catalogue } from './api-catalogue.mjs'
import { readSdkSources } from './sdk-sources.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sdkArg = process.argv.indexOf('--sdk')
const sdk = resolve(sdkArg >= 0 ? process.argv[sdkArg + 1] : resolve(root, '../sdk'))
const { files } = await readSdkSources(sdk)
const legacy = JSON.parse(await readFile(resolve(root, 'scripts/api-legacy.json'), 'utf8'))
const result = {
  sdkVersion: (await readFile(resolve(sdk, 'VERSION'), 'utf8')).trim(),
  ...catalogue(files, legacy),
}
const destination = resolve(root, 'app/content/generated/api.json')
const encoded = JSON.stringify(result, null, 2) + '\n'
if (process.argv.includes('--check')) {
  if ((await readFile(destination, 'utf8')) !== encoded)
    throw new Error('Référence désynchronisée : lancer npm run api:sync puis relire le diff.')
  console.log('Référence identique aux sources Kotlin.')
} else {
  await mkdir(dirname(destination), { recursive: true })
  await writeFile(destination, encoded)
  console.log(
    `${files.length} fichiers publics, ${files.reduce((n, f) => n + f.symbols.length, 0)} déclarations synchronisées.`,
  )
}
