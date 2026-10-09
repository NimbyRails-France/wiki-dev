import { referenceArticles, referenceIndex } from './reference'
import { translationsGuide } from './translations'
import { capabilities } from './capabilities'
import { authoring } from './authoring'
import { toolAuthoring } from './tool-authoring'
import { modOptionsGuides } from './mod-options-guide'
import { trainGuides } from './train-guides'
import { performanceGuides } from './performance-guides'
import { gettingStartedGuides } from './getting-started-guides'
import { gradleProjectGuides } from './gradle-project-guide'
import { maintenanceGuides } from './maintenance-guides'
import { observationGuides } from './observation-guides'
import { signalGuides } from './signal-guides'
export const groups = [
  'Commencer',
  'Créer un mod',
  'Lire et agir',
  'Référence',
  'Maintenance',
] as const
export const articles = [
  ...gettingStartedGuides,
  ...capabilities,
  ...gradleProjectGuides.filter((article) => article.group !== 'Référence'),
  ...signalGuides,
  ...authoring,
  ...toolAuthoring,
  ...modOptionsGuides,
  ...observationGuides,
  ...trainGuides,
  ...performanceGuides.filter((article) => article.group !== 'Maintenance'),
  translationsGuide,
  referenceIndex,
  ...gradleProjectGuides.filter((article) => article.group === 'Référence'),
  ...referenceArticles,
  ...maintenanceGuides,
  ...performanceGuides.filter((article) => article.group === 'Maintenance'),
]
