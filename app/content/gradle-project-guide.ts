import type { Article } from './schema'
import { text, code, note, table, links } from './schema'

export const gradleProjectEnglish: Record<string, string> = {}
const t = (fr: string, en: string) => {
  gradleProjectEnglish[fr] = en
  return fr
}
const literal = (value: string) => t(value, value)

export const gradleProjectGuides: Article[] = [
  {
    slug: 'mods/structure',
    title: t('Organiser un projet de mod', 'Organise a mod project'),
    group: 'Créer un mod',
    description: t(
      'Séparez déclarations, règles, interface et ressources tout en conservant un projet Gradle simple.',
      'Separate declarations, rules, interface and resources while keeping a simple Gradle project.',
    ),
    sections: [
      {
        id: 'fichiers',
        title: t('Donner un rôle à chaque dossier', 'Give each directory a purpose'),
        blocks: [
          text(
            t(
              'Prérequis : le projet du premier mod. Vous pouvez commencer avec Entry.kt seul, puis extraire les règles et ressources lorsque le modèle grandit. Les noms de dossiers ci-dessous décrivent une organisation possible ; le plugin impose les racines de sources et le point d’entrée, pas votre architecture métier.',
              'Prerequisite: the first mod project. Start with Entry.kt alone, then extract rules and resources as the model grows. The directories below show one possible organisation; the plugin requires source roots and an entry point, not a particular domain architecture.',
            ),
          ),
          code(
            `mod.json
settings.gradle.kts
build.gradle.kts
gradle.properties
src/main/kotlin/
  Entry.kt
  bal/
    BalModel.kt
    BalRules.kt
    BalAppearance.kt
  common/
    NetworkRules.kt
  tools/
    PlacementTool.kt
src/test/kotlin/
  BalRulesTest.kt
assets/
  translations.json
  imgs/
    closed.svg
    open.svg
licenses/`,
            t(
              'Exemple d’organisation, à adapter à votre mod',
              'Example layout, adapt it to your mod',
            ),
            'text',
          ),
          table(
            [t('Élément', 'Item'), t('Contenu attendu', 'Expected contents')],
            [
              [
                literal('Entry.kt'),
                t(
                  'package nimby.mod, createMod() et composition des modèles ou outils.',
                  'package nimby.mod, createMod() and composition of models or tools.',
                ),
              ],
              [
                literal('bal/'),
                t(
                  'Un domaine du mod avec son modèle, ses règles et ses images. Les autres domaines gardent leurs propres types.',
                  'A mod domain with its model, rules and images. Other domains keep their own types.',
                ),
              ],
              [
                literal('common/'),
                t(
                  'Seulement les comportements réellement partagés entre plusieurs domaines.',
                  'Only behaviour actually shared across multiple domains.',
                ),
              ],
              [
                literal('tools/'),
                t(
                  'Événements, panneaux et orchestration des actions de vos outils.',
                  'Events, panels and action orchestration for your tools.',
                ),
              ],
              [
                literal('src/test/kotlin/'),
                t(
                  'Tests purs et jeux de données explicites pour chaque règle.',
                  'Pure tests and explicit data sets for each rule.',
                ),
              ],
              [
                literal('assets/'),
                t(
                  'Fichiers copiés à la racine du paquet ; assets/imgs/closed.svg se référence comme imgs/closed.svg.',
                  'Files copied to the package root; assets/imgs/closed.svg is referenced as imgs/closed.svg.',
                ),
              ],
            ],
          ),
          text(t(
            'Entry.kt assemble les objets ; les autres fichiers déclarent les objets et les fonctions qu’il utilise. Le chemin du fichier et son package Kotlin sont deux choses distinctes : un fichier tools/PlacementTool.kt peut déclarer package monmod.tools, puis être importé par Entry.kt. Seul le point d’entrée createMod doit être dans nimby.mod. Déplacer un fichier sans changer les identifiants du mod ou des modèles ne change pas leur identité dans les sauvegardes.',
            'Entry.kt assembles objects; other files declare the objects and functions it uses. A file path and its Kotlin package are distinct: tools/PlacementTool.kt may declare package monmod.tools and be imported by Entry.kt. Only the createMod entry point must be in nimby.mod. Moving a file without changing mod or model identifiers does not change their identity in saves.',
          )),
        ],
      },
      {
        id: 'responsabilites',
        title: t('Séparer calcul et effets', 'Separate computation from effects'),
        blocks: [
          text(
            t(
              'Une règle reçoit des observations et produit une décision explicable. Les fonctions d’apparence et de conduite interprètent cette décision. Un outil conserve séparément ses données copiées et l’état de son opération. Cette séparation permet de tester les calculs sans partie ouverte et d’identifier les lectures ou actions réellement nécessaires.',
              'A rule receives observations and produces an explainable decision. Appearance and driving functions interpret that decision. A tool separately retains copied data and operation state. This separation lets you test calculations without an open game and identify the reads or actions actually needed.',
            ),
          ),
          note(
            t(
              'Ne conservez pas un ToolContext au-delà de son callback. Conservez plutôt les valeurs copiées dont votre calcul a besoin, puis vérifiez le contexte courant avant une action. Le traitement en arrière-plan ne rend pas les objets de contexte réutilisables.',
              'Do not retain a ToolContext beyond its callback. Retain the copied values needed for your calculation instead, then check the current context before an action. Background processing does not make context objects reusable.',
            ),
          ),
          links(
            {
              label: t('Calculs partagés sur le réseau', 'Shared network calculations'),
              to: '/mods/preparer-reseau',
            },
            { label: t('Cycle d’une action', 'Action lifecycle'), to: '/mods/cycle-outils' },
            {
              label: t('Contrat des fichiers du projet', 'Project file contract'),
              to: '/reference/projet-gradle',
            },
          ),
        ],
      },
    ],
  },
  {
    slug: 'reference/projet-gradle',
    title: t('Projet Gradle et paquet Native', 'Gradle project and Native package'),
    group: 'Référence',
    description: t(
      'Contrat public du plugin fr.nimbyrails.mod : kit, identité, manifeste, ressources, tâches et sorties.',
      'Public contract of the fr.nimbyrails.mod plugin: kit, identity, manifest, resources, tasks and outputs.',
    ),
    sections: [
      {
        id: 'configuration',
        title: t('Sélection du kit et du plugin', 'Kit and plugin selection'),
        blocks: [
          text(
            t(
              'Cette page s’adresse aux projets Kotlin/Native de mods et d’outils en jeu. Pour une application Kotlin/JVM, suivez le guide de connexion. Le plugin fr.nimbyrails.mod est fourni par gradle-repository dans le kit ; settings.gradle.kts sélectionne la version gradlePluginVersion de sdk.json.',
              'This page is for Kotlin/Native signal mods and in-game tools. For a Kotlin/JVM application, follow the connection guide. The fr.nimbyrails.mod plugin is supplied by gradle-repository in the kit; settings.gradle.kts selects the gradlePluginVersion from sdk.json.',
            ),
          ),
          table(
            [t('Entrée', 'Input'), t('Contrat', 'Contract')],
            [
              [
                literal('nrfSdkDir'),
                t(
                  'Propriété Gradle prioritaire, chemin du dossier extrait contenant sdk.json. Un chemin relatif est résolu depuis le projet.',
                  'Preferred Gradle property: path to the extracted directory containing sdk.json. A relative path is resolved from the project.',
                ),
              ],
              [
                literal('NRF_KOTLIN_SDK'),
                t(
                  'Variable d’environnement utilisée lorsque nrfSdkDir est absent.',
                  'Environment variable used when nrfSdkDir is absent.',
                ),
              ],
              [
                literal('sdk.json'),
                t(
                  'Décrit le kit choisi. Le plugin contrôle les fichiers requis, le format, Kotlin, sa propre version, la plage SDK et les binaires de jeu déclarés.',
                  'Describes the selected kit. The plugin checks required files, format, Kotlin, its own version, the SDK range and declared game executables.',
                ),
              ],
              [
                literal('fr.nimbyrails.mod'),
                t(
                  'Applique la configuration Kotlin et fournit les dépendances de compilation. Le kit Windows crée la cible windows et les tâches windowsTest.',
                  'Applies Kotlin configuration and supplies compilation dependencies. The Windows kit creates the windows target and windowsTest tasks.',
                ),
              ],
            ],
          ),
          note(
            t(
              'Choisissez un kit complet et cohérent. Changer uniquement sdkMin ou recopier une bibliothèque d’un autre kit ne crée pas la compatibilité. La configuration recommandée est JDK 21 et Gradle 8.14.3 ; le kit décrit ici utilise Kotlin 2.2.20.',
              'Choose a complete, consistent kit. Changing only sdkMin or copying a library from another kit does not create compatibility. The recommended setup is JDK 21 and Gradle 8.14.3; the kit described here uses Kotlin 2.2.20.',
            ),
          ),
          text(t(
            'Résultat attendu : Gradle reconnaît le plugin, les imports nimby sont disponibles et windowsTest apparaît dans les tâches. Si la configuration échoue, corrigez la première erreur avant de chercher une erreur dans vos règles. Le dossier du kit contient sdk.json ; ce n’est ni le dossier du jeu, ni le ZIP encore compressé, ni le dossier bin seul.',
            'Expected result: Gradle recognizes the plugin, nimby imports are available and windowsTest appears among the tasks. If configuration fails, fix its first error before looking for a rule error. The kit directory contains sdk.json; it is neither the game directory, the still-compressed ZIP, nor the bin directory alone.',
          )),
          links(
            {
              label: t('Fichiers Gradle complets à copier', 'Complete Gradle files to copy'),
              to: '/commencer/installation#ouvrir',
            },
            { label: t('Application JVM', 'JVM application'), to: '/lire/connexion' },
          ),
        ],
      },
      {
        id: 'manifeste',
        title: t('Champs de mod.json', 'mod.json fields'),
        blocks: [
          table(
            [
              t('Champ', 'Field'),
              t('Type et valeur acceptée', 'Type and accepted value'),
              t('Signification', 'Meaning'),
            ],
            [
              [
                literal('id'),
                t(
                  'Chaîne : lettre minuscule initiale, puis minuscules, chiffres ou tirets ; 1 à 64 caractères.',
                  'String: initial lowercase letter, followed by lowercase letters, digits or hyphens; 1–64 characters.',
                ),
                t('Identité du projet pour le Hub.', 'Project identity for the Hub.'),
              ],
              [
                literal('name'),
                t(
                  'Chaîne non vide après retrait des espaces de bord.',
                  'String that is non-empty after trimming.',
                ),
                t('Nom lisible et titre de modInfo.', 'Readable name and modInfo title.'),
              ],
              [
                literal('modId'),
                t(
                  'Chaîne de 1 à 70 lettres, chiffres, tirets ou underscores.',
                  'String of 1–70 letters, digits, hyphens or underscores.',
                ),
                t(
                  'Identité de dossier et préfixe du paquet.',
                  'Directory identity and package prefix.',
                ),
              ],
              [
                literal('module'),
                t(
                  'Chaîne de 1 à 100 caractères ; lettre initiale, puis lettres, chiffres, tirets ou underscores. Sans extension.',
                  'String of 1–100 characters; initial letter, then letters, digits, hyphens or underscores. No extension.',
                ),
                t('Base du nom des fichiers du mod.', 'Base name of mod files.'),
              ],
              [
                literal('version'),
                t(
                  'X.Y.Z, X.Y.Z-alpha.N ou X.Y.Z-beta.N ; nombres sans zéro initial, X/Y/Z de 0 à 9999, N de 1 à 999999999.',
                  'X.Y.Z, X.Y.Z-alpha.N or X.Y.Z-beta.N; no leading zeroes, X/Y/Z from 0 to 9999, N from 1 to 999999999.',
                ),
                t(
                  'Version propre au mod ; alpha, beta ou stable déterminent aussi son canal.',
                  'The mod’s own version; alpha, beta or stable also determines its channel.',
                ),
              ],
              [
                literal('language'),
                literal('"kotlin-native"'),
                t('Langage attendu par ce plugin.', 'Language expected by this plugin.'),
              ],
              [
                literal('sdkMin · sdkMaxExclusive'),
                t(
                  'Versions au même format, avec sdkMin strictement inférieur à sdkMaxExclusive.',
                  'Versions in the same format, with sdkMin strictly below sdkMaxExclusive.',
                ),
                t(
                  'Intervalle accepté : borne basse incluse, borne haute exclue.',
                  'Accepted range: inclusive lower bound, exclusive upper bound.',
                ),
              ],
              [
                literal('gameSha256'),
                t(
                  'Liste non vide de chaînes hexadécimales SHA-256 à 64 caractères.',
                  'Non-empty list of 64-character hexadecimal SHA-256 strings.',
                ),
                t(
                  'Chaque binaire de jeu déclaré doit être pris en charge par le kit.',
                  'Every declared game executable must be supported by the kit.',
                ),
              ],
            ],
          ),
          text(
            t(
              'À numéros X.Y.Z égaux, alpha précède beta, puis la version stable ; les numéros de préversion sont comparés numériquement. Déclarez les compatibilités que vous avez vérifiées. Ces contrôles de construction ne remplacent pas un essai en partie.',
              'For equal X.Y.Z numbers, alpha precedes beta, then the stable version; prerelease numbers are compared numerically. Declare compatibility you have verified. These build checks do not replace an in-game test.',
            ),
          ),
        ],
      },
      {
        id: 'entree',
        title: t('createMod et l’identité générée', 'createMod and generated identity'),
        blocks: [
          code(
            'package nimby.mod\n\n// createMod() assemble la déclaration signalMod ou toolMod de ce projet.\n// Le plugin fournit modInfo depuis mod.json ; ne le redéclarez pas.',
            t(
              'Contrat du point d’entrée, commentaire de repérage',
              'Entry-point contract, orientation comment',
            ),
          ),
          text(
            t(
              'Fournissez createMod() dans le package nimby.mod. Pour un signal, le résultat est un SignallingMod construit avec signalMod(modInfo) ; un outil utilise toolMod et son contrat dédié. Le plugin génère modInfo depuis id et name : gardez cette source d’identité unique.',
              'Provide createMod() in package nimby.mod. For a signal, the result is a SignallingMod built with signalMod(modInfo); a tool uses toolMod and its dedicated contract. The plugin generates modInfo from id and name: keep that single source of identity.',
            ),
          ),
          text(
            t(
              'La génération du catalogue évalue la déclaration hors jeu. createMod et ses initialisations doivent donc décrire le mod sans accéder à une partie ni imprimer de texte sur la sortie standard. Placez les interactions avec le jeu dans les callbacks prévus et les messages de diagnostic dans les fonctions de journalisation.',
              'Catalogue generation evaluates the declaration outside the game. createMod and its initialisers must therefore describe the mod without accessing a game or printing to standard output. Put game interactions in the designated callbacks and diagnostics in logging functions.',
            ),
          ),
          table([t('Entrée', 'Input'), t('Utilisation', 'Use'), t('Résultat', 'Result')], [
            [literal('modInfo'), t('Identité générée depuis le manifeste, passée à signalMod ou toolMod.', 'Identity generated from the manifest, passed to signalMod or toolMod.'), t('Le même id pour le projet, son paquet et ses services.', 'The same id for the project, package and services.')],
            [literal('signal(model)'), t('Enregistre la même instance de modèle que celle utilisée par les règles.', 'Registers the same model instance used by the rules.'), t('Un modèle du paquet avec ses réglages, images et conduite.', 'A package model with its settings, images and driving rules.')],
            [literal('window(...) / service(...) / trainEditor { ... }'), t('Choisissez les fonctions correspondant à votre outil ; elles ne sont pas toutes obligatoires.', 'Choose the functions needed by your tool; they are not all mandatory.'), t('Un outil peut avoir une interface, un service ou seulement une règle de composition.', 'A tool may have an interface, a service or only a composition rule.')],
          ]),
          links(
            {
              label: t(
                'Point d’entrée complet du premier signal',
                'Complete first-signal entry point',
              ),
              to: '/commencer/premier-mod#exemple',
            },
            { label: t('Outils et services', 'Tools and services'), to: '/mods/outils-optionnels' },
          ),
        ],
      },
      {
        id: 'ressources',
        title: t('Fichiers inclus dans le paquet', 'Files included in the package'),
        blocks: [
          table(
            [t('Source', 'Source'), t('Destination ou rôle', 'Destination or role')],
            [
              [
                literal('src/main/kotlin/'),
                t(
                  'Sources compilées ; elles ne sont pas copiées telles quelles dans la distribution.',
                  'Compiled sources; they are not copied into the distribution as source files.',
                ),
              ],
              [
                literal('src/test/kotlin/'),
                t(
                  'Tests exécutés par les tâches de test, sans inclusion dans le paquet.',
                  'Tests run by test tasks, not included in the package.',
                ),
              ],
              [
                literal('assets/'),
                t(
                  'Contenu à la racine du paquet, sauf mod.txt et nrf-mod.ini qui sont générés.',
                  'Contents at the package root, except generated mod.txt and nrf-mod.ini.',
                ),
              ],
              [
                literal('imgs/ · config/ · docs/'),
                t(
                  'Dossiers facultatifs conservés sous le même nom.',
                  'Optional directories retained under the same name.',
                ),
              ],
              [
                literal('README.md · LICENSE · LICENSE.txt'),
                t('Fichiers facultatifs copiés à la racine.', 'Optional files copied to the root.'),
              ],
              [
                literal('licenses/'),
                t(
                  'Notices du mod dans licenses/mod ; celles du SDK sont ajoutées dans licenses/sdk.',
                  'Mod notices in licenses/mod; SDK notices are added in licenses/sdk.',
                ),
              ],
            ],
          ),
          note(
            t(
              'Un même chemin de destination provenant de plusieurs sources fait échouer l’assemblage. Choisissez par exemple assets/imgs ou imgs pour une image donnée. Le catalogue mod.txt vient de construction et des métadonnées Kotlin ; ne maintenez pas une seconde copie manuelle.',
              'The same destination path from multiple sources makes assembly fail. For a given image, choose either assets/imgs or imgs, for example. The mod.txt catalogue comes from construction and Kotlin metadata; do not maintain a second manual copy.',
            ),
          ),
          text(
            t(
              'Sous Windows, le paquet contient les fichiers <module>.dll et <module>Kotlin.dll. Distribuez le dossier complet avec ses ressources et licences. Les composants SDK utilisés pour vérifier le paquet ne deviennent pas des fichiers à ajouter manuellement à votre mod.',
              'On Windows, the package contains <module>.dll and <module>Kotlin.dll. Distribute the complete directory with its resources and licences. SDK components used to verify the package are not files to add manually to your mod.',
            ),
          ),
          links({
            label: t('Déclarer les ressources du modèle', 'Declare model resources'),
            to: '/mods/paquet-genere',
          }),
        ],
      },
      {
        id: 'taches',
        title: t('Choisir la tâche Gradle', 'Choose a Gradle task'),
        blocks: [
          table(
            [t('Tâche', 'Task'), t('Résultat sous Windows', 'Windows result')],
            [
              [
                literal('windowsTest'),
                t(
                  'Exécute les tests Kotlin ; rapports dans build/gradle/reports/tests/.',
                  'Runs Kotlin tests; reports in build/gradle/reports/tests/.',
                ),
              ],
              [
                literal('generateModIdentity'),
                t(
                  'Génère modInfo depuis mod.json ; appelée automatiquement lors des compilations nécessaires.',
                  'Generates modInfo from mod.json; called automatically by dependent compilations.',
                ),
              ],
              [
                literal('generateDebugGameManifest · generateReleaseGameManifest'),
                t(
                  'Évalue la déclaration compilée et génère mod.txt et nrf-metadata.json pour la variante choisie.',
                  'Evaluates the compiled declaration and generates mod.txt and nrf-metadata.json for the selected variant.',
                ),
              ],
              [
                literal('generateModManifest'),
                t('Génère nrf-mod.ini pour le paquet.', 'Generates nrf-mod.ini for the package.'),
              ],
              [
                literal('assembleDebugMod · assembleReleaseMod'),
                t(
                  'Assemble dans build/gradle/mod/debug ou release. Cette étape seule n’exécute pas toute la recette.',
                  'Assembles in build/gradle/mod/debug or release. This step alone does not run the full acceptance suite.',
                ),
              ],
              [
                literal('verifyNativeMod'),
                t(
                  'Assemble la variante Release et vérifie son cycle de vie sans jeu.',
                  'Assembles the Release variant and checks its lifecycle without the game.',
                ),
              ],
              [
                literal('modArchive'),
                t(
                  'Assemble Release, dépend des tests et de verifyNativeMod, puis produit le ZIP.',
                  'Assembles Release, depends on tests and verifyNativeMod, then produces the ZIP.',
                ),
              ],
              [
                literal('hubManifest'),
                t(
                  'Construit le ZIP et génère les deux descripteurs avec taille et empreinte réelles.',
                  'Builds the ZIP and generates both descriptors with actual size and hash.',
                ),
              ],
              [
                literal('packageMod'),
                t(
                  'Point d’entrée de distribution : dépend de hubManifest.',
                  'Distribution entry point: depends on hubManifest.',
                ),
              ],
              [
                literal('build'),
                t(
                  'Assemblages, vérifications, tests et distribution.',
                  'Assembly, verification, tests and distribution.',
                ),
              ],
              [
                literal('clean'),
                t(
                  'Supprime les résultats du build dans build/gradle ; ne désinstalle pas le profil du jeu.',
                  'Removes build outputs in build/gradle; does not uninstall the game profile.',
                ),
              ],
            ],
          ),
          code(
            '.\\gradlew.bat windowsTest assembleReleaseMod verifyNativeMod\n.\\gradlew.bat packageMod',
            t('Vérifier puis préparer la distribution', 'Verify then prepare distribution'),
            'powershell',
          ),
          text(
            t(
              'Les tâches dépendantes peuvent être UP-TO-DATE si leurs entrées n’ont pas changé. Le ZIP se trouve dans build/gradle/distributions, porte le nom <modId>-<version>-windows-x64.zip et contient un dossier racine <modId>-<version>.',
              'Dependent tasks may be UP-TO-DATE when inputs have not changed. The ZIP is in build/gradle/distributions, is named <modId>-<version>-windows-x64.zip and contains a <modId>-<version> root directory.',
            ),
          ),
          text(t(
            'Ces commandes s’exécutent à la racine du projet, avec son wrapper Gradle. windowsTest vérifie vos cas de test ; verifyNativeMod vérifie le chargement du paquet ; packageMod produit le ZIP à transmettre. Aucun de ces résultats ne prouve à lui seul le comportement visuel ou la conduite dans une partie : terminez par la recette du paquet exact, puis activez le profil depuis le Hub.',
            'Run these commands at the project root using its Gradle wrapper. windowsTest checks your test cases; verifyNativeMod checks package loading; packageMod produces the ZIP to distribute. None alone proves appearance or driving behaviour in a game: finish by testing the exact package, then activate the profile from the Hub.',
          )),
        ],
      },
      {
        id: 'publication',
        title: t('Descripteur local et URL de publication', 'Local descriptor and publication URL'),
        blocks: [
          text(
            t(
              'hubManifest écrit project.json et project-windows-x64.json. Leur url désigne par défaut le nom local du ZIP. Leur taille et leur SHA-256 sont calculés à partir du fichier produit, pas saisis dans mod.json.',
              'hubManifest writes project.json and project-windows-x64.json. By default their url names the local ZIP. Size and SHA-256 are calculated from the produced file, not entered in mod.json.',
            ),
          ),
          text(
            t(
              'L’option Gradle releaseBaseUrl sert au flux de publication des dépôts officiels. Dans cette version du plugin, elle accepte uniquement https://github.com/NimbyRails-France/<id>/releases/download/v<version>, avec id et version de mod.json, et y ajoute le nom du ZIP. Elle prépare une URL ; elle ne publie rien. Pour un autre hébergement, conservez le descripteur local et utilisez le processus de distribution de votre projet.',
              'The releaseBaseUrl Gradle option serves the official repository publication workflow. In this plugin version it accepts only https://github.com/NimbyRails-France/<id>/releases/download/v<version>, using mod.json id and version, and appends the ZIP name. It prepares a URL; it does not publish anything. For other hosting, retain the local descriptor and use your project’s distribution process.',
            ),
          ),
          links(
            {
              label: t('Préparer une version distribuée', 'Prepare a distributed version'),
              to: '/maintenance/distribution',
            },
            {
              label: t('Diagnostiquer une erreur de build', 'Diagnose a build error'),
              to: '/maintenance/journaux',
            },
          ),
        ],
      },
    ],
  },
]
