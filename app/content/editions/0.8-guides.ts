import type { EditionSnapshot } from '../editions'
import type { Article, Block, Section } from '../schema'

/**
 * Editorial update of the historical 0.8 guides, from alpha.3 to alpha.8.
 * This transformation deliberately excludes the generated API reference.
 * Source contract: SDK ea1ffc6ee68ffd650d1ceab5ca450ae0b8136434.
 * Keep this module when refreshing the archive: a live 0.9 guide is not a
 * substitute for the public API and behaviour available in that release.
 */
type Locale = 'fr' | 'en'
type Bilingual = readonly [string, string]
const choose = (locale: Locale, value: Bilingual) => value[locale === 'fr' ? 0 : 1]
const prose = (locale: Locale, value: Bilingual): Block => ({
  kind: 'text',
  text: choose(locale, value),
})
const caution = (locale: Locale, value: Bilingual): Block => ({
  kind: 'note',
  title: choose(locale, ['À retenir', 'Remember']),
  text: choose(locale, value),
})
const snippet = (code: string, title: string): Block => ({
  kind: 'code',
  language: 'kotlin',
  code,
  title,
})
const section = (locale: Locale, id: string, title: Bilingual, blocks: Block[]): Section => ({
  id,
  title: choose(locale, title),
  blocks,
})

function workSettings(locale: Locale) {
  const label = choose(locale, ['Travaux', 'Engineering work'])
  const count = choose(locale, ['Nombre de cantons suivants', 'Number of following blocks'])
  return `package wiki.settings

import nimby.*

enum class WorkAspect { Closed, Open }
enum class WorkReason { Unknown, WorkHere, WorkAndFollowing, Clear }

val workBlocks = NumberSetting(
    name = "workBlocks", label = "${count}",
    maximum = 64, defaultValue = 0, visibleWhen = "work"
)

val workSignal = signalModel(
    "work-example.signal", "${label}", "work_example_textures",
    fallback = Indication(WorkAspect.Closed, WorkReason.Unknown)
) {
    construction(states = listOf("closed.svg", "open.svg"), size = 4, left = true)
    val work = checkbox("work", "${label}")
    number(workBlocks)
    rules {
        when {
            !fresh || !routeKnown || settingsStatus == SettingsStatus.Unavailable ||
                observation.forcedStop || observation.lampFailed || block != Occupancy.Clear ->
                Indication(WorkAspect.Closed, WorkReason.Unknown)
            enabled(work) -> Indication(WorkAspect.Closed,
                if (workBlocks.read(settings) == 0) WorkReason.WorkHere
                else WorkReason.WorkAndFollowing)
            else -> Indication(WorkAspect.Open, WorkReason.Clear)
        }
    }
    images { if (it.aspect == WorkAspect.Open) "open.svg" else "closed.svg" }
    driving { if (it.aspect == WorkAspect.Open) AutomaticDriving.clear() else AutomaticDriving.stop() }
}

fun createWorkExampleMod() = signalMod("work-example", "${label}") {
    metadata(author = "Your name", description = "Persistent work settings example.")
    signal(workSignal)
}
`
}

function preparedSettings(locale: Locale) {
  return `package wiki.settings

import nimby.*

${choose(locale, [
  '// Réutilise workSignal et workBlocks du guide des réglages.',
  '// Reuses workSignal and workBlocks from the settings guide.',
])}
fun createPreparedWorkMod() = signalMod("work-example", "${choose(locale, ['Travaux', 'Engineering work'])}") {
    metadata(author = "Your name", description = "Effective work settings example.")
    signal(workSignal)
    prepareNetwork { observed ->
        observed.map { signal ->
            if (signal.type == workSignal.type.id &&
                signal.settingsStatus == SettingsStatus.Present &&
                signal.settings["work"] != true) {
                signal.copy(settings = workBlocks.withValue(signal.settings, 0))
            } else signal
        }
    }
}
`
}

function numericSection(locale: Locale): Section {
  // NumberSetting.kt; SignalModel.kt; signal_settings_store.hpp and presenter.
  return section(
    locale,
    'nombres',
    ['Ajouter un entier persistant', 'Add a persistent integer'],
    [
      prose(locale, [
        'NumberSetting déclare un entier enregistré pour chaque signal. Ajoutez-le avec number dans le modèle, puis utilisez read(settings) dans vos règles. ToolNumberInput sert au panneau temporaire d’un outil : il ne remplace pas ce réglage persistant.',
        'NumberSetting declares an integer saved for each signal. Add it with number in the model, then use read(settings) in your rules. ToolNumberInput belongs to a temporary tool panel; it does not replace this persistent setting.',
      ]),
      snippet(workSettings(locale), 'src/main/kotlin/WorkSettings.kt'),
      prose(locale, [
        'Ajoutez closed.svg et open.svg dans assets. Pour essayer ce modèle seul, le point d’entrée nimby.mod.createMod() peut retourner wiki.settings.createWorkExampleMod(), avec id = work-example et name = Travaux dans mod.json. Cet exemple ferme le signal pendant les travaux et distingue deux motifs. Il ne propage aucune règle vers les cantons suivants : cette politique appartient à votre mod.',
        'Add closed.svg and open.svg to assets. To try this model alone, nimby.mod.createMod() can return wiki.settings.createWorkExampleMod(), with id = work-example and name = Engineering work in mod.json. This example closes the signal during work and distinguishes two reasons. It does not propagate a rule to following blocks; that policy belongs to your mod.',
      ]),
      {
        kind: 'table',
        columns: choose(locale, ['Paramètre|Contrat', 'Parameter|Contract']).split('|'),
        rows: [
          [
            'name',
            choose(locale, [
              'Identifiant stable et unique parmi les champs numériques du modèle : lettre initiale, puis lettres, chiffres, point, tiret ou soulignement ; 96 caractères au maximum.',
              'Stable identifier, unique among the model’s numeric fields: an initial letter, then letters, digits, dots, hyphens or underscores; at most 96 characters.',
            ]),
          ],
          [
            'label',
            choose(locale, [
              'Libellé affiché ; accepte tr(...) comme les cases.',
              'Displayed label; accepts tr(...) like checkboxes.',
            ]),
          ],
          [
            'maximum',
            choose(locale, [
              'Entier de 1 à 65535 ; les valeurs du champ vont de 0 à maximum inclus.',
              'Integer from 1 to 65535; field values range from 0 through maximum inclusive.',
            ]),
          ],
          [
            'defaultValue = 0',
            choose(locale, [
              'Valeur initiale dans les mêmes bornes. Les réglages sauvegardés ne sont pas remplacés par un nouveau défaut.',
              'Initial value within the same bounds. Saved settings are not overwritten by a new default.',
            ]),
          ],
          [
            'visibleWhen = ""',
            choose(locale, [
              'Vide : toujours visible. Sinon, nom d’une case déclarée dans ce même modèle ; le champ apparaît quand sa valeur effective est vraie.',
              'Empty: always visible. Otherwise, the name of a checkbox declared in the same model; the field appears when its effective value is true.',
            ]),
          ],
          [
            'read(settings)',
            choose(locale, [
              'Lit la valeur en tenant compte du défaut et la borne entre 0 et maximum. Vérifiez aussi settingsStatus et la fraîcheur nécessaires à votre règle.',
              'Reads the value with its default and bounds it between 0 and maximum. Also check settingsStatus and the freshness required by your rule.',
            ]),
          ],
          [
            'withValue(settings, value)',
            choose(locale, [
              'Retourne une nouvelle table de réglages ; refuse une valeur hors bornes. Cet appel seul n’enregistre rien dans la partie.',
              'Returns a new settings map; rejects an out-of-range value. This call alone saves nothing in the game.',
            ]),
          ],
        ],
      },
      prose(locale, [
        'Un modèle accepte au maximum quatre champs numériques. Un champ vide ou hors bornes reste un brouillon ; il ne remplace pas la dernière valeur valide par zéro. Masquer un champ avec visibleWhen conserve sa valeur enregistrée. Testez la case dans la règle avant d’appliquer la valeur : la visibilité ne désactive pas votre logique.',
        'A model accepts at most four numeric fields. An empty or out-of-range field remains a draft; it does not replace the last valid value with zero. Hiding a field with visibleWhen preserves its saved value. Check the checkbox in your rule before applying the value: visibility does not disable your logic.',
      ]),
      caution(locale, [
        'Depuis alpha.8, un nombre conditionnel s’affiche immédiatement sous sa case, même si number(...) est déclaré après d’autres cases. Plusieurs nombres liés à la même case gardent leur ordre de déclaration. Les nombres sans visibleWhen suivent les cases. Il ne s’agit donc pas d’un ordre libre mélangeant chaque appel checkbox et number.',
        'Since alpha.8, a conditional number appears immediately below its checkbox even if number(...) is declared after other checkboxes. Numbers attached to the same checkbox keep their declaration order. Numbers without visibleWhen follow the checkboxes. The layout therefore does not freely interleave every checkbox and number call.',
      ]),
      {
        kind: 'links',
        items: [
          {
            label: choose(locale, ['Référence NumberSetting', 'NumberSetting reference']),
            to: '/reference/native/nimby/numbersetting',
          },
        ],
      },
    ],
  )
}

function preparationSection(locale: Locale): Section {
  // Mod.kt prepareObservedNetwork validates the transformation before resolving.
  return section(
    locale,
    'reglages-reseau',
    ['Préparer les réglages effectifs du réseau', 'Prepare effective network settings'],
    [
      prose(locale, [
        'prepareNetwork, dans signalMod, reçoit le réseau observé avant la résolution des règles. Utilisez-le pour calculer des réglages effectifs communs à plusieurs signaux. La fonction doit rester pure : elle retourne des copies et ne sauvegarde pas ses valeurs dérivées. Sans déclaration, elle conserve les signaux reçus.',
        'prepareNetwork, inside signalMod, receives the observed network before rule resolution. Use it to calculate effective settings shared by several signals. Keep the function pure: return copies and do not save derived values. Without a declaration, it preserves the input signals.',
      ]),
      snippet(preparedSettings(locale), 'src/main/kotlin/PreparedSettings.kt'),
      prose(locale, [
        'L’exemple réutilise WorkSettings.kt. Il ramène le nombre effectif à zéro quand un profil lisible désactive les travaux ; la valeur choisie par le joueur reste sauvegardée et sera relue lors d’une prochaine observation. Pour conserver les défauts d’un profil Absent, cet exemple le laisse inchangé. Votre point d’entrée peut retourner createPreparedWorkMod() à la place de createWorkExampleMod().',
        'The example reuses WorkSettings.kt. It sets the effective count to zero when a readable profile disables work; the player’s chosen value remains saved and is read again in a later observation. To preserve the defaults of an Absent profile, this example leaves it unchanged. Your entry point can return createPreparedWorkMod() instead of createWorkExampleMod().',
      ]),
      {
        kind: 'list',
        items: [
          choose(locale, [
            'Conservez la taille et l’ordre de la liste, ainsi que id, type, nextSignal et observation de chaque signal.',
            'Preserve list size and order, and each signal’s id, type, nextSignal and observation.',
          ]),
          choose(locale, [
            'Seuls settings et, si nécessaire, le passage de settingsStatus Absent à Present peuvent changer. Un profil Unavailable ne peut pas devenir disponible par ce calcul.',
            'Only settings and, when needed, the transition from settingsStatus Absent to Present may change. An Unavailable profile cannot become available through this calculation.',
          ]),
          choose(locale, [
            'Si vous remplacez Absent par Present, fournissez vous-même les réglages effectifs complets attendus : la normalisation des profils absents ne les remplacera plus par les défauts.',
            'If you replace Absent with Present, supply the complete effective settings expected by your model: absent-profile normalization will no longer replace them with defaults.',
          ]),
          choose(locale, [
            'prepareObservedNetwork applique et valide cette préparation ; evaluateNetwork l’utilise aussi. Un appel evaluate isolé ne parcourt pas le réseau et n’exécute pas prepareNetwork.',
            'prepareObservedNetwork applies and validates this preparation; evaluateNetwork also uses it. An isolated evaluate call does not traverse the network or run prepareNetwork.',
          ]),
          choose(locale, [
            'Cette API 0.8 accepte au maximum 512 signaux par appel, avec des IDs non nuls et uniques. Elle ne découvre pas les signaux absents de la capture et n’invente aucun lien entre branches.',
            'This 0.8 API accepts at most 512 signals per call, with unique nonzero IDs. It does not discover signals absent from the capture or invent links between branches.',
          ]),
        ],
      },
      caution(locale, [
        'Un nombre de cantons est une valeur de votre modèle, pas une propagation automatique du SDK. Pour étendre une zone de travaux, définissez vos types compatibles, le sens de parcours, la fin de zone, le traitement des cycles et des données manquantes. Ne modifiez jamais les observations ou la topologie pour faire passer une hypothèse pour une donnée du jeu.',
        'A block count is a value in your model, not automatic SDK propagation. To extend a work zone, define compatible types, traversal direction, zone termination, and handling of cycles and missing data. Never change observations or topology to present an assumption as game data.',
      ]),
    ],
  )
}

function copiedSettingsSection(locale: Locale): Section {
  // docs/construction.md; signal_actions.h; signal_settings_store.hpp.
  return section(
    locale,
    'reglages-copies',
    ['Copier les réglages du signal source', 'Copy source signal settings'],
    [
      prose(locale, [
        'La répétition par createSignals copie les réglages NRF effectifs du signal source : cases cochées ou décochées, valeurs par défaut et champs NumberSetting. Ils sont figés avant la première création de la série et appliqués aux nouveaux signaux dans la même partie. Une modification ultérieure de la source ne doit pas être interprétée comme une modification de cette série.',
        'Repetition through createSignals copies the source signal’s effective NRF settings: checked and unchecked boxes, defaults and NumberSetting fields. They are frozen before the first creation in the batch and applied to the new signals in the same game. A later edit of the source must not be interpreted as an edit of that batch.',
      ]),
      prose(locale, [
        'PARTIAL / Partial signifie aussi que la copie des réglages est incomplète. Tous les signaux demandés peuvent donc exister sans que l’opération soit une réussite complète. Examinez createdIds, reason et canUndo ; reason = 7 indique que la copie des réglages NRF est indisponible. Gardez le ticket et montrez ce résultat au joueur.',
        'PARTIAL / Partial also means that copying settings was incomplete. All requested signals may therefore exist without the operation being fully successful. Inspect createdIds, reason and canUndo; reason = 7 indicates that copying NRF settings is unavailable. Keep the ticket and show this outcome to the player.',
      ]),
      caution(locale, [
        'Ne relancez pas automatiquement createSignals pour réparer une copie incomplète : vous pourriez dupliquer les signaux. Une exception ou une attente après une mutation ne prouve pas qu’elle n’a rien fait. Suivez le même ticket avec pollConstruction ; proposez l’annulation uniquement lorsque canUndo le permet et ne renvoyez pas non plus une annulation dont le résultat reste incertain.',
        'Do not automatically repeat createSignals to repair an incomplete copy: you could duplicate the signals. An exception or delay after a mutation does not prove that nothing happened. Follow the same ticket with pollConstruction; offer undo only when canUndo permits it, and do not resend an undo whose result remains uncertain either.',
      ]),
    ],
  )
}

function placementSection(locale: Locale): Section {
  // ModResources.kt; construction defaults and destination orientation tests.
  return section(
    locale,
    'cote-taille-sens',
    ['Distinguer côté, taille et sens', 'Distinguish side, size and direction'],
    [
      prose(locale, [
        'construction(size = 4, left = true) définit la taille et le côté par défaut des nouvelles poses de ce catalogue. size accepte les entiers de 0 à 4 ; sa valeur par défaut est 0. left vaut false par défaut ; true demande une nouvelle pose à gauche dans le sens du signal. Ces choix ne changent ni l’indication ni les consignes de conduite.',
        'construction(size = 4, left = true) sets the default size and side for new placements from that catalogue. size accepts integers from 0 to 4 and defaults to 0. left defaults to false; true requests a new placement on the left relative to the signal’s direction. These choices change neither the indication nor driving instructions.',
      ]),
      prose(locale, [
        'Ces défauts ne déplacent pas les signaux déjà posés. Une répétition conserve les propriétés visuelles de sa source au lieu de lui réappliquer les défauts du catalogue. Utilisez un identifiant de catalogue propre à votre modèle : un catalogue partagé de manière ambiguë ne permet pas au SDK d’attribuer le défaut de côté.',
        'These defaults do not move already placed signals. Repetition preserves the source’s visual properties instead of reapplying catalogue defaults. Use a catalogue identifier owned by your model: an ambiguously shared catalogue prevents the SDK from assigning the side default.',
      ]),
      prose(locale, [
        'Pour un aperçu ou une répétition, direction appartient à chaque position de voie et vaut -1 ou 1. Calculez-le sur la voie de destination ; ne recopiez pas aveuglément le sens de la source après un raccord. Le SDK alpha.8 prend en compte l’orientation propre à la voie de destination pour que la création suive le même sens que l’aperçu. Le côté gauche/droite est un réglage distinct de ce sens.',
        'For a preview or repetition, direction belongs to each track position and is -1 or 1. Calculate it on the destination track; do not blindly copy the source direction after a connection. SDK alpha.8 accounts for the destination track’s orientation so creation follows the same direction as the preview. Left/right side is a separate setting from this direction.',
      ]),
    ],
  )
}

function generatedFilesSection(locale: Locale): Section {
  // Gradle plugin GameModManifest and NrfModPlugin at the pinned release.
  return section(
    locale,
    'priorites-manifeste',
    ['Définir les valeurs au bon endroit', 'Define values in the right place'],
    [
      {
        kind: 'table',
        columns: choose(locale, ['Valeur|Source à modifier', 'Value|Source to edit']).split('|'),
        rows: [
          [
            'id, name, version, module, sdkMin, sdkMaxExclusive',
            choose(locale, [
              'mod.json. signalMod(modInfo) ou toolMod(modInfo) reprend l’identité générée ; une identité Kotlin différente fait échouer le build.',
              'mod.json. signalMod(modInfo) or toolMod(modInfo) reuses the generated identity; a different Kotlin identity makes the build fail.',
            ]),
          ],
          [
            'metadata(name = …)',
            choose(locale, [
              'Remplace uniquement le nom affiché dans le jeu ; ne renomme pas l’identité du paquet, le module ou les métadonnées du Hub.',
              'Overrides only the in-game display name; it does not rename the package identity, module or Hub metadata.',
            ]),
          ],
          [
            'construction(size = …, left = …)',
            choose(locale, [
              'Défauts des nouvelles poses, déclarés en Kotlin pour ce modèle. Une taille hors de 0..4 est refusée.',
              'Defaults for new placements, declared in Kotlin for this model. Sizes outside 0..4 are rejected.',
            ]),
          ],
          [
            'assets/mod.txt · assets/nrf-metadata.json',
            choose(locale, [
              'Ces surcharges manuelles sont refusées. Déclarez ressources, textes et construction en Kotlin, puis reconstruisez les fichiers générés.',
              'These manual overrides are rejected. Declare resources, text and construction in Kotlin, then rebuild the generated files.',
            ]),
          ],
          [
            'assets/nrf-mod.ini',
            choose(locale, [
              'N’est pas une surcharge du manifeste du chargeur : le paquet utilise le fichier généré depuis mod.json.',
              'Does not override the loader manifest: the package uses the file generated from mod.json.',
            ]),
          ],
        ],
      },
      prose(locale, [
        'assembleReleaseMod assemble le paquet local. packageMod produit le ZIP et les manifestes du Hub après les tests et verifyNativeMod ; il n’installe et ne publie rien. Conservez tout le paquet assemblé, ses fichiers générés, ses images et ses bibliothèques associées : une DLL isolée ne représente pas un mod complet.',
        'assembleReleaseMod assembles the local package. packageMod produces the ZIP and Hub manifests after tests and verifyNativeMod; it installs and publishes nothing. Keep the entire assembled package, generated files, images and associated libraries: an isolated DLL is not a complete mod.',
      ]),
      prose(locale, [
        'Évitez les chemins de ressources en double entre assets, imgs et config : une texture ambiguë ou une collision de fichiers fait échouer la génération ou l’assemblage. Après une modification des textes, des images, de la taille ou du côté par défaut, reconstruisez le paquet avant de l’activer dans une partie de test.',
        'Avoid duplicate resource paths between assets, imgs and config: an ambiguous texture or file collision makes generation or assembly fail. After changing text, images, size or default side, rebuild the package before enabling it in a test game.',
      ]),
    ],
  )
}

function findArticle(snapshot: EditionSnapshot, locale: Locale, slug: string) {
  const article = snapshot.locales[locale].articles.find((item) => item.slug === slug)
  if (!article) throw new Error(`Missing historical guide: ${locale}/${slug}`)
  return article
}
function findSection(article: Pick<Article, 'slug' | 'sections'>, id: string) {
  const found = article.sections.find((item) => item.id === id)
  if (!found) throw new Error(`Missing historical guide section: ${article.slug}#${id}`)
  return found
}
function upsert(article: Pick<Article, 'sections'>, value: Section, after?: string) {
  const index = article.sections.findIndex((item) => item.id === value.id)
  if (index >= 0) article.sections[index] = value
  else {
    const anchor = after ? article.sections.findIndex((item) => item.id === after) : -1
    article.sections.splice(anchor >= 0 ? anchor + 1 : article.sections.length, 0, value)
  }
}

/** Return an independent, repeatable alpha.8 guide update, keeping API/provenance untouched. */
export function updateGuides(source: EditionSnapshot): EditionSnapshot {
  if (source.id !== '0.8') throw new Error('The alpha.8 guide update only applies to edition 0.8')
  const snapshot = JSON.parse(JSON.stringify(source)) as EditionSnapshot
  for (const locale of ['fr', 'en'] as const) {
    const installation = findArticle(snapshot, locale, 'commencer/installation')
    const tools = findSection(installation, 'outils')
    const version = tools.blocks.find(
      (block) => block.kind === 'note' && /0\.8\.0-alpha\./.test(block.text),
    )
    if (!version || version.kind !== 'note')
      throw new Error('Missing 0.8 installation version note')
    version.text = choose(locale, [
      'Cette édition documente le SDK 0.8.0-alpha.8, dernière version 0.8 publiée. Les champs NumberSetting, la préparation du réseau et les défauts de pose décrits ici exigent le kit et le SDK du jeu compatibles avec ces fonctionnalités. Utilisez le kit alpha.8 avec le SDK alpha.8 pour reproduire ces exemples ; les fonctionnalités 0.9 appartiennent à leur propre édition.',
      'This edition documents SDK 0.8.0-alpha.8, the latest published 0.8 release. The NumberSetting fields, network preparation and placement defaults documented here require a kit and in-game SDK supporting those features. Use the alpha.8 kit with the alpha.8 SDK to reproduce these examples; 0.9 features belong to their own edition.',
    ])
    const manifest = findSection(installation, 'fichiers').blocks.find(
      (block) => block.kind === 'code' && block.title === 'mod.json',
    )
    if (!manifest || manifest.kind !== 'code')
      throw new Error('Missing historical starter manifest')
    const json = JSON.parse(manifest.code) as Record<string, unknown>
    json.sdkMin = '0.8.0-alpha.8'
    manifest.code = JSON.stringify(json, null, 2)

    const settings = findArticle(snapshot, locale, 'mods/reglages')
    settings.description = choose(locale, [
      'Cases et entiers persistants, visibilité conditionnelle et conservation des réglages.',
      'Persistent checkboxes and integers, conditional visibility and preservation of settings.',
    ])
    upsert(settings, numericSection(locale), 'case')
    upsert(findArticle(snapshot, locale, 'mods/signaux'), preparationSection(locale), 'reseau')

    const ui = findArticle(snapshot, locale, 'mods/interface')
    upsert(
      ui,
      section(
        locale,
        'ordre-nombres',
        ['Placer un nombre sous sa case', 'Place a number below its checkbox'],
        [
          prose(locale, [
            'Les cases gardent leur ordre de déclaration. Chaque NumberSetting conditionnel apparaît juste sous la case désignée par visibleWhen ; les champs sans condition viennent après les cases. La saisie appartient au signal sélectionné, reste enregistrée quand le champ est masqué et retrouve sa valeur lors du rechargement des réglages.',
            'Checkboxes keep their declaration order. Each conditional NumberSetting appears immediately below the checkbox named by visibleWhen; unconditional fields follow the checkboxes. The value belongs to the selected signal, remains saved while hidden, and is restored when settings are reloaded.',
          ]),
          caution(locale, [
            'visibleWhen ne désactive aucune règle. Utilisez enabled(...) avec read(settings), et gardez un repli lorsque settingsStatus est Unavailable.',
            'visibleWhen does not disable any rule. Use enabled(...) with read(settings), and retain a fallback when settingsStatus is Unavailable.',
          ]),
          {
            kind: 'links',
            items: [
              {
                label: choose(locale, [
                  'Exemple complet de NumberSetting',
                  'Complete NumberSetting example',
                ]),
                to: '/mods/reglages#nombres',
              },
            ],
          },
        ],
      ),
      'signal',
    )

    const packageGuide = findArticle(snapshot, locale, 'mods/paquet-genere')
    upsert(packageGuide, placementSection(locale), 'construction')
    upsert(packageGuide, generatedFilesSection(locale), 'sources')
    const constructionExample = findSection(packageGuide, 'construction').blocks.find(
      (block) => block.kind === 'code',
    )
    if (!constructionExample || constructionExample.kind !== 'code')
      throw new Error('Missing historical construction example')
    constructionExample.code = `construction(\n    states = listOf("closed.svg", "open.svg"),\n    name = "${choose(locale, ['Mon signal', 'My signal'])}",\n    kind = "path",\n    size = 4,\n    left = true\n)`

    const construction = findArticle(snapshot, locale, 'lire/construction')
    upsert(construction, copiedSettingsSection(locale), 'cycle')
    upsert(construction, placementSection(locale), 'reglages-copies')
    const resultTable = findSection(construction, 'resultats').blocks.find(
      (block) => block.kind === 'table',
    )
    if (!resultTable || resultTable.kind !== 'table')
      throw new Error('Missing historical construction result table')
    const partial = resultTable.rows.find((row) => row[0]?.startsWith('PARTIAL'))
    if (!partial) throw new Error('Missing historical PARTIAL row')
    partial[1] = choose(locale, [
      'Création ou copie des réglages incomplète, même si tous les IDs existent. Examiner createdIds, reason et canUndo ; ne pas relancer automatiquement la pose.',
      'Creation or settings copy incomplete, even when all IDs exist. Inspect createdIds, reason and canUndo; do not automatically repeat placement.',
    ])

    upsert(
      findArticle(snapshot, locale, 'mods/outils-optionnels'),
      section(
        locale,
        'panneau-perime',
        ['Quand la source du panneau disparaît', 'When the panel source disappears'],
        [
          prose(locale, [
            'Si la source a été supprimée ou son catalogue modifié, republier un panneau devenu périmé peut être ignoré. L’absence d’exception ne prouve donc pas qu’un panneau est encore affiché. Revalidez la source dans network(), effacez vos aperçus et abandonnez les calculs qui ne correspondent plus à la partie courante.',
            'If the source is deleted or its catalogue changes, republishing a stale panel can be ignored. The absence of an exception therefore does not prove that a panel is still displayed. Revalidate the source in network(), clear previews and discard calculations that no longer belong to the current game.',
          ]),
          caution(locale, [
            'Cette tolérance concerne la présentation. Elle ne rend pas valide un ticket de construction, une ancienne sélection ou une observation périmée ; les commandes restent soumises à leurs contrôles.',
            'This tolerance concerns presentation. It does not validate a construction ticket, an old selection or a stale observation; commands remain subject to their own checks.',
          ]),
        ],
      ),
      'contexte',
    )

    const tests = findArticle(snapshot, locale, 'maintenance/tests')
    const ruleTest = findSection(tests, 'unitaire').blocks.find((block) => block.kind === 'code')
    if (!ruleTest || ruleTest.kind !== 'code') throw new Error('Missing historical rule test')
    ruleTest.code = `import kotlin.test.Test\nimport kotlin.test.assertEquals\nimport kotlin.test.assertNotNull\nimport nimby.*\n\nclass SignalTests {\n    @Test fun unknownBlockStaysClosed() {\n        val mod = nimby.mod.createMod()\n        val decision = mod.evaluate(\n            mapOf("active" to true),\n            Observation(block = Occupancy.Unknown, fresh = true, routeKnown = true)\n        )\n        val indication = assertNotNull(mod.indication(decision))\n        assertEquals(nimby.mod.Aspect.Closed, indication.aspect)\n    }\n}`
    upsert(
      tests,
      section(
        locale,
        'reglages-et-pose',
        ['Vérifier les nouveaux contrats 0.8', 'Verify the updated 0.8 contracts'],
        [
          {
            kind: 'list',
            items: [
              choose(locale, [
                'NumberSetting : défaut, zéro, maximum, refus hors bornes, conservation de la valeur lorsque la case est désactivée, sauvegarde et rechargement.',
                'NumberSetting: default, zero, maximum, out-of-range rejection, preservation while its checkbox is disabled, save and reload.',
              ]),
              choose(locale, [
                'Panneau mixte : plusieurs cases et nombres ; un champ conditionnel doit être sous sa propre case, pas à la fin du panneau.',
                'Mixed panel: several checkboxes and numbers; a conditional field must appear below its own checkbox, not at the end of the panel.',
              ]),
              choose(locale, [
                'prepareNetwork : même résultat à entrée égale, aucune mutation de l’entrée, ordre et observations conservés ; Unavailable ne devient pas Present.',
                'prepareNetwork: equal input gives equal output, no input mutation, order and observations preserved; Unavailable must not become Present.',
              ]),
              choose(locale, [
                'Répétition : cases vraies et fausses, défauts, nombres non nuls ; PARTIAL avec réglages incomplets reste un échec partiel même avec tous les IDs.',
                'Repetition: true and false checkboxes, defaults, nonzero numbers; PARTIAL with incomplete settings remains partial failure even with every ID.',
              ]),
              choose(locale, [
                'Pose en partie : taille 0 et 4, deux sens, raccords dont les voies ont des orientations différentes, aperçu puis création ; une répétition conserve les propriétés visuelles de la source.',
                'In-game placement: sizes 0 and 4, both directions, connections between differently oriented tracks, preview then creation; repetition preserves the source’s visual properties.',
              ]),
            ],
          },
          prose(locale, [
            'Les décisions brutes sont opaques : lisez mod.indication(decision) pour tester l’aspect typé. Des tests de calcul ne remplacent pas la vérification des panneaux et de la pose sur une partie de test avec le même SDK.',
            'Raw decisions are opaque: read mod.indication(decision) to test the typed aspect. Calculation tests do not replace checking panels and placement in a test game using the same SDK.',
          ]),
        ],
      ),
      'unitaire',
    )
  }
  return snapshot
}
