import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const edition = JSON.parse(readFileSync('app/content/editions/registry.json', 'utf8')).current

for (const prefix of ['', '/en']) {
  test(`legacy ${prefix ? 'English' : 'French'} homepage hydrates once before canonical navigation`, async ({ page }) => {
    const hydrationWarnings: string[] = []
    page.on('console', (message) => {
      if (/hydrat/i.test(message.text())) hydrationWarnings.push(message.text())
    })
    page.on('pageerror', (error) => hydrationWarnings.push(error.message))
    const home = `${prefix}/version/${edition}`
    const article = `${home}/lire/construction`
    async function singlePage() {
      // A stale server-rendered shell is still visible below the live Vue page,
      // even when the URL, heading and navigation all appear to work normally.
      for (const selector of ['.wiki-layout', 'main', '#wiki-navigation', 'h1', '.site-footer']) {
        await expect(page.locator(selector)).toHaveCount(1)
      }
      expect(hydrationWarnings).toEqual([])
    }

    await page.goto(`${prefix || '/'}?from=legacy#main`)
    await expect(page).toHaveURL(new RegExp(`${home.replaceAll('.', '\\.')}\\?from=legacy#main$`))
    await singlePage()
    await expect(page.locator('.home-content')).toHaveCount(1)

    await page.locator(`.sidebar-scroll a[href="${article}"]`).click()
    await expect(page).toHaveURL(new RegExp(`${article.replaceAll('.', '\\.')}$`))
    await singlePage()
    await expect(page.locator('.article')).toHaveCount(1)
    await expect(page.locator('.home-content')).toHaveCount(0)

    await page.locator('.sidebar-brand').click()
    await expect(page).toHaveURL(new RegExp(`${home.replaceAll('.', '\\.')}$`))
    await singlePage()
    await page.goBack()
    await expect(page).toHaveURL(new RegExp(`${article.replaceAll('.', '\\.')}$`))
    await singlePage()
    await page.goForward()
    await expect(page).toHaveURL(new RegExp(`${home.replaceAll('.', '\\.')}$`))
    await singlePage()

    // Historical article aliases share the canonicalisation middleware too.
    await page.goto(`${prefix}/lire/construction?from=legacy#cycle`)
    await expect(page).toHaveURL(new RegExp(`${article.replaceAll('.', '\\.')}\\?from=legacy#cycle$`))
    await singlePage()
    await expect(page.locator('.article')).toHaveCount(1)
    await expect(page.locator('#cycle')).toBeInViewport()
  })
}
