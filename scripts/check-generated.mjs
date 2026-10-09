import { readFile, readdir } from 'node:fs/promises'
import { resolve, relative } from 'node:path'
import assert from 'node:assert/strict'
import { loadContent } from './content-loader.mjs'

const { resolveWikiRoute } = loadContent('app/content/editions.ts')

const root = resolve('.output/public')
async function walk(path) {
  const entries = await readdir(path, { withFileTypes: true })
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory() ? walk(resolve(path, entry.name)) : resolve(path, entry.name),
      ),
    )
  ).flat()
}
const outputFiles = await walk(root)
// dist is a Nuxt link to this public directory. Keep local compilation outputs
// and logs in .validation, never in the archive served to visitors.
for (const file of outputFiles)
  assert(
    !/\.(?:log|exe|dll|klib|jar|kt|kts|zip)$/i.test(file),
    `Artefact local dans le site public : ${file}`,
  )
const files = outputFiles.filter((p) => p.endsWith('.html'))
const documents = new Map(
  await Promise.all(files.map(async (file) => [file, await readFile(file, 'utf8')])),
)
let links = 0
for (const [file, html] of documents) {
  if (file === resolve(root, '200.html') || file === resolve(root, '404.html')) continue
  const english =
    file.startsWith(resolve(root, 'en') + '/') || file.startsWith(resolve(root, 'en') + '\\')
  assert.match(html, new RegExp('<html[^>]+lang="' + (english ? 'en' : 'fr') + '"'), file)
  assert.match(html, /hreflang="en"/, file)
  assert.match(html, /hreflang="fr"/, file)
  assert.match(html, /<h1\b/, file)
  const route =
    '/' +
    relative(root, file)
      .replaceAll('\\', '/')
      .replace(/(?:\/)?index\.html$/, '')
  const location = resolveWikiRoute(route)
  assert(location.exists, `Generated route absent from edition registry: ${route}`)
  const canonical = 'https://wiki-dev.nimbyrails-france.fr' + location.canonical
  assert(
    html.includes(`rel="canonical" href="${canonical}"`),
    `Incorrect canonical: ${route} → ${canonical}`,
  )
  for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="([^" ]+)"/g)) {
    if (
      (!href.startsWith('/') && !href.startsWith('#')) ||
      href.startsWith('//') ||
      href.startsWith('/_nuxt/') ||
      href === '/favicon.svg'
    )
      continue
    const [path, hash] = href.split('#')
    if (path) {
      const linked = resolveWikiRoute(path)
      assert(linked.versioned, `Unversioned internal link: ${route} → ${href}`)
      assert.equal(
        linked.edition,
        location.edition,
        `Unexpected edition switch: ${route} → ${href}`,
      )
    }
    const target = path ? resolve(root, '.' + path, 'index.html') : file
    const targetHtml = documents.get(target)
    assert(targetHtml, `Lien interne absent : ${file} → ${href}`)
    if (hash) assert(targetHtml.includes(`id="${hash}"`), `Ancre absente : ${file} → ${href}`)
    links++
  }
}
console.log(`${files.length - 2} pages HTML et ${links} liens/ancres internes vérifiés.`)
