import { test, expect } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { readFileSync } from 'node:fs'
const currentId = JSON.parse(readFileSync('app/content/editions/registry.json', 'utf8')).current
const current = (path: string) => {
  const english = /^\/en(?:\/|$)/.test(path)
  const slug = path.replace(/^\/en(?=\/|$)/, '').replace(/^\//, '')
  return `${english ? '/en' : ''}/version/${currentId}${slug ? '/' + slug : ''}`
}

test('version selection reads independent archives and preserves valid page and language', async ({
  page,
}) => {
  await page.goto('/version/0.9/commencer/bienvenue')
  await expect(page.getByLabel('Édition de la documentation')).toHaveValue('0.9')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://wiki-dev.nimbyrails-france.fr/version/0.9/commencer/bienvenue',
  )
  await page.getByLabel('Édition de la documentation').selectOption('0.8')
  await expect(page).toHaveURL(/\/version\/0\.8\/commencer\/bienvenue$/)
  await expect(page.locator('.archive-banner')).toContainText('0.8.0-alpha.8')
  await expect(page.locator('link[hreflang="en"]')).toHaveAttribute(
    'href',
    'https://wiki-dev.nimbyrails-france.fr/en/version/0.8/commencer/bienvenue',
  )
  await page.getByRole('link', { name: 'Langue', exact: true }).click()
  await expect(page).toHaveURL(/\/en\/version\/0\.8\/commencer\/bienvenue$/)
  await page.getByRole('searchbox').fill('TrainQuery')
  await expect(
    page.getByRole('navigation', { name: 'Search results' }).getByRole('status'),
  ).toContainText('0 result')
  await page.screenshot({ path: 'test-results/wiki-archive.png', fullPage: true })
  await page.goto('/en/version/0.9/lire/trains-observations#groupes')
  await page.getByLabel('Documentation edition').selectOption('0.8')
  await expect(page).toHaveURL(/\/en\/version\/0\.8$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Documentation SDK 0.8')
  for (const route of [
    '/version/0.8/lire/trains-observations',
    '/version/0.8/maintenance/distribution',
    '/en/version/0.8/maintenance/distribution',
    '/version/9.9/commencer/bienvenue',
  ]) {
    expect((await page.goto(route))?.status()).toBe(404)
  }
})

test('legacy aliases preserve query, hash, locale and retired historical pages', async ({
  page,
}) => {
  await page.goto('/en/reference/toolcontext?from=legacy#toolcontext')
  await expect(page).toHaveURL(
    /\/en\/version\/0\.9\/reference\/toolcontext\?from=legacy#toolcontext$/,
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://wiki-dev.nimbyrails-france.fr/en/version/0.9/reference/toolcontext',
  )
  await page.goto('/maintenance/contribuer')
  await expect(page).toHaveURL(/\/version\/0\.8\/maintenance\/contribuer$/)
  await expect(page.locator('.archive-banner')).toBeVisible()
  await page.goto('/en/lire/trains#memoire')
  await expect(page).toHaveURL(/\/en\/version\/0\.8\/lire\/trains#memoire$/)
  await expect(page.locator('#memoire')).toBeVisible()
})

test('the 0.8 edition exposes alpha.8 guides and reference in both languages', async ({ page }) => {
  for (const prefix of ['', '/en']) {
    await page.goto(`${prefix}/version/0.8/reference/native/nimby/numbersetting`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('NumberSetting')
    await expect(page.locator('.archive-banner')).toContainText('0.8.0-alpha.8')
    await expect(page.locator('.archive-banner a').first()).toHaveAttribute(
      'href',
      'https://github.com/NimbyRails-France/sdk/tree/ea1ffc6ee68ffd650d1ceab5ca450ae0b8136434',
    )
    await expect(
      page.getByRole('heading', { level: 2, name: 'NumberSetting.withValue', exact: true }),
    ).toHaveCount(1)
    await page.getByRole('searchbox').fill('prepareObservedNetwork')
    await expect(page.locator('.search-results').getByRole('link').first()).toHaveAttribute(
      'href',
      new RegExp(`^${prefix}/version/0\\.8/`),
    )
    await page.goto(`${prefix}/version/0.8/mods/reglages#nombres`)
    await expect(page.locator('#nombres')).toContainText('NumberSetting')
    await expect(page.locator('#nombres pre')).toContainText('visibleWhen = "work"')
    await page.screenshot({ path: `test-results/wiki-alpha8-${prefix ? 'en' : 'fr'}.png` })
    await page.goto(`${prefix}/version/0.8/lire/construction#reglages-copies`)
    await expect(page.locator('#reglages-copies')).toContainText('reason = 7')
    await expect(page.locator('#wiki-edition')).toHaveValue('0.8')
  }
})

test('themes persist, keyboard search works and code is highlighted', async ({ page }) => {
  await page.goto(current('/commencer/premier-mod'))
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('.hljs-keyword').first()).toBeVisible()
  await page.getByRole('button', { name: 'Thème clair', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.reload()
  await expect(page.getByRole('button', { name: 'Thème clair' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.screenshot({ path: 'test-results/wiki-light.png' })
  await page.keyboard.press('Control+k')
  await expect(page.getByRole('searchbox')).toBeFocused()
  await page.getByRole('searchbox').fill('aucunresultatpossible')
  await expect(page.getByRole('status').filter({ hasText: '0 résultat' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('searchbox')).toHaveValue('')
})

// Capture the exact text a reader copies. A separate local Gradle invocation
// compiles this generated project, not a hidden replacement starter project.
test('tutorial supplies every project file without cloning an example', async ({ page }) => {
  const files = {
    '/commencer/installation': [
      'gradle.properties',
      'settings.gradle.kts',
      'build.gradle.kts',
      'mod.json',
    ],
    '/commencer/premier-mod': ['src/main/kotlin/Entry.kt', 'assets/closed.svg', 'assets/open.svg'],
    '/maintenance/tests': ['src/test/kotlin/SignalTests.kt'],
  }
  for (const locale of ['fr', 'en'])
    for (const [route, names] of Object.entries(files)) {
      await page.goto(current((locale === 'en' ? '/en' : '') + route))
      for (const name of names) {
        const content = await page
          .locator('pre')
          .filter({ has: page.locator('code') })
          .evaluateAll(
            (blocks, title) =>
              blocks.find((b) => b.getAttribute('aria-label') === title)?.textContent,
            name,
          )
        expect(content, name).toBeTruthy()
        expect(content).not.toContain('\\n')
        const path = resolve(
          locale === 'en'
            ? '.validation/tutorial-generated-project-en'
            : '.validation/tutorial-generated-project',
          name,
        )
        await mkdir(dirname(path), { recursive: true })
        await writeFile(path, content!, 'utf8')
      }
    }
})

test('navigation, full text search, code copy and unknown route', async ({ page, context }) => {
  const failures: string[] = []
  page.on('pageerror', (error) => failures.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(message.text())
  })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(current('/'))
  await expect(
    page.getByRole('heading', { name: 'Vos idées. Votre réseau. Vos mods.' }),
  ).toBeVisible()
  await page.screenshot({ path: 'test-results/wiki-desktop.png', fullPage: true })
  await page.getByRole('searchbox').fill('offsetM')
  await page
    .getByRole('navigation', { name: 'Résultats de recherche' })
    .getByRole('link', { name: 'Référence TrackMetric' })
    .click()
  await expect(
    page.getByRole('heading', { name: 'TrackMetric', exact: true, level: 1 }),
  ).toBeVisible()
  await expect(page.getByText('fraction finie dans [0, 1].', { exact: true })).toBeVisible()
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.getByRole('button', { name: 'Copier', exact: true }).first().click()
  await expect(page.getByRole('button', { name: 'Copié !', exact: true })).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('TrackMetric')
  await page.screenshot({ path: 'test-results/wiki-reference.png', fullPage: true })
  expect(failures).toEqual([])
  const response = await page.goto(current('/page-inconnue'))
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'Cette voie ne mène nulle part.' })).toBeVisible()
})

test('mobile menu, article links and no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(current('/'))
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  await expect(page.getByRole('searchbox')).toBeVisible()
  await page
    .getByRole('navigation', { name: 'Documentation', exact: true })
    .getByRole('link', { name: 'Votre premier mod' })
    .click()
  await expect(page.getByRole('heading', { name: 'Votre premier mod', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Menu', exact: true })).toHaveAttribute(
    'aria-expanded',
    'false',
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: 'test-results/wiki-mobile.png', fullPage: true })
})

test('English pages, search and language switch preserve the article and section', async ({
  page,
}) => {
  const failures: string[] = []
  page.on('pageerror', (error) => failures.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(message.text())
  })
  await page.goto(current('/en'))
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your ideas.')
  await page.getByRole('searchbox').fill('preview')
  await page
    .getByRole('navigation', { name: 'Search results' })
    .getByRole('link', { name: /ToolContext/ })
    .click()
  await expect(page).toHaveURL(/\/en\/version\/0\.9\/reference\/toolcontext$/)
  const section = page.locator('.article-section').first()
  const id = await section.getAttribute('id')
  await section.locator('h2 a').click()
  await expect(page.getByRole('link', { name: 'Language', exact: true })).toHaveAttribute(
    'href',
    current('/reference/toolcontext#' + id),
  )
  await page.getByRole('link', { name: 'Language', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  await expect(page).toHaveURL(new RegExp('/reference/toolcontext#' + id + '$'))
  await page.getByRole('link', { name: 'Langue', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('button', { name: 'Copy', exact: true }).first()).toBeVisible()
  await page.screenshot({ path: 'test-results/wiki-english.png', fullPage: true })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: 'test-results/wiki-english-viewport.png' })
  const middle = page
    .locator('.article-section')
    .nth(Math.floor((await page.locator('.article-section').count()) / 2))
  await middle.evaluate((element) => element.scrollIntoView({ block: 'start' }))
  await page.screenshot({ path: 'test-results/wiki-english-middle.png' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(current('/en/commencer/installation'))
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  await expect(page.getByRole('link', { name: 'Language', exact: true })).toBeVisible()
  expect(failures).toEqual([])
  const unknown = await page.goto(current('/en/unknown-page'))
  expect(unknown?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'This track leads nowhere.' })).toBeVisible()
})

test('train API search distinguishes Native and JVM and preserves symbol links across languages', async ({
  page,
}) => {
  await page.goto(current('/reference'))
  await page.getByRole('searchbox').fill('TrainQuery')
  const results = page.getByRole('navigation', { name: 'Résultats de recherche' })
  await expect(
    results.getByRole('link', { name: 'Référence TrainTypes · Kotlin/Native', exact: true }),
  ).toBeVisible()
  await expect(
    results.getByRole('link', { name: 'Référence TrainTypes · Kotlin/JVM', exact: true }),
  ).toBeVisible()

  for (const [path, runtime, namespace] of [
    ['/reference/native/nimby/traintypes', 'Kotlin/Native', 'nimby'],
    ['/reference/jvm/fr.nimby.sdk/traintypes', 'Kotlin/JVM', 'fr.nimby.sdk'],
  ]) {
    await page.goto(current(path))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`TrainTypes · ${runtime}`)
    await expect(
      page
        .locator('pre')
        .filter({ hasText: `import ${namespace}.TrainQuery` })
        .first(),
    ).toBeVisible()
    const heading = page.getByRole('heading', { level: 2, name: 'TrainQuery', exact: true })
    await heading.locator('a').click()
    const hash = new URL(page.url()).hash
    expect(hash.length).toBeGreaterThan(1)
    await page.getByRole('link', { name: 'Langue', exact: true }).click()
    await expect(page).toHaveURL(
      new URL(current('/en' + path + hash), 'http://127.0.0.1:4173').href,
    )
    await expect(
      page.getByRole('heading', { level: 2, name: 'TrainQuery', exact: true }),
    ).toBeVisible()
    await page.getByRole('link', { name: 'Language', exact: true }).click()
    await expect(page).toHaveURL(new URL(current(path + hash), 'http://127.0.0.1:4173').href)
  }
})

test('scrolling menus at their boundaries keeps the article and edition in place', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  for (const edition of ['0.8', '0.9']) {
    for (const language of ['', '/en']) {
      const route = `${language}/version/${edition}/reference/toolcontext`
      await page.goto(route)
      const articleUrl = page.url()
      await expect(page.locator('.table-of-contents [aria-current="location"]')).toHaveCount(1)
      for (const selector of ['.sidebar-scroll', '.table-of-contents']) {
        const menu = page.locator(selector)
        expect(await menu.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(
          true,
        )
        for (const direction of [-1, 1]) {
          await page.evaluate(() => window.scrollTo(0, 1000))
          await menu.evaluate((element, direction) => {
            element.scrollTop = direction > 0 ? element.scrollHeight : 0
          }, direction)
          await menu.hover()
          await page.mouse.wheel(0, direction * 700)
          // Wheel scrolling runs on the compositor; let the gesture finish before
          // checking that it did not transfer from the menu into the article.
          await page.waitForTimeout(250)
          expect(await page.evaluate(() => window.scrollY)).toBe(1000)
          await expect(page).toHaveURL(articleUrl)
          await expect(page.locator('#wiki-edition')).toHaveValue(edition)
        }
      }
      // The article itself still scrolls normally and its next/previous links
      // retain the chosen language and edition all the way to the page footer.
      await page.mouse.move(800, 600)
      await page.mouse.wheel(0, 700)
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000)
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
      const links = await page
        .locator('.page-navigation a')
        .evaluateAll((elements) => elements.map((element) => element.getAttribute('href')))
      expect(links.length).toBeGreaterThan(0)
      for (const link of links)
        expect(link).toMatch(new RegExp(`^${language}/version/${edition.replace('.', '\\.')}/`))
    }
  }
})

test('long reference contents follow scrolling, resizing and language changes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(current('/reference/toolcontext'))
  const sections = page.locator('.article-section')
  const count = await sections.count()
  expect(count).toBeGreaterThan(50)
  for (const index of [Math.floor(count * 0.7), Math.floor(count * 0.2)]) {
    const section = sections.nth(index)
    const id = await section.getAttribute('id')
    await section.evaluate((element) => element.scrollIntoView({ block: 'start' }))
    await expect(page.locator('.table-of-contents [aria-current="location"]')).toHaveAttribute(
      'href',
      '#' + id,
    )
  }
  await page.setViewportSize({ width: 1280, height: 900 })
  const section = sections.nth(Math.floor(count / 2))
  const id = await section.getAttribute('id')
  await section.locator('h2 a').click()
  await expect(page.locator('.table-of-contents [aria-current="location"]')).toHaveAttribute(
    'href',
    '#' + id,
  )
  await page.getByRole('link', { name: 'Langue', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('.table-of-contents [aria-current="location"]')).toHaveAttribute(
    'href',
    '#' + id,
  )
})

test('train tutorial and callable reference explain inputs and results in both languages', async ({ page }) => {
  for (const locale of ['fr', 'en']) {
    const prefix = locale === 'en' ? '/en' : ''
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(current(prefix + '/mods/composition-trains#regle'))
    await expect(page.locator('#regle tbody tr')).toHaveCount(8)
    await expect(page.locator('#regle pre')).toContainText('//')
    await expect(page.locator('#resultats')).toContainText('810 + 60 = 870 m')
    await expect(page.locator('#messages pre')).toContainText('"fr"')
    await expect(page.locator('#messages pre')).toContainText('"en"')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: `test-results/wiki-train-guide-${locale}.png` })

    await page.goto(current(prefix + '/reference/native/nimby/traineditor#api-traineditorbuilder-maximumlength-8ad8b50aca'))
    const section = page.locator('#api-traineditorbuilder-maximumlength-8ad8b50aca')
    await expect(section.locator('table').first().locator('tbody tr')).toHaveCount(4)
    await expect(section.locator('table').first()).toContainText('IntegerOption')
    await expect(section.locator('table').first()).toContainText('10')
    await expect(section.locator('table').nth(1)).toContainText('Unit')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
})

test('JVM tutorial exposes a complete runnable project in both languages', async ({ page }) => {
  for (const locale of ['fr', 'en']) {
    await page.goto(current((locale === 'en' ? '/en' : '') + '/lire/connexion#projet'))
    for (const name of ['settings.gradle.kts', 'build.gradle.kts', 'src/main/kotlin/TrainDashboard.kt']) {
      const content = await page.locator('#projet pre').evaluateAll(
        (blocks, title) => blocks.find((block) => block.getAttribute('aria-label') === title)?.textContent,
        name,
      )
      expect(content, name).toBeTruthy()
      expect(content).not.toContain('\\n')
      const path = resolve(`.validation/jvm-tutorial-generated-project-${locale}`, name)
      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, content!, 'utf8')
    }
    await expect(page.locator('#projet')).toContainText('fun main(')
    await expect(page.locator('#projet')).toContainText('0.9.0-alpha.3')
  }
})
