import { articles, groups } from './index'
import messages from './en.json'
import ui from './ui-en.json'
import codeText from './code-en.json'
import tutorialCode from './tutorial-code-en.json'
import { authoringEnglish } from './authoring'
import { toolAuthoringEnglish } from './tool-authoring'
import { modOptionsEnglish } from './mod-options-guide'
import { trainEditorEnglish } from './train-editor-guide'
import { referenceEnglish } from './reference'
import { trainGuidesEnglish, trainCodeEnglish } from './train-guides'
import { capabilitiesEnglish } from './capabilities'
import { performanceGuidesEnglish } from './performance-guides'
import { performanceCodeEnglish } from './performance-code'
import { gettingStartedEnglish } from './getting-started-guides'
import { gradleProjectEnglish } from './gradle-project-guide'
import { maintenanceEnglish } from './maintenance-guides'
import { observationGuidesEnglish } from './observation-guides'
import { signalGuidesEnglish } from './signal-guides'
import { translationsEnglish } from './translations'
import type { Article, Block } from './schema'

export type Locale = 'fr' | 'en'
const english: Record<string, string> = {
  ...messages,
  ...ui,
  ...authoringEnglish,
  ...toolAuthoringEnglish,
  ...modOptionsEnglish,
  ...trainEditorEnglish,
  ...referenceEnglish,
  ...trainGuidesEnglish,
  ...capabilitiesEnglish,
  ...performanceGuidesEnglish,
  ...gettingStartedEnglish,
  ...gradleProjectEnglish,
  ...maintenanceEnglish,
  ...observationGuidesEnglish,
  ...signalGuidesEnglish,
  ...translationsEnglish,
}

// A missing translation is a build/test error, never a silent French fallback.
export function translate(value: string, locale: Locale): string {
  if (locale === 'fr') return value
  const result = english[value]
  if (result === undefined) throw new Error(`Missing English translation: ${value}`)
  return result
}
export function routeLocale(path: string): Locale {
  return /^\/en(?:\/|$)/.test(path) ? 'en' : 'fr'
}
export function basePath(path: string): string {
  return path.replace(/^\/en(?=\/|$)/, '') || '/'
}
export function localePath(path: string, locale: Locale): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path
  const base = basePath(path)
  return locale === 'en' ? '/en' + (base === '/' ? '' : base) : base
}
export function englishCode(code: string): string {
  // Translate explanations and example labels only. Identifiers, service IDs,
  // texture names and real SDK error literals retain their documented values.
  // Translate complete comments before shorter phrases shared with older examples.
  const replacements = Object.entries({
    ...codeText,
    ...tutorialCode,
    ...trainCodeEnglish,
    ...performanceCodeEnglish,
  }).sort(([a], [b]) => b.length - a.length)
  for (const [source, target] of replacements) code = code.split(source).join(target)
  return code
}
function blockInEnglish(block: Block): Block {
  const t = (s: string) => translate(s, 'en')
  switch (block.kind) {
    case 'text':
      return { ...block, text: t(block.text) }
    case 'note':
      return { ...block, text: t(block.text), title: block.title && t(block.title) }
    case 'code':
      return {
        ...block,
        code: block.language === 'json' ? block.code : englishCode(block.code),
        title: block.title && t(block.title),
      }
    case 'list':
      return { ...block, items: block.items.map(t) }
    case 'table':
      return { ...block, columns: block.columns.map(t), rows: block.rows.map((row) => row.map(t)) }
    case 'links':
      return {
        ...block,
        items: block.items.map((item) => ({ label: t(item.label), to: localePath(item.to, 'en') })),
      }
  }
}
export type LocalizedArticle = Omit<Article, 'group'> & { group: string }
const englishArticles: LocalizedArticle[] = articles.map((article) => ({
  ...article,
  title: translate(article.title, 'en'),
  description: translate(article.description, 'en'),
  group: translate(article.group, 'en'),
  sections: article.sections.map((section) => ({
    ...section,
    title: translate(section.title, 'en'),
    blocks: section.blocks.map(blockInEnglish),
  })),
}))
export const articlesFor = (locale: Locale): LocalizedArticle[] =>
  locale === 'en' ? englishArticles : articles
export const groupsFor = (locale: Locale) => groups.map((group) => translate(group, locale))
