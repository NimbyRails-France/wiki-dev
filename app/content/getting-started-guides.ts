import type { Article } from './schema'
import { text, code, note, list, table, links } from './schema'
import firstMod from './snippets/FirstMod.kt?raw'

export const gettingStartedEnglish: Record<string, string> = {}
const t = (fr: string, en: string) => {
  gettingStartedEnglish[fr] = en
  return fr
}
const literal = (value: string) => t(value, value)

export const gettingStartedGuides: Article[] = [
  {
    slug: 'commencer/bienvenue',
    title: t('Comprendre le SDK', 'Understand the SDK'),
    group: 'Commencer',
    description: t(
      'Choisissez une API pour créer des signaux, des outils en jeu ou une application connectée.',
      'Choose an API for signals, in-game tools or a connected application.',
    ),
    sections: [
      {
        id: 'votre-mod',
        title: t('Du comportement au résultat visible', 'From behaviour to a visible result'),
        blocks: [
          text(
            t(
              'Le SDK permet de décrire un signal et ses règles, d’ajouter un outil au jeu ou de consulter une partie depuis une application Kotlin. Ce manuel part de ces résultats : il présente les données disponibles, les opérations autorisées et la manière de vérifier votre projet. Quelques bases de Kotlin suffisent pour commencer le premier signal.',
              'The SDK lets you describe a signal and its rules, add an in-game tool, or read a game from a Kotlin application. This manual starts with those outcomes: available data, supported operations and ways to verify your project. Basic Kotlin knowledge is enough to start the first signal.',
            ),
          ),
          text(
            t(
              'Vous choisissez les indications, les vitesses, les images, les réglages et les règles métier. Le SDK fournit les observations et les fonctions de haut niveau qui appliquent vos décisions. Une information inconnue doit rester inconnue ; votre modèle définit explicitement son comportement de repli.',
              'You choose aspects, speeds, images, settings and domain rules. The SDK provides observations and high-level functions to apply your decisions. Unknown information must remain unknown; your model explicitly defines its fallback behaviour.',
            ),
          ),
          note(
            t(
              'Cette documentation décrit le SDK 0.9.0-alpha.1 en développement pour Windows x64. Elle ne signifie pas que cette version est déjà distribuée. Pour compiler et essayer un exemple, utilisez le kit et le SDK installé correspondant au même build. Aucun kit Linux complet n’est annoncé comme validé ici.',
              'This documentation describes the Windows x64 SDK 0.9.0-alpha.1 in development. It does not mean that this version is already distributed. To build and try an example, use a kit and installed SDK from the same build. No complete Linux kit is claimed as validated here.',
            ),
            t('Version documentée', 'Documented version'),
          ),
        ],
      },
      {
        id: 'deux-usages',
        title: t('Choisir le bon point d’entrée', 'Choose the right entry point'),
        blocks: [
          table(
            [
              t('Votre projet', 'Your project'),
              literal('API'),
              t('Point de départ', 'Starting point'),
            ],
            [
              [
                t('Mod de signalisation', 'Signalling mod'),
                literal('nimby · Kotlin/Native'),
                literal('signalModel → signalMod → createMod'),
              ],
              [
                t(
                  'Outil avec boutons et panneaux dans le jeu',
                  'Tool with in-game buttons and panels',
                ),
                literal('nimby · Kotlin/Native'),
                literal('toolMod → ToolContext'),
              ],
              [
                t(
                  'Application externe : supervision, analyse ou test',
                  'External application: monitoring, analysis or testing',
                ),
                literal('fr.nimby.sdk · Kotlin/JVM'),
                literal('Nimby.connect → Game'),
              ],
            ],
          ),
          text(
            t(
              'Les deux API Kotlin ont des types distincts. Un outil intégré au jeu utilise nimby, comme un mod de signaux. Une application externe utilise fr.nimby.sdk, ouvre sa connexion et la ferme lorsqu’elle a terminé. Consultez toujours l’étiquette Native ou JVM de la référence avant de copier un import.',
              'The two Kotlin APIs have distinct types. An in-game tool uses nimby, just like a signal mod. An external application uses fr.nimby.sdk, opens its connection and closes it when finished. Always check the Native or JVM label in the reference before copying an import.',
            ),
          ),
          links(
            {
              label: t('Préparer un projet Native', 'Set up a Native project'),
              to: '/commencer/installation',
            },
            {
              label: t('Connexion d’une application JVM', 'Connect a JVM application'),
              to: '/lire/connexion',
            },
            {
              label: t('Choisir un parcours', 'Choose a learning path'),
              to: '/commencer/parcours',
            },
          ),
        ],
      },
      {
        id: 'kotlin',
        title: t('Les bases Kotlin utilisées dans les exemples', 'Kotlin basics used in examples'),
        blocks: [
          table(
            [t('Écriture', 'Syntax'), t('Lecture', 'Meaning')],
            [
              [
                literal('val'),
                t(
                  'Une référence que l’on ne réaffecte pas.',
                  'A reference that is not reassigned.',
                ),
              ],
              [
                literal('fun'),
                t(
                  'Une fonction avec des paramètres et un résultat.',
                  'A function with parameters and a result.',
                ),
              ],
              [
                literal('enum class'),
                t(
                  'Des valeurs nommées pour vos indications ou motifs.',
                  'Named values for your aspects or reasons.',
                ),
              ],
              [
                literal('data class'),
                t(
                  'Des propriétés regroupées, avec copie explicite par copy().',
                  'Grouped properties, with an explicit copy() operation.',
                ),
              ],
              [
                literal('Type?'),
                t('Une valeur qui peut être absente : null.', 'A value that may be absent: null.'),
              ],
              [
                literal('when'),
                t(
                  'Choisir un résultat selon les conditions.',
                  'Choose a result based on conditions.',
                ),
              ],
              [
                literal('List<Type>'),
                t(
                  'Une collection d’éléments du même type.',
                  'A collection of elements of the same type.',
                ),
              ],
              [
                literal('{ … }'),
                t(
                  'Une configuration ou un bloc de comportement transmis à une fonction.',
                  'Configuration or behaviour passed to a function.',
                ),
              ],
            ],
          ),
          note(
            t(
              'Une vitesse absente n’est pas une vitesse nulle. De même, une liste vide ne prouve l’absence d’objets que si la requête correspondante a bien été effectuée et son résultat accepté.',
              'An absent speed is not zero speed. Likewise, an empty list proves that there are no objects only if the corresponding query was performed and its result accepted.',
            ),
          ),
          links({
            label: t('Vocabulaire des guides', 'Guide vocabulary'),
            to: '/commencer/glossaire',
          }),
        ],
      },
    ],
  },
  {
    slug: 'commencer/installation',
    title: t('Préparer son projet', 'Set up your project'),
    group: 'Commencer',
    description: t(
      'Créez un projet Kotlin/Native indépendant, relié au kit SDK choisi dans le Hub.',
      'Create an independent Kotlin/Native project using the SDK kit selected in the Hub.',
    ),
    sections: [
      {
        id: 'outils',
        title: t('Préparer les outils et le kit', 'Prepare the tools and kit'),
        blocks: [
          list(
            t(
              'Utilisez Windows x64, IntelliJ IDEA et un JDK 21. Sélectionnez ce JDK comme JVM de Gradle dans IntelliJ.',
              'Use Windows x64, IntelliJ IDEA and JDK 21. Select that JDK as the Gradle JVM in IntelliJ.',
            ),
            t(
              'Dans le Hub, préparez le SDK du jeu et sélectionnez un kit Kotlin correspondant. Le kit sert à compiler ; le SDK installé sert à exécuter vos mods.',
              'In the Hub, prepare the game SDK and select a matching Kotlin kit. The kit builds your mods; the installed SDK runs them.',
            ),
            t(
              'Dans les réglages développeur, utilisez « Télécharger un kit Kotlin », puis « Télécharger et utiliser ». Conservez le chemin du dossier contenant sdk.json.',
              'In developer settings, use “Download a Kotlin kit”, then “Download and use”. Keep the path to the directory containing sdk.json.',
            ),
          ),
          note(
            t(
              'La chaîne de ce guide utilise JDK 21, Gradle 8.14.3 et Kotlin/Native 2.2.20 fourni par la configuration du plugin. Le premier build peut télécharger les outils Kotlin. Le kit doit correspondre aux API et au binaire de jeu que vous souhaitez utiliser.',
              'This guide uses JDK 21, Gradle 8.14.3 and Kotlin/Native 2.2.20 selected by the plugin configuration. The first build may download Kotlin tools. The kit must support the APIs and game executable you intend to use.',
            ),
          ),
          links({
            label: t(
              'Télécharger le Hub et consulter les versions',
              'Download the Hub and browse versions',
            ),
            to: 'https://releases.nimbyrails-france.fr/',
          }),
        ],
      },
      {
        id: 'creer-avec-le-hub',
        title: t('Créer un projet avec le Hub', 'Create a project with the Hub'),
        blocks: [
          note(
            t(
              'Cet assistant est prévu dans le Hub 0.4.2-alpha.2, en préparation avec cette édition du SDK. Ce guide ne signifie pas que cette version est déjà publiée. Si votre Hub ne propose pas « Créer un projet », utilisez le parcours manuel ci-dessous.',
              'This assistant is planned for Hub 0.4.2-alpha.2, being prepared with this SDK edition. This guide does not mean that version is already published. If your Hub does not offer “Create a project”, use the manual workflow below.',
            ),
          ),
          list(
            t(
              'Sélectionnez le profil « Développer ». Dans Paramètres, choisissez « Projets locaux de mods » et le « Kit SDK Kotlin pour compiler » correspondant au SDK à utiliser. Le chemin d’IntelliJ est facultatif pour créer le projet.',
              'Select the “Develop” profile. In Settings, choose “Local mod projects” and the matching “Kotlin SDK kit for builds”. An IntelliJ path is optional when creating the project.',
            ),
            t(
              'Dans Mods, cliquez sur « Créer un projet », puis choisissez « Signal » pour un modèle de signal ou « Outil en jeu » pour un outil accessible dans NIMBY Rails.',
              'In Mods, click “Create a project”, then choose “Signal” for a signal model or “In-game tool” for a tool available inside NIMBY Rails.',
            ),
            t(
              'Renseignez l’identifiant, le nom, l’auteur, la description et la version initiale. Un identifiant comme mon-premier-mod utilise des lettres minuscules, des chiffres et des tirets, en commençant par une lettre. Vérifiez le dossier à créer et la version du kit affichés.',
              'Enter the ID, name, author, description and initial version. An ID such as my-first-mod uses lowercase letters, digits and hyphens, starting with a letter. Check the displayed destination directory and kit version.',
            ),
            t(
              'Cliquez sur « Créer le projet ». Le Hub prépare mod.json, Gradle et son wrapper, Entry.kt et les tests. Le modèle Signal comprend aussi ses textures dans assets. Choisissez un nouvel identifiant et un nouveau dossier : un projet existant n’est pas remplacé.',
              'Click “Create project”. The Hub prepares mod.json, Gradle and its wrapper, Entry.kt and tests. The Signal template also includes textures in assets. Choose a new ID and directory: an existing project is not replaced.',
            ),
            t(
              'Dans la fiche du projet, utilisez « Compiler », puis « Ouvrir dans IntelliJ » pour personnaliser les sources. La création prépare le projet ; la compilation prépare son paquet local. Gardez un kit de compilation et un SDK installé compatibles avant les essais en jeu.',
              'On the project card, use “Build”, then “Open in IntelliJ” to customize the sources. Creation prepares the project; building prepares its local package. Keep the build kit and installed SDK compatible before testing in the game.',
            ),
          ),
          text(
            t(
              'Le projet généré peut ensuite être modifié comme n’importe quel projet Kotlin. Les sections suivantes expliquent la création manuelle des mêmes fichiers de base ; elles restent utiles pour comprendre leur rôle et ne sont pas à recopier par-dessus un projet déjà créé.',
              'The generated project can then be edited like any Kotlin project. The following sections explain how to create the same basic files manually; they help explain each file and should not be copied over a project you already created.',
            ),
          ),
          links(
            {
              label: t('Développer le premier signal', 'Develop your first signal'),
              to: '/commencer/premier-mod',
            },
            {
              label: t('Développer un outil en jeu', 'Develop an in-game tool'),
              to: '/mods/cycle-outils',
            },
          ),
        ],
      },
      {
        id: 'ouvrir',
        title: t('Créer le projet Gradle manuellement', 'Create the Gradle project manually'),
        blocks: [
          text(
            t(
              'Dans IntelliJ, créez un projet Kotlin avec Gradle et le DSL Kotlin. Gardez son wrapper Gradle. Avant de remplacer les fichiers générés, exécutez la commande suivante dans son terminal, puis retirez le Main.kt de démonstration.',
              'In IntelliJ, create a Kotlin project with Gradle and the Kotlin DSL. Keep its Gradle wrapper. Before replacing generated files, run the following command in its terminal, then remove the demonstration Main.kt.',
            ),
          ),
          code(
            '.\\gradlew.bat wrapper --gradle-version 8.14.3',
            t('Terminal du projet', 'Project terminal'),
            'powershell',
          ),
          text(
            t(
              'Créez gradle.properties avec le chemin réel de votre kit. Remplacez ensuite settings.gradle.kts et build.gradle.kts par ces contenus et rechargez les projets Gradle.',
              'Create gradle.properties with the actual path to your kit. Then replace settings.gradle.kts and build.gradle.kts with these contents and reload the Gradle projects.',
            ),
          ),
          code('nrfSdkDir=C:/NRF/kotlin-sdk', 'gradle.properties', 'properties'),
          code(
            `pluginManagement {
    val sdk = providers.gradleProperty("nrfSdkDir")
        .orElse(providers.environmentVariable("NRF_KOTLIN_SDK"))
        .orNull ?: error("Configure nrfSdkDir with the Kotlin kit directory.")
    repositories {
        maven { url = uri(file(sdk).resolve("gradle-repository")) }
        gradlePluginPortal()
        mavenCentral()
    }
    val metadata = groovy.json.JsonSlurper()
        .parseText(file(sdk).resolve("sdk.json").readText().removePrefix("\\uFEFF")) as Map<*, *>
    plugins {
        id("fr.nimbyrails.mod") version (metadata["gradlePluginVersion"] as String)
    }
}
dependencyResolutionManagement { repositories { mavenCentral() } }
rootProject.name = "mon-premier-mod"`,
            'settings.gradle.kts',
          ),
          code('plugins { id("fr.nimbyrails.mod") }', 'build.gradle.kts'),
          text(
            t(
              'La version du plugin vient de sdk.json et son dépôt est fourni dans le kit. Vous n’avez pas à choisir séparément une version de Kotlin ni à écrire un adaptateur natif. nrfSdkDir prend priorité sur la variable NRF_KOTLIN_SDK.',
              'The plugin version comes from sdk.json and its repository is included in the kit. You do not need to choose a separate Kotlin version or write a native adapter. nrfSdkDir takes precedence over the NRF_KOTLIN_SDK environment variable.',
            ),
          ),
          note(
            t(
              'Si Gradle ou IntelliJ utilise un autre kit que celui du projet, vérifiez le gradle.properties utilisateur, généralement dans %USERPROFILE%/.gradle (ou GRADLE_USER_HOME). Son nrfSdkDir prend priorité sur le gradle.properties du projet. Pour choisir le kit d’une commande sans changer ces fichiers, passez -PnrfSdkDir=C:/NRF/kotlin-sdk à gradlew.bat, avec votre chemin réel. Le Hub utilise le kit choisi dans ses paramètres lors de « Compiler ». Vérifiez aussi la compatibilité du SDK installé avant de lancer le jeu.',
              'If Gradle or IntelliJ uses a different kit from the project, check the user gradle.properties, usually in %USERPROFILE%/.gradle (or GRADLE_USER_HOME). Its nrfSdkDir takes precedence over the project gradle.properties. To choose the kit for one command without editing these files, pass -PnrfSdkDir=C:/NRF/kotlin-sdk to gradlew.bat with your actual path. The Hub uses the kit selected in its settings when you click “Build”. Also check the installed SDK for compatibility before launching the game.',
            ),
          ),
        ],
      },
      {
        id: 'fichiers',
        title: t('Déclarer l’identité et la compatibilité', 'Declare identity and compatibility'),
        blocks: [
          text(
            t(
              'Créez ce manifeste à la racine du projet. Les identifiants décrivent votre mod ; gameSha256 décrit les binaires du jeu avec lesquels vous le validez. La valeur de cet exemple correspond au jeu pris en charge par le kit documenté : elle ne permet pas de déclarer un autre binaire compatible.',
              'Create this manifest at the project root. The identifiers describe your mod; gameSha256 describes the game executables against which you validate it. This example value matches the game supported by the documented kit; it cannot be used to declare a different executable compatible.',
            ),
          ),
          code(
            `{
  "id": "mon-premier-mod",
  "name": "Mon premier mod",
  "modId": "MonPremierMod",
  "module": "MonPremierMod",
  "version": "0.1.0",
  "language": "kotlin-native",
  "sdkMin": "0.9.0-alpha.1",
  "sdkMaxExclusive": "0.10.0",
  "gameSha256": ["fff49ac21720abfc824c2b4f68b862727630eb0db71cfe1f9ea8f685d0db10ae"]
}`,
            'mod.json',
            'json',
          ),
          table(
            [t('À créer ensuite', 'Create next'), t('Contenu', 'Contents')],
            [
              [
                literal('src/main/kotlin/Entry.kt'),
                t(
                  'Le point d’entrée nimby.mod.createMod() et le modèle du premier signal.',
                  'The nimby.mod.createMod() entry point and first signal model.',
                ),
              ],
              [
                literal('assets/closed.svg · assets/open.svg'),
                t(
                  'Les deux images référencées par le modèle.',
                  'The two images referenced by the model.',
                ),
              ],
              [
                literal('src/test/kotlin/'),
                t(
                  'Les tests des décisions, indépendants du jeu.',
                  'Decision tests that are independent of the game.',
                ),
              ],
            ],
          ),
          links(
            {
              label: t('Écrire le premier signal', 'Write your first signal'),
              to: '/commencer/premier-mod',
            },
            {
              label: t('Contrat complet du projet Gradle', 'Full Gradle project contract'),
              to: '/reference/projet-gradle',
            },
          ),
        ],
      },
      {
        id: 'activer',
        title: t('Construire, vérifier, puis activer', 'Build, verify, then activate'),
        blocks: [
          table(
            [t('Étape', 'Step'), t('Résultat', 'Result')],
            [
              [
                literal('windowsTest'),
                t(
                  'Les règles sont exécutées sur vos données de test.',
                  'Rules run against your test data.',
                ),
              ],
              [
                literal('assembleReleaseMod · verifyNativeMod'),
                t(
                  'Un paquet local est assemblé et son cycle de vie vérifié sans partie ouverte.',
                  'A local package is assembled and its lifecycle checked without an open game.',
                ),
              ],
              [
                t('Profil développeur du Hub', 'Hub developer profile'),
                t(
                  'Le projet est construit avec le kit choisi. L’activation, jeu fermé, prépare les composants pour le prochain lancement.',
                  'The project is built with the selected kit. Activation while the game is closed prepares components for the next launch.',
                ),
              ],
            ],
          ),
          note(
            t(
              'Une compilation réussie ne remplace pas les fichiers d’un jeu déjà lancé. Si le Hub signale des builds incompatibles, sélectionnez le même kit puis reconstruisez les mods concernés avant l’activation.',
              'A successful build does not replace files in an already running game. If the Hub reports incompatible builds, select the same kit and rebuild the affected mods before activation.',
            ),
          ),
        ],
      },
    ],
  },
  {
    slug: 'commencer/premier-mod',
    title: t('Votre premier mod', 'Your first mod'),
    group: 'Commencer',
    status: 'development',
    description: t(
      'Construisez un signal pédagogique à deux indications, avec images, réglage et conduite.',
      'Build a two-aspect teaching signal with images, a setting and driving behaviour.',
    ),
    sections: [
      {
        id: 'exemple',
        title: t('Déclarer le signal en Kotlin', 'Declare the signal in Kotlin'),
        blocks: [
          text(
            t(
              'Prérequis : le projet et mod.json du guide d’installation. Ajoutez le fichier complet ci-dessous. Ce modèle ouvre lorsque son canton est connu libre et que ses autres conditions sont satisfaites ; sinon, il ferme. C’est un point de départ pédagogique, pas la définition d’un système de signalisation complet.',
              'Prerequisite: the project and mod.json from the setup guide. Add the complete file below. This model opens when its block is known clear and its other conditions hold; otherwise it closes. It is a teaching starting point, not a complete signalling system.',
            ),
          ),
          code(firstMod, 'src/main/kotlin/Entry.kt'),
          note(
            t(
              'Le nom et le package de createMod sont attendus par le plugin. modInfo est généré depuis mod.json dans nimby.mod : ne le redéclarez pas. createMod décrit votre mod et doit fonctionner sans partie ouverte, notamment pendant la génération du paquet.',
              'The plugin expects the createMod name and package. modInfo is generated from mod.json in nimby.mod: do not declare it again. createMod describes your mod and must work without an open game, including during package generation.',
            ),
          ),
        ],
      },
      {
        id: 'ressources',
        title: t('Ajouter les deux images', 'Add the two images'),
        blocks: [
          text(
            t(
              'Les noms de fichiers dans construction et images sont relatifs à la racine du paquet. assets est copié à cette racine : assets/closed.svg devient donc closed.svg. Le catalogue mod.txt est généré à partir de la déclaration Kotlin.',
              'File names in construction and images are relative to the package root. assets is copied to that root: assets/closed.svg therefore becomes closed.svg. The mod.txt catalogue is generated from the Kotlin declaration.',
            ),
          ),
          code(
            '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="64" viewBox="0 0 32 64"><rect x="6" y="2" width="20" height="48" rx="10" fill="#161616"/><circle cx="16" cy="15" r="7" fill="#ef4444"/><path d="M16 50v14" stroke="#888" stroke-width="4"/></svg>',
            'assets/closed.svg',
            'xml',
          ),
          code(
            '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="64" viewBox="0 0 32 64"><rect x="6" y="2" width="20" height="48" rx="10" fill="#161616"/><circle cx="16" cy="37" r="7" fill="#22c55e"/><path d="M16 50v14" stroke="#888" stroke-width="4"/></svg>',
            'assets/open.svg',
            'xml',
          ),
          text(
            t(
              'Vous pouvez remplacer les dessins. Si vous changez un nom de fichier, mettez à jour toutes ses références Kotlin. Conservez l’ordre d’un catalogue déjà utilisé par des sauvegardes.',
              'You can replace the artwork. If you change a file name, update all of its Kotlin references. Preserve the order of a catalogue already used by saves.',
            ),
          ),
          links({
            label: t('Catalogue et paquet générés', 'Generated catalogue and package'),
            to: '/mods/paquet-genere',
          }),
        ],
      },
      {
        id: 'compiler',
        title: t('Construire et essayer le signal', 'Build and try the signal'),
        blocks: [
          code(
            '.\\gradlew.bat assembleReleaseMod verifyNativeMod',
            t('Terminal à la racine du projet', 'Terminal at the project root'),
            'powershell',
          ),
          text(
            t(
              'Le paquet est créé dans build/gradle/mod/release. verifyNativeMod vérifie son chargement, son arrêt et son rechargement sans ouvrir le jeu. Ajoutez ensuite le projet à votre profil développeur du Hub, construisez-le avec le même kit et activez le profil lorsque le jeu est fermé.',
              'The package is created in build/gradle/mod/release. verifyNativeMod checks loading, stopping and reloading without opening the game. Then add the project to your Hub developer profile, build it with the same kit and activate the profile while the game is closed.',
            ),
          ),
          list(
            t(
              'Lancez une partie de test avec les ressources du mod activées et placez le signal.',
              'Launch a test game with the mod resources enabled and place the signal.',
            ),
            t(
              'Sur un canton connu libre, vérifiez l’image verte ; avec un canton occupé ou une donnée manquante, vérifiez la fermeture.',
              'On a known clear block, check the green image; with an occupied block or missing data, check closure.',
            ),
            t(
              'Décochez « Activer le signal » : cet exemple demande explicitement la fermeture. Vérifiez aussi la consigne de conduite, pas seulement la couleur.',
              'Clear “Enable signal”: this example explicitly requests closure. Check the driving behaviour as well as the colour.',
            ),
          ),
          note(
            t(
              'La texture et la conduite sont deux décisions distinctes. Une image verte ne suffit pas à prouver que le train a reçu ou appliqué une permission.',
              'Texture and driving are two distinct decisions. A green image alone does not prove that a train received or applied permission.',
            ),
          ),
        ],
      },
      {
        id: 'lire',
        title: t('Lire les responsabilités du modèle', 'Read the model responsibilities'),
        blocks: [
          table(
            [t('Déclaration', 'Declaration'), t('Responsabilité', 'Responsibility')],
            [
              [
                literal('signalModel'),
                t(
                  'Identité du modèle, types d’indication et repli.',
                  'Model identity, aspect types and fallback.',
                ),
              ],
              [
                literal('checkbox → enabled'),
                t(
                  'Réglage déclaré puis lu dans une règle.',
                  'A setting declared and then read by a rule.',
                ),
              ],
              [
                literal('rules → Indication'),
                t(
                  'Décision expliquée par un aspect et un motif.',
                  'A decision explained by an aspect and a reason.',
                ),
              ],
              [
                literal('images'),
                t('Image correspondant à la décision.', 'Image matching the decision.'),
              ],
              [
                literal('driving'),
                t(
                  'Consigne correspondant à la décision.',
                  'Driving instruction matching the decision.',
                ),
              ],
              [
                literal('signalMod → signal'),
                t('Assemblage des modèles dans le mod.', 'Assembly of models into the mod.'),
              ],
            ],
          ),
        ],
      },
      {
        id: 'suite',
        title: t('Développer le modèle', 'Develop the model'),
        blocks: [
          links(
            { label: t('Tester les décisions', 'Test decisions'), to: '/maintenance/tests' },
            { label: t('Organiser les fichiers', 'Organise files'), to: '/mods/structure' },
            {
              label: t('Ajouter des modèles et des voisins', 'Add models and neighbours'),
              to: '/mods/signaux',
            },
            { label: t('Ajouter des réglages', 'Add settings'), to: '/mods/reglages' },
          ),
        ],
      },
    ],
  },
  {
    slug: 'commencer/parcours',
    title: t('Parcours de développement', 'Development paths'),
    group: 'Commencer',
    description: t(
      'Progressez du premier exemple à un projet complet selon ce que vous souhaitez créer.',
      'Progress from a first example to a complete project according to what you want to build.',
    ),
    sections: [
      {
        id: 'signaux',
        title: t('Créer un mod de signaux', 'Create a signal mod'),
        blocks: [
          text(
            t(
              'Objectif : des modèles réutilisables avec règles, réglages, images et conduite testables. Prérequis : Kotlin et le projet Native du guide d’installation.',
              'Outcome: reusable models with testable rules, settings, images and driving. Prerequisite: Kotlin and the Native project from the setup guide.',
            ),
          ),
          links(
            { label: t('1. Premier signal', '1. First signal'), to: '/commencer/premier-mod' },
            { label: t('2. Modèles et réseau', '2. Models and network'), to: '/mods/signaux' },
            { label: t('3. Réglages', '3. Settings'), to: '/mods/reglages' },
            { label: t('4. Images et animation', '4. Images and animation'), to: '/mods/images' },
            { label: t('5. Conduite', '5. Driving'), to: '/mods/conduite' },
            { label: t('6. Tests', '6. Tests'), to: '/maintenance/tests' },
          ),
        ],
      },
      {
        id: 'outils',
        title: t('Créer un outil en jeu', 'Create an in-game tool'),
        blocks: [
          text(
            t(
              'Objectif : guider une action avec un panneau, un aperçu et un résultat vérifiable. Prérequis : le projet Native. Conservez un calcul borné et traitez explicitement chaque opération en attente, refusée ou terminée.',
              'Outcome: guide an action with a panel, a preview and a verifiable result. Prerequisite: the Native project. Keep calculations bounded and explicitly handle each pending, refused or completed operation.',
            ),
          ),
          links(
            {
              label: t('1. Services et outils', '1. Services and tools'),
              to: '/mods/outils-optionnels',
            },
            { label: t('2. Interface', '2. Interface'), to: '/mods/interface' },
            { label: t('3. Cycle d’une action', '3. Action lifecycle'), to: '/mods/cycle-outils' },
            { label: t('4. Parcours des voies', '4. Track traversal'), to: '/mods/parcours-voies' },
            { label: t('5. Tests', '5. Tests'), to: '/maintenance/tests' },
          ),
        ],
      },
      {
        id: 'applications',
        title: t('Créer une application de données', 'Create a data application'),
        blocks: [
          text(
            t(
              'Objectif : interroger les trains et leur contexte sans demander toutes les données à chaque lecture. Prérequis : un projet Kotlin/JVM. Commencez par une connexion fermée proprement, puis ajoutez les groupes de données nécessaires.',
              'Outcome: query trains and their context without requesting every data group on each read. Prerequisite: a Kotlin/JVM project. Start with a properly closed connection, then add the data groups you need.',
            ),
          ),
          links(
            { label: t('1. Connexion', '1. Connection'), to: '/lire/connexion' },
            {
              label: t('2. Requêtes des trains', '2. Train queries'),
              to: '/lire/trains-observations',
            },
            { label: t('3. Lignes et tags', '3. Lines and tags'), to: '/lire/lignes-et-tags' },
            {
              label: t('4. Horaires et retards', '4. Timetables and delays'),
              to: '/lire/horaires-trains',
            },
            { label: t('5. Matériel', '5. Material'), to: '/lire/materiel' },
            { label: t('6. Performance', '6. Performance'), to: '/maintenance/performances' },
          ),
        ],
      },
      {
        id: 'livrer',
        title: t('Préparer une version', 'Prepare a version'),
        blocks: [
          text(
            t(
              'Après les tests, assemblez un paquet vérifié, essayez-le sur une partie de test et documentez ses compatibilités. Les mêmes étapes s’appliquent à un outil Native et à un mod de signalisation.',
              'After testing, assemble a verified package, try it in a test game and document compatibility. The same steps apply to a Native tool and a signalling mod.',
            ),
          ),
          links(
            { label: t('Contrat Gradle', 'Gradle contract'), to: '/reference/projet-gradle' },
            { label: t('Distribution', 'Distribution'), to: '/maintenance/distribution' },
            {
              label: t('Journaux et diagnostic', 'Logs and diagnostics'),
              to: '/maintenance/journaux',
            },
          ),
        ],
      },
    ],
  },
  {
    slug: 'commencer/glossaire',
    title: t('Vocabulaire du SDK', 'SDK vocabulary'),
    group: 'Commencer',
    description: t(
      'Distinguez les notions qui reviennent dans les guides et les contrats d’API.',
      'Distinguish recurring concepts in the guides and API contracts.',
    ),
    sections: [
      {
        id: 'termes',
        title: t('Lire les contrats sans ambiguïté', 'Read contracts unambiguously'),
        blocks: [
          table(
            [t('Terme', 'Term'), t('Sens dans ce manuel', 'Meaning in this manual')],
            [
              [
                t('Kit / SDK installé', 'Kit / installed SDK'),
                t(
                  'Le kit compile votre projet ; le SDK installé permet de l’exécuter avec le jeu.',
                  'The kit builds your project; the installed SDK lets it run with the game.',
                ),
              ],
              [
                t('Mod / modèle / instance', 'Mod / model / instance'),
                t(
                  'Le mod est un paquet ; le modèle décrit un type de signal ; une instance est un signal placé dans la partie.',
                  'A mod is a package; a model describes a signal type; an instance is a signal placed in the game.',
                ),
              ],
              [
                t('Indication / aspect / motif', 'Indication / aspect / reason'),
                t(
                  'Une indication associe le résultat affichable à la raison de ce résultat. Vos enums donnent un sens à ces valeurs.',
                  'An indication associates a displayable result with its reason. Your enums give those values meaning.',
                ),
              ],
              [
                t('Observation / capture', 'Observation / snapshot'),
                t(
                  'Une copie des données demandées à un instant. La conserver ne la met pas à jour.',
                  'A copy of requested data at a point in time. Retaining it does not update it.',
                ),
              ],
              [
                t('Inconnu / absent / non demandé', 'Unknown / absent / not requested'),
                t(
                  'Trois situations distinctes, décrites par chaque contrat. Aucune ne signifie automatiquement zéro, faux ou libre.',
                  'Three distinct situations described by each contract. None automatically means zero, false or clear.',
                ),
              ],
              [
                t('Identité / génération', 'Identity / generation'),
                t(
                  'Un identifiant désigne un objet dans le contexte documenté ; la génération aide à distinguer des mondes ou sessions. Revalidez vos références après un chargement.',
                  'An identifier names an object in its documented context; a generation helps distinguish worlds or sessions. Revalidate references after loading.',
                ),
              ],
              [
                t('Permission / apparence', 'Permission / appearance'),
                t(
                  'Une consigne de conduite et une image sont indépendantes. Modifier une image ne crée pas une permission.',
                  'A driving instruction and an image are independent. Changing an image does not create permission.',
                ),
              ],
              [
                t('Ticket / résultat terminal', 'Ticket / terminal result'),
                t(
                  'Le ticket suit une demande différée. Attendez ou consultez son résultat ; ne renvoyez pas une mutation parce qu’elle est encore en attente.',
                  'A ticket tracks a deferred request. Wait for or inspect its result; do not repeat a mutation merely because it is still pending.',
                ),
              ],
              [
                t('Temps simulé / temps réel', 'Simulated time / real time'),
                t(
                  'La date du jeu suit pause et accélération. La durée réelle sert à mesurer un travail ou à attendre ; ce sont deux échelles différentes.',
                  'The game date follows pause and acceleration. Real duration measures work or waiting; these are two different time scales.',
                ),
              ],
              [
                t('Assemblage / activation / publication', 'Assembly / activation / publication'),
                t(
                  'Produire des fichiers, les installer pour le prochain lancement et les distribuer sont trois opérations distinctes.',
                  'Producing files, installing them for the next launch and distributing them are three distinct operations.',
                ),
              ],
            ],
          ),
          links(
            {
              label: t('Trouver une API par besoin', 'Find an API by need'),
              to: '/commencer/possibilites',
            },
            { label: t('Référence des types', 'Type reference'), to: '/reference' },
          ),
        ],
      },
    ],
  },
  {
    slug: 'commencer/langues-applications',
    title: t('Langues des interfaces et des mods', 'Interface and mod languages'),
    group: 'Commencer',
    description: t(
      'Choisissez la langue de travail et préparez des textes traduisibles sans modifier les identifiants.',
      'Choose a working language and prepare translatable text without changing identifiers.',
    ),
    sections: [
      {
        id: 'choix',
        title: t('Séparer préférences et textes du mod', 'Separate preferences from mod text'),
        blocks: [
          text(
            t(
              'Pour tester un mod bilingue, changez la langue de NIMBY Rails puis vérifiez ses panneaux et ses ressources. La langue du Hub et celle d’une application externe sont des préférences indépendantes.',
              'To test a bilingual mod, change the NIMBY Rails language and check its panels and resources. The Hub language and an external application’s language are independent preferences.',
            ),
          ),
          table(
            [t('Interface', 'Interface'), t('Source de la langue', 'Language source')],
            [
              [
                literal('Hub'),
                t(
                  'Paramètres > Langue : Automatique, Français ou English.',
                  'Settings > Language: Automatic, Français or English.',
                ),
              ],
              [
                literal('TCO'),
                t(
                  'Sélecteur de langue dans l’en-tête, mémorisé sur votre ordinateur.',
                  'Language selector in the header, remembered on your computer.',
                ),
              ],
              [
                t('Mod en jeu', 'In-game mod'),
                t(
                  'Langue de NIMBY Rails, avec le repli déclaré dans assets/translations.json.',
                  'NIMBY Rails language, with the fallback declared in assets/translations.json.',
                ),
              ],
              [
                t('Documentation', 'Documentation'),
                t(
                  'Sélecteur Français / English ; mêmes chemins, exemples et ancres.',
                  'Français / English selector; matching paths, examples and anchors.',
                ),
              ],
            ],
          ),
          note(
            t(
              'Traduisez les libellés, pas les identifiants : id, modId, module, clés de réglage et noms de fichiers doivent rester stables. Les noms de trains et de lignes viennent des données de la partie. Les diagnostics déjà écrits conservent leur texte d’origine.',
              'Translate labels, not identifiers: id, modId, module, setting keys and file names must stay stable. Train and line names come from game data. Existing diagnostics retain their original text.',
            ),
          ),
          links(
            {
              label: t('Traduire les textes du mod', 'Translate mod text'),
              to: '/mods/traductions',
            },
            {
              label: t('Traduire les métadonnées', 'Translate metadata'),
              to: '/mods/metadonnees-traduites',
            },
          ),
        ],
      },
    ],
  },
]
