import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { loadContent } from './content-loader.mjs'

// Stage exactly the three files readers copy, including translated Gradle
// comments. The general snippet exporter intentionally only handles .kt files.
const wiki = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const [destination, requestedLocales] = process.argv.slice(2)
if (!destination || !requestedLocales) throw new Error('Expected output directory and locale list')
const locales = requestedLocales.split(',')
if (locales.some((locale) => !['fr', 'en'].includes(locale))) throw new Error('Unsupported locale')
const { englishCode } = loadContent(resolve(wiki, 'app/content/localization.ts'))
const files = [
  ['jvm-project/settings.gradle.kts', 'settings.gradle.kts'],
  ['jvm-project/build.gradle.kts', 'build.gradle.kts'],
  ['jvm/TrainDashboard.kt', 'src/main/kotlin/TrainDashboard.kt'],
]
const manifest = { projects: [] }
for (const locale of [...new Set(locales)]) {
  const directory = resolve(destination, 'application-' + locale)
  const project = { locale, directory, sources: [] }
  for (const [source, target] of files) {
    const raw = readFileSync(resolve(wiki, 'app/content/snippets', source), 'utf8')
    const code = locale === 'en' ? englishCode(raw) : raw
    const file = resolve(directory, target)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, code)
    project.sources.push({ source, target, sha256: createHash('sha256').update(code).digest('hex') })
  }
  manifest.projects.push(project)
}
mkdirSync(destination, { recursive: true })
writeFileSync(resolve(destination, 'projects.json'), JSON.stringify(manifest, null, 2) + '\n')
