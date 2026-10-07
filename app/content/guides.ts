import type { Article } from './schema'
import { text, code, note, list, table, links } from './schema'
import firstMod from './snippets/FirstMod.kt?raw'
import signalModels from './snippets/SignalModels.kt?raw'
import approachSignal from './snippets/ApproachSignal.kt?raw'
import blinkSignal from './snippets/BlinkSignal.kt?raw'
import connection from './snippets/jvm/Connection.kt?raw'

export const guides: Article[] = [
  {
    slug: 'commencer/bienvenue',
    title: 'Comprendre le SDK',
    group: 'Commencer',
    description:
      'Ce que vous écrivez, ce que le SDK prend en charge et comment choisir votre point de départ.',
    sections: [
      {
        id: 'votre-mod',
        title: 'Vous écrivez le comportement',
        blocks: [
          text(
            'Un mod définit des modèles de signaux, leurs réglages, leurs images et leurs règles. Le SDK lit les observations du jeu, résout les liens entre signaux et transmet les décisions. Les vitesses, permissions et règles de signalisation appartiennent au mod.',
          ),
          note(
            'Cette documentation décrit le SDK 0.8 en développement pour Windows. La séparation des plateformes est conservée dans le code ; Linux ne fait pas partie des distributions actuelles.',
          ),
        ],
      },
      {
        id: 'deux-usages',
        title: 'Deux façons d’utiliser Kotlin',
        blocks: [
          table(
            ['Usage', 'API', 'Exécution'],
            [
              [
                'Créer un mod de signalisation',
                'nimby · signalMod',
                'Kotlin/Native, exécuté dans un processus isolé par mod',
              ],
              [
                'Créer un outil, un TCO ou un banc de test',
                'fr.nimby.sdk · NimbyClient',
                'Application Kotlin/JVM connectée au processus du jeu',
              ],
            ],
          ),
          text(
            'Ces deux API servent des contextes différents. Le mod n’a pas besoin de rechercher le processus ni de charger manuellement la DLL SDK. L’application JVM ouvre une connexion explicite et la ferme avec use.',
          ),
          links(
            { label: 'Créer mon premier mod', to: '/commencer/premier-mod' },
            { label: 'Trouver la bonne fonction', to: '/commencer/possibilites' },
            { label: 'Lire les données depuis une application', to: '/lire/connexion' },
          ),
        ],
      },
      {
        id: 'kotlin',
        title: 'Les bases Kotlin utiles',
        blocks: [
          table(
            ['Écriture', 'Signification'],
            [
              ['val', 'Une valeur que l’on ne réaffecte pas.'],
              ['fun', 'Une fonction.'],
              ['enum class', 'Une liste de valeurs nommées : Closed, Open…'],
              ['data class', 'Un ensemble de propriétés, copiable avec copy().'],
              ['Type?', 'La valeur peut être absente (null).'],
              ['when', 'Choisir un résultat selon plusieurs conditions.'],
              ['List<Type>', 'Une collection d’éléments de ce type.'],
              ['{ … }', 'Un bloc de configuration ou une fonction passée en paramètre.'],
            ],
          ),
          code(
            'val speedMps: Double? = null\nval label = speedMps?.let { "${it * 3.6} km/h" } ?: "Indisponible"',
          ),
          text(
            'Ne remplacez pas une vitesse inconnue par zéro pour prendre une décision : une absence de mesure n’est pas une preuve d’arrêt.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'commencer/installation',
    title: 'Préparer son projet',
    group: 'Commencer',
    description:
      'Installez les outils, créez votre propre projet Gradle et reliez-le au SDK Kotlin.',
    sections: [
      {
        id: 'outils',
        title: 'Installer le SDK et les outils',
        blocks: [
          list(
            'Installez IntelliJ IDEA et un JDK 21. Dans IntelliJ, choisissez ce JDK pour Gradle.',
            'Dans le Hub, installez le SDK et le loader pour le jeu. Choisissez le canal correspondant à votre version de mod.',
            'Dans les réglages développeur du Hub, choisissez Télécharger un kit Kotlin, puis Télécharger et utiliser. Le kit de compilation est distinct du SDK installé dans le jeu.',
          ),
          links(
            { label: 'Télécharger le Hub', to: 'https://releases.nimbyrails-france.fr/' },
            {
              label: 'Versions distribuées',
              to: 'https://releases.nimbyrails-france.fr/',
            },
            { label: 'Sources et versions du SDK', to: 'https://github.com/NimbyRails-France/sdk' },
          ),
          note(
            'Le kit contient sdk.json, les bibliothèques Kotlin, le pont natif et gradle-repository. Recopiez son chemin dans nrfSdkDir. Pour utiliser une modification locale du SDK, ajoutez son projet au profil développeur du Hub, compilez le SDK, puis recompilez les mods avec le kit sélectionné par cette construction. Activez ensuite le profil, jeu fermé.',
          ),
          note(
            'Cette documentation suit le SDK 0.9.0-alpha.1. Utilisez un kit de compilation et un SDK installé issus du même build pour les exemples de cette branche. Le catalogue du Hub indique les versions effectivement distribuées ; cette documentation ne constitue pas une annonce de publication.',
            'Version de ce guide',
          ),
          text(
            'Le plugin Gradle fournit l’adaptateur natif. Vous n’écrivez ni exports DLL ni code C++ pour votre mod. Le premier build peut télécharger le compilateur Kotlin/Native.',
          ),
        ],
      },
      {
        id: 'ouvrir',
        title: 'Créer votre projet dans IntelliJ',
        blocks: [
          list(
            'Choisissez Nouveau projet, Kotlin, puis le système de construction Gradle avec Kotlin DSL. Nommez le projet mon-premier-mod et sélectionnez le JDK 21.',
            'Avant de remplacer les fichiers générés, ouvrez le terminal du projet et fixez la version du wrapper avec la commande ci-dessous.',
            'Supprimez le Main.kt de démonstration créé par IntelliJ. Remplacez les fichiers Gradle par les contenus ci-dessous.',
            'Créez gradle.properties à la racine pour indiquer le dossier du kit, puis rechargez les projets Gradle dans IntelliJ.',
          ),
          code(
            '.\\gradlew.bat wrapper --gradle-version 8.14.3',
            'Terminal du projet généré par IntelliJ',
            'powershell',
          ),
          code('nrfSdkDir=C:/NRF/kotlin-sdk', 'gradle.properties', 'properties'),
          code(
            `pluginManagement {
    val sdk = providers.gradleProperty("nrfSdkDir")
        .orElse(providers.environmentVariable("NRF_KOTLIN_SDK"))
        .orNull ?: error("Indiquez le dossier du kit Kotlin dans nrfSdkDir.")
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
            'La version du plugin doit correspondre au champ gradlePluginVersion de sdk.json dans votre kit. Votre projet garde ses propres sources et son propre wrapper Gradle. Il n’a pas besoin d’un dépôt d’exemple.',
          ),
        ],
      },
      {
        id: 'fichiers',
        title: 'Donner une identité au mod',
        blocks: [
          text(
            'Créez mod.json à la racine du projet. Changez le nom, les identifiants et le module pour votre mod. Le hash ci-dessous désigne le binaire de jeu reconnu par ce SDK ; une autre version demande un SDK compatible.',
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
  "sdkMaxExclusive": "0.9.0",
  "gameSha256": ["fff49ac21720abfc824c2b4f68b862727630eb0db71cfe1f9ea8f685d0db10ae"]
}`,
            'mod.json',
            'json',
          ),
          table(
            ['Fichier / dossier à créer', 'Rôle'],
            [
              ['src/main/kotlin/Entry.kt', 'Le point d’entrée createMod() et vos règles.'],
              [
                'construction(states)',
                'Le catalogue de textures et le signal constructible, déclarés dans le modèle Kotlin.',
              ],
              ['assets/closed.svg et assets/open.svg', 'Les images de vos indications.'],
              ['src/test/kotlin/', 'Vos tests de règles, sans partie ouverte.'],
            ],
          ),
          links({ label: 'Écrire et compiler mon premier signal', to: '/commencer/premier-mod' }),
        ],
      },
    ],
  },
  {
    slug: 'commencer/premier-mod',
    title: 'Votre premier mod',
    group: 'Commencer',
    status: 'development',
    description:
      'Un exemple Kotlin complet : un modèle de signal, une case à cocher et deux indications.',
    sections: [
      {
        id: 'exemple',
        title: 'Le fichier Entry.kt',
        blocks: [
          text(
            'Dans le projet que vous venez de créer, ajoutez src/main/kotlin/Entry.kt. Ce premier signal pédagogique s’ouvre lorsque son canton est connu libre et reste fermé lorsque les données manquent.',
          ),
          code(firstMod, 'src/main/kotlin/Entry.kt'),
          note(
            'Le package nimby.mod et la fonction createMod sont le point d’entrée attendu par le SDK. Vos enums et vos règles restent du Kotlin ordinaire.',
          ),
        ],
      },
      {
        id: 'ressources',
        title: 'Créer le signal et ses images',
        blocks: [
          text(
            'Le modèle déclare construction(states = listOf("closed.svg", "open.svg")). Le SDK génère mod.txt pendant la compilation : ne créez plus ce fichier dans assets. Ajoutez seulement les deux images ci-dessous.',
          ),
          code('construction(states = listOf("closed.svg", "open.svg"))', 'Dans le modèle Kotlin'),
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
            'Vous pouvez dessiner vos propres SVG ; conservez leurs noms ou modifiez ensemble construction et images. Le guide du paquet généré explique tous les champs et la conservation des indices.',
          ),
          links({ label: 'Générer le paquet depuis Kotlin', to: '/mods/paquet-genere' }),
        ],
      },
      {
        id: 'compiler',
        title: 'Construire votre mod',
        blocks: [
          code(
            '.\\gradlew.bat assembleReleaseMod verifyNativeMod',
            'Terminal à la racine de votre projet',
            'powershell',
          ),
          text(
            'assembleReleaseMod produit le paquet dans build/gradle/mod/release. verifyNativeMod vérifie le chargement, l’arrêt et le rechargement des DLL dans un hôte de diagnostic, sans ouvrir le jeu.',
          ),
          text(
            'Ajoutez ensuite votre projet dans le profil développeur du Hub, renseignez le même kit Kotlin et construisez puis lancez ce profil. Activez les ressources de votre mod dans le jeu et placez votre signal. La validation du comportement en partie reste une étape distincte.',
          ),
          links({ label: 'Écrire des tests pour vos règles', to: '/maintenance/tests' }),
        ],
      },
      {
        id: 'lire',
        title: 'Lire le code',
        blocks: [
          list(
            'signalModel déclare un modèle, ses enums et ses replis pour les données manquantes.',
            'signalMod assemble le paquet ; signal ajoute chaque modèle constructible.',
            'checkbox crée un réglage et renvoie une référence utilisable avec enabled.',
            'rules reçoit les observations du signal et renvoie une Indication.',
            'images choisit l’image ; driving choisit la consigne de conduite.',
          ),
          text(
            'Le code du mod reste du Kotlin ordinaire. Vous pouvez extraire une règle dans une fonction, utiliser des when et écrire des tests sans connaître l’adaptateur natif.',
          ),
        ],
      },
      {
        id: 'suite',
        title: 'Construire progressivement',
        blocks: [
          links(
            { label: 'Ajouter plusieurs types de signaux', to: '/mods/signaux' },
            { label: 'Configurer les réglages', to: '/mods/reglages' },
            { label: 'Tester les règles', to: '/maintenance/tests' },
          ),
        ],
      },
    ],
  },
  {
    slug: 'mods/signaux',
    title: 'Signaux et réseau',
    group: 'Créer un mod',
    status: 'development',
    description:
      'Plusieurs modèles dans un mod, des règles locales et des décisions liées au signal suivant.',
    sections: [
      {
        id: 'organisation',
        title: 'Garder la même composition pour chaque modèle',
        blocks: [
          text(
            'Le point d’entrée assemble les modèles avec signalMod. Chaque modèle a son dossier et les mêmes rôles. Commencez avec peu de fichiers, puis séparez les rôles ci-dessous quand le modèle grandit ; les fonctions Kotlin se branchent directement dans signalModel.',
          ),
          table(
            ['Rôle', 'Contenu du modèle'],
            [
              ['Déclaration', 'Identité, catalogue, replis et raccordement des fonctions au SDK.'],
              [
                'États et motifs',
                'Deux enums locales et éventuellement un alias Indication pour la décision.',
              ],
              [
                'Panneau et réglages',
                'Cases visibles, libellés et valeurs utilisées par les règles.',
              ],
              ['Règles', 'Choix de la décision à partir du contexte SDK et du voisin.'],
              ['Textures', 'Choix des SVG et de leur cadence ; le SDK anime les images.'],
              ['Conduite et vitesses', 'Consigne générique et valeurs choisies par votre modèle.'],
              ['Diagnostics', 'Décisions considérées comme des anomalies.'],
            ],
          ),
          text(
            'Les intégrations facultatives communes à plusieurs modèles appartiennent au niveau du mod. Ne recopiez pas le contexte SDK, le parcours du réseau ou un moteur de freinage dans chaque dossier. Le SDK prépare ces informations et exécute les consignes ; les règles restent chez vous.',
          ),
        ],
      },
      {
        id: 'types',
        title: 'Un modèle, ses propres enums',
        blocks: [
          code(signalModels, 'Deux modèles avec leurs propres types'),
          text(
            'Chaque modèle possède ses enums d’indication et de motif, ses replis, ses règles, ses images et ses consignes. Le mod ne fait que les assembler. Ses cases sont locales : deux modèles peuvent avoir une case active avec des défauts différents.',
          ),
          text(
            'Cet exemple illustre le dialogue entre deux modèles fictifs. Il ne fournit aucune consigne de conduite : ajoutez driving selon vos règles et déclarez les quatre SVG dans votre catalogue de ressources.',
          ),
          table(
            ['Élément', 'Rôle', 'Exemple fictif'],
            [
              ['Mod', 'Paquet installé, identité et liste des modèles.', 'mon-reseau'],
              [
                'Type de signal',
                'Règles, cases et catalogue propres à un modèle constructible.',
                'mon-reseau.principal',
              ],
              [
                'Signal posé',
                'Une instance de ce type sur une voie, avec son ID et ses réglages.',
                'Un signal choisi dans une partie',
              ],
            ],
          ),
          text(
            'Créer un nouveau type ne nécessite pas de créer un autre mod. Choisissez un ID de mod distinct de ceux des types. Un fichier par modèle permet de faire évoluer ses règles sans ajouter des conditions partout dans le point d’entrée.',
          ),
          note(
            'Le runtime accepte jusqu’à 16 types par mod et le service UI jusqu’à 16 panneaux au total. Chaque type accepte jusqu’à 64 cases. La résolution Kotlin est bornée à 512 signaux par appel.',
          ),
        ],
      },
      {
        id: 'reseau',
        title: 'Comprendre next',
        blocks: [
          text(
            'Le SDK tente d’abord une décision locale avec next = null. Si votre règle renvoie null, il résout le signal suivant et rappelle la règle avec sa décision. Un lien absent ou un cycle sans décision locale utilise invalidNetwork. Une fermeture locale peut donc interrompre la dépendance au voisin.',
          ),
          code(
            'val voisin = next?.of(mainSignal)\n// Indication<MainAspect, MainReason>?\n// null : pas ce modèle (ou pas encore de voisin).\nval idDuVoisin = next?.id\nval typeDuVoisin = next?.type?.id\nval consigneDuVoisin = next?.drivingRule',
            'Dans la règle du modèle amont',
          ),
          text(
            'Le SDK fournit directement next à tous les modèles : ID, type, décision et consigne déclarée par le voisin. Aucun adaptateur ni fichier Neighbours à écrire. Vous pouvez lire sa consigne générique ou utiliser of(mainSignal) pour ses enums. Le modèle amont reste responsable de son interprétation et du repli pour les informations inconnues.',
          ),
          text(
            'Le contexte fournit aussi settings, observation, fresh et settingsStatus. Un signal connu sans valeurs sauvegardées reçoit les défauts déclarés avec le statut Present ; Unavailable rend l’observation non fraîche. Absent désigne un signal absent du catalogue observé. next concerne le lien aval résolu dans le réseau du mod, pas tous les signaux géographiquement proches ni les décisions privées des autres mods.',
          ),
          text(
            'Une règle qui dépend du voisin doit aussi décider comment traiter ses propres observations inconnues. Le SDK ne transforme pas automatiquement un canton inconnu en canton libre.',
          ),
        ],
      },
      {
        id: 'approche',
        title: 'Observer un train en approche',
        blocks: [
          code(approachSignal),
          text(
            'Ce fichier définit un modèle et son catalogue avec construction. Pour en faire un mod chargeable, ajoutez le point d’entrée ci-dessous dans votre projet préparé avec le guide d’installation. Ajoutez open.svg et closed.svg dans assets, comme dans le premier mod.',
          ),
          code(
            'package nimby.mod\n\nimport nimby.*\nimport wiki.approach.approachSignal\n\nfun createMod() = signalMod(modInfo) {\n    metadata(author = "Your name", description = "Approach-controlled signal.")\n    signal(approachSignal)\n}',
            'src/main/kotlin/Entry.kt',
          ),
          text(
            'Déclarez observeApproach(blocks = 2) dans le modèle, puis utilisez trainApproaching dans rules. Le SDK recherche une tête orientée vers le signal dans les deux cantons en amont et valide son identifiant. Avec des données absentes, invalides ou non fraîches, trainApproaching vaut false. approachingTrain fournit aussi l’identifiant validé si vous en avez besoin, sinon null. Aucun décalage de bits n’est nécessaire.',
          ),
          text(
            'La portée accepte de 1 à 16 cantons. Le parcours suit le sens de marche et s’arrête devant une branche ambiguë ; après le passage de la tête, ce train ne compte plus comme une approche. Cette observation ne prouve ni voie libre, ni réservation, ni permission de mouvement. Le mod décide du traitement d’un aval inconnu. Les propriétés observeApproach et approachBlocks restent disponibles pour les déclarations existantes.',
          ),
          text(
            'Le SDK observe ensemble les types de votre mod et limite la lecture des voies à leurs cantons utiles, y compris la portée en amont déclarée par chaque modèle. Vous n’avez pas à créer une boucle de lecture ni à multiplier la portée quand le jeu accélère. L’arrêt, le franchissement et la marche à vue sont suivis pendant les pas de simulation natifs ; une observation périmée ne devient jamais une autorisation. Les captures restent des observations successives, pas une image atomique de tout le jeu.',
          ),
          note(
            'Ne confondez pas blocks, qui observe en amont, avec signalsAhead dans une consigne de conduite, qui désigne une cible en aval. Deux cantons peuvent être courts ou longs : ce réglage exprime un nombre de cantons, pas une distance ni une durée.',
          ),
          links({ label: 'Tous les types de contexte', to: '/reference/signalmodel' }),
        ],
      },
    ],
  },
  {
    slug: 'mods/outils-optionnels',
    title: 'Coopérer avec un autre mod',
    group: 'Créer un mod',
    status: 'experimental',
    description: 'Un bouton facultatif, un service Kotlin et deux mods qui restent indépendants.',
    sections: [
      {
        id: 'bouton',
        title: 'Proposer une action si le fournisseur est présent',
        blocks: [
          code(
            'signalModel("mon-reseau.principal", "Signal principal", "mes_textures",\n    fallback = Indication(Aspect.Closed, Reason.Unknown)) {\n    action("inspecter", "Inspecter ce signal",\n        whenMod = "mon-inspecteur", service = "inspect.v1")\n    rules { Indication(Aspect.Closed, Reason.Unknown) }\n    images { "closed.svg" }\n}',
            'Dans votre déclaration signalModel',
          ),
          text(
            'Le SDK affiche le bouton seulement si mon-inspecteur déclare inspect.v1 et dispose d’une observation fraîche de la même partie. Son absence masque le bouton. Elle ne désactive aucune règle du signal et n’ajoute aucune dépendance obligatoire au paquet.',
          ),
          note(
            'Cette API appartient au SDK de développement. Utilisez le kit du même build que le SDK installé : le numéro de version seul ne garantit pas la présence des derniers ajouts. Les interactions natives restent à qualifier en jeu.',
          ),
        ],
      },
      {
        id: 'outil',
        title: 'Créer votre propre fournisseur',
        blocks: [
          code(
            'package nimby.mod\n\nimport nimby.*\n\nfun createMod() = toolMod(modInfo) {\n    metadata(author = "Your name", description = "Inspect a selected signal.")\n    service("inspect.v1") { demande ->\n        log("Signal choisi : ${demande.signalId}")\n        showPanel(demande, "Signal sélectionné", listOf(\n            ToolButton("actualiser", "Actualiser")\n        ))\n    }\n}',
            'src/main/kotlin/Entry.kt',
          ),
          text(
            'Un outil possède son propre projet et son propre mod.json, préparés comme dans le tutoriel d’installation. Il ne déclare pas de faux type de signal. Le bloc service reçoit les clics, y compris ceux de ses nouveaux boutons : demande.action indique lequel a été choisi.',
          ),
          text(
            'Le SDK appelle le service sur le worker de l’outil. Il copie les messages et rejette les clics périmés lors d’un changement de partie, d’un déchargement du fournisseur ou d’un remplacement des boutons. Il n’exécute pas le code du mod depuis le thread d’affichage.',
          ),
          links({ label: 'Préparer un projet', to: '/commencer/installation' }),
        ],
      },
      {
        id: 'contexte',
        title: 'Lire et agir depuis le callback',
        blocks: [
          table(
            ['Appel', 'Usage'],
            [
              [
                'network()',
                'Obtenir une nouvelle copie du réseau et de ses métriques disponibles.',
              ],
              [
                'showPanel(demande, message, boutons, inputs = champs)',
                'Remplacer votre action par un message, au maximum 12 boutons et 4 champs numériques.',
              ],
              ['log(message)', 'Écrire un événement dans le journal des mods.'],
              [
                'onTick { … }',
                'Suivre une opération en cours sans dépendre d’un clic supplémentaire.',
              ],
              ['onStop { … }', 'Libérer la mémoire propre à l’outil lors de son arrêt.'],
            ],
          ),
          text(
            'Conservez les valeurs copiées, pas le ToolContext du callback. Les propriétés worldId et generation servent à invalider vos mémoires lorsque la partie change. Un clic ne donne pas à lui seul l’autorisation de construire.',
          ),
          code(
            'var distance = 500 // État conservé par votre outil, hors du callback.\n\n// Dans votre service :\nif (demande.action == "distance") {\n    demande.value?.let { distance = it }\n    // Invalider ici tout aperçu calculé avec l’ancienne distance.\n}\nshowPanel(demande, "Distance choisie : $distance m",\n    buttons = listOf(ToolButton("apercu", "Calculer un aperçu")),\n    inputs = listOf(ToolNumberInput("distance", "Distance (m)", distance, 10, 5000))\n)',
            'Champ numérique',
          ),
          text(
            'Pour construire : préparez un ticket, capturez le réseau après la préparation, calculez les positions et demandez une confirmation. Une réponse Pending se suit avec pollConstruction sur le même ticket. Ne renvoyez pas createSignals après une réponse incertaine. La pose utilise le pont Windows expérimental.',
          ),
          text(
            'Le SDK conserve le panneau et les saisies pendant une interruption des observations. Les commandes sont alors désactivées ; elles restent soumises à une capture fraîche et à la validation du ticket de construction. Un outil peut republier le même panneau dans onTick : une publication identique ne supprime pas les clics en attente. La fermeture du menu est un état à conserver jusqu’à une action explicite du joueur.',
          ),
          text(
            'Pour montrer les positions avant confirmation, appelez showSignalPreview avec la demande et votre liste de SignalPosition. Le SDK utilise le modèle du signal source sans construire de signal. Renouvelez la publication dans onTick avec son nouveau contexte : elle expire après deux secondes. clearSignalPreview retire votre aperçu. Un seul aperçu est actif à la fois ; les couches visibles et le cadrage du jeu restent appliqués.',
          ),
          code(
            '// Dans le callback du service, positions a été calculé par votre outil.\nshowSignalPreview(demande, positions)\n\n// Avant de construire, de changer de source ou de masquer l’aperçu :\nclearSignalPreview()',
            'Aperçu temporaire sur la carte — Windows',
          ),
          links(
            { label: 'Types des services', to: '/reference/modservices' },
            { label: 'Contexte et construction', to: '/reference/toolcontext' },
          ),
        ],
      },
    ],
  },
  {
    slug: 'mods/reglages',
    title: 'Réglages et migration',
    group: 'Créer un mod',
    status: 'development',
    description:
      'Déclarer les cases du panneau du signal et conserver les réglages des parties existantes.',
    sections: [
      {
        id: 'case',
        title: 'Une case avec un défaut explicite',
        blocks: [
          code(
            'val active = checkbox(\n    name = "active",\n    label = "Activer",\n    description = "Utiliser les règles de ce modèle.",\n    defaultValue = true\n)\nrules {\n    if (enabled(active)) Indication(Aspect.Open, Reason.Clear)\n    else Indication(Aspect.Closed, Reason.Disabled)\n}',
            'Extrait simplifié : ajoutez les contrôles d’observation de votre mod',
          ),
          table(
            ['Statut', 'Sens'],
            [
              [
                'Present',
                'Les valeurs effectives sont disponibles, y compris les défauts d’un signal connu sans profil sauvegardé.',
              ],
              [
                'Absent',
                'Le signal est absent du catalogue observé ; aucun profil effectif ne peut lui être attribué.',
              ],
              ['Unavailable', 'Le SDK ne peut pas fournir le profil.'],
            ],
          ),
          text(
            'enabled utilise le défaut déclaré si la clé est absente. Il ne transforme pas Unavailable en profil valide. Votre règle conserve l’accès à settingsStatus et aux valeurs brutes via signal.settings.',
          ),
        ],
      },
      {
        id: 'migration',
        title: 'Changer les réglages sans perdre les parties',
        blocks: [
          code(
            'migrateSettings { saved ->\n    if ("active" in saved) saved\n    else saved + ("active" to (saved["ancienActive"] ?: false))\n}',
          ),
          text(
            'La migration reçoit les valeurs réellement sauvegardées et doit être idempotente : la relancer ne doit plus changer le résultat. Les valeurs par défaut sont complétées par le SDK. Conservez les identifiants de type et de catalogue pour retrouver les profils.',
          ),
          note(
            'onlyWhenEnabled = true permet une case d’acquittement visible uniquement tant qu’elle vaut true, par exemple pour demander la vérification d’une ancienne configuration. Ce mécanisme ne doit pas inventer une permission ferroviaire.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'mods/images',
    title: 'Images et clignotement',
    group: 'Créer un mod',
    status: 'development',
    description: 'Choisir les textures du catalogue et les animer avec le temps de la simulation.',
    sections: [
      {
        id: 'images',
        title: 'Associer une image à une indication',
        blocks: [
          code(
            'images { indication ->\n    when (indication.aspect) {\n        Aspect.Closed -> "closed.svg"\n        Aspect.Open -> "open.svg"\n    }\n}',
          ),
          text(
            'Ces chemins doivent exister dans le catalogue déclaré pour ce modèle. Avec signalModel, chaque modèle possède ses propres enums et son propre callback images : deux modèles peuvent avoir un ordinal identique sans partager leurs images. Ne comparez pas directement les codes numériques de modèles différents.',
          ),
        ],
      },
      {
        id: 'clignoter',
        title: 'Animer sur l’horloge du jeu',
        blocks: [
          code(
            'val fixed = steady("closed.svg")\nval flashing = blink(on = "on.svg", off = "off.svg", everyMs = 500)\n\nappearance { indication ->\n    if (indication.aspect == Aspect.Closed) fixed else flashing\n}',
          ),
          text(
            'everyMs est la durée de chaque image, entre 100 et 10 000 millisecondes simulées : 500 donne 500 ms allumé puis 500 ms éteint, soit un cycle d’une seconde. Le SDK transmet cette durée au rendu du jeu. La pause fige la phase, l’accélération suit le temps simulé et les signaux de même cadence sont synchronisés. Les deux images doivent appartenir au catalogue du modèle.',
          ),
          code(blinkSignal, 'Un modèle complet avec une cadence de 250 ms'),
          text(
            'Ajoutez ce modèle à signalMod avec signal(blinkingSignal). Son catalogue textures_clignotantes doit déclarer closed.svg, on.svg et off.svg. Pour créer le paquet, reprenez le point d’entrée du guide d’approche en important wiki.blinking.blinkingSignal ; vous pouvez aussi assembler les deux modèles dans le même mod.',
          ),
          text(
            'steady et blink retournent SignalAnimation. Déclarez les descriptions une fois puis renvoyez-les depuis appearance, comme dans cet exemple. frameAt(simulationMs) permet de vérifier une image sans lancer le jeu ; un temps négatif est refusé. Le choix de texture ne donne jamais une permission de conduite.',
          ),
          note(
            'animatedImages reste disponible pour les callbacks existants. Le rendu en jeu historique utilise deux images échantillonnées à sa demi-période ; utilisez appearance et blink pour déclarer une cadence propre au modèle. Recompilez le mod avec le nouveau kit et utilisez son adaptateur associé : un ancien adaptateur refuse ces nouveaux mods au lieu d’afficher une animation incorrecte.',
          ),
          links({
            label: 'SignalAnimation : paramètres et types',
            to: '/reference/signalanimation',
          }),
        ],
      },
    ],
  },
  {
    slug: 'mods/conduite',
    title: 'Consignes de conduite',
    group: 'Créer un mod',
    description:
      'Le SDK fournit des opérations génériques. Votre mod choisit les vitesses et les conditions de libération.',
    sections: [
      {
        id: 'choix',
        title: 'Décrire une consigne',
        blocks: [
          table(
            ['Fonction', 'Effet'],
            [
              ['stop()', 'Arrêt absolu au signal courant.'],
              ['clear()', 'Libération des consignes qui attendent explicitement un Clear.'],
              [
                'announceStop(…)',
                'Objectif d’arrêt au signal cible, avec les permissions choisies par le mod.',
              ],
              ['limitAtSignal(…)', 'Plafond ponctuel au signal.'],
              [
                'limitUntilClearThenRear(…)',
                'Plafond retenu jusqu’au dégagement arrière d’un Clear franchi.',
              ],
              [
                'restrictedUntilNextSignal(…)',
                'Plafond avec couverture physique vérifiée jusqu’au signal suivant.',
              ],
            ],
          ),
          text(
            'Ces fonctions construisent une DrivingRule. Elles ne lisent pas le jeu et ne publient rien seules : renvoyez leur résultat dans le callback driving du mod.',
          ),
        ],
      },
      {
        id: 'vitesses',
        title: 'Les vitesses viennent du mod',
        blocks: [
          code(
            'val passageKmh = 25.0 // Exemple choisi par CE mod, pas une règle du SDK.\nval rule = AutomaticDriving.announceStop(\n    signalsAhead = 1,\n    passageSpeedMps = passageKmh / 3.6,\n    passableHere = false,\n    followTargetSpeed = true\n)',
          ),
          text(
            'Toutes les vitesses des consignes sont en m/s. signalsAhead accepte 1 ou 2 pour une annonce. passableHere concerne le panneau courant ; le panneau annoncé doit fournir sa propre permission. cancelAtNextClear exige followTargetSpeed et une cible à deux signaux.',
          ),
        ],
      },
      {
        id: 'limites',
        title: 'Une consigne n’est pas une permission native',
        blocks: [
          note(
            'Une marche à vue exige une couverture physique fraîche de la voie libre. Sous Windows, l’autorisation explicite du mod remplace le verrou d’occupation et de réservation sur la voie suivie. Les conflits de voies croisées et les contrôles d’itinéraire natifs restent bloquants. Le mod choisit quand autoriser ce mouvement ; le SDK maintient le freinage avant les obstacles.',
          ),
          links(
            {
              label: 'Signatures et paramètres AutomaticDriving',
              to: '/reference/automaticdriving',
            },
            { label: 'Recettes et commandes de contrôle', to: '/lire/recettes' },
          ),
        ],
      },
    ],
  },
  {
    slug: 'lire/connexion',
    title: 'Connexion et observations',
    group: 'Lire et agir',
    description: 'Lire le réseau depuis une application Kotlin/JVM, sans écrire de code natif.',
    sections: [
      {
        id: 'simple',
        title: 'L’entrée conseillée : Nimby.connect',
        blocks: [
          code(
            'import fr.nimby.sdk.Nimby\nimport java.nio.file.Path\n\nfun observer(sdk: Path, trainId: Long) {\n    Nimby.connect(sdk).use { game ->\n        val train = game.trains.read(trainId)\n        println(train?.speedMps)\n        println(game.clock.read()?.toInstant())\n    }\n}',
          ),
          text(
            'Sans processId, connect exige un seul jeu ouvert. Game regroupe trains, clock, signals, mods et construction. game.advanced donne accès aux opérations détaillées de NimbyClient sur la même connexion ; ne le fermez pas séparément.',
          ),
          links({ label: 'Game : toutes les fonctions par usage', to: '/reference/nimby' }),
        ],
      },
      {
        id: 'ouvrir',
        title: 'Choisir explicitement le jeu',
        blocks: [
          code(connection, 'Connection.kt — lecture ciblée des vitesses'),
          text(
            'Passez le chemin réel de la DLL SDK installée et le processId choisi parmi Nimby.runningGames(). Si plusieurs jeux sont ouverts, demandez à l’utilisateur de choisir : ne sélectionnez pas le premier silencieusement. Cette requête lit les vitesses sans demander les services, lieux, horaires ou catalogues optionnels.',
          ),
          note(
            'Ce chapitre concerne les outils JVM. Le point d’entrée createMod du mod de signalisation reçoit ses observations automatiquement.',
          ),
        ],
      },
      {
        id: 'capture',
        title: 'Une capture contient des copies Kotlin',
        blocks: [
          text(
            'capture(selectedTrainId) retourne trains, voies, gares, signaux, services, quais, occupations et réservations observables. Un identifiant de train optionnel permet de demander son chemin et ses arrêts de ligne. Les résultats restent utilisables après fermeture de la connexion.',
          ),
          text(
            'null signifie indisponible, pas vide. Certaines listes non optionnelles du client sont toutefois normalisées à emptyList lorsque leur table native est indisponible : n’utilisez pas leur absence pour prouver que le monde est vide. Une capture externe ne garantit pas un tick atomique du jeu.',
          ),
          links(
            { label: 'Propriétés de toutes les observations', to: '/reference/observation' },
            { label: 'Fonctions du client', to: '/reference/nimbyclient' },
          ),
        ],
      },
    ],
  },
  {
    slug: 'lire/trains',
    title: 'Lire un train',
    group: 'Lire et agir',
    description:
      'Une lecture ciblée de la vitesse, de la position et des caractéristiques du matériel.',
    sections: [
      {
        id: 'cible',
        title: 'Lire uniquement le train demandé',
        blocks: [
          code(
            'fun afficherTrain(client: fr.nimby.sdk.NimbyClient, trainId: Long) {\n    val sample = client.readTrain(trainId) ?: return\n    val measuredSpeed = sample.speedMps\n    val dynamics = sample.currentDynamics\n    println(measuredSpeed?.let { "${it * 3.6} km/h" } ?: "Vitesse inconnue")\n    println(dynamics?.lengthM?.let { "$it m" } ?: "Longueur inconnue")\n}',
          ),
          text(
            'Cette lecture ne capture pas toutes les tables du réseau et n’installe pas de hook. Elle peut retourner null si le train est absent ou les données instables. Un mauvais identifiant ou une erreur de connexion déclenche une exception.',
          ),
        ],
      },
      {
        id: 'contrat',
        title: 'Comprendre les valeurs',
        blocks: [
          table(
            ['Valeur', 'Contrat'],
            [
              [
                'speedMps',
                'Vitesse en m/s, optionnelle. speedDefaulted distingue le zéro de présentation natif.',
              ],
              [
                'purchasedDynamics / currentDynamics',
                'Deux observations indépendantes : ne pas remplacer l’une par l’autre.',
              ],
              [
                'TrainDynamics',
                'Caractéristiques déclarées, pas performances mesurées ni masse chargée.',
              ],
              [
                'sessionGeneration',
                'Génération locale à cette connexion ; réinitialiser vos mémoires lors d’un changement et d’une reconnexion.',
              ],
              ['elapsedBeginMillis / elapsedEndMillis', 'Intervalle simulé encadrant la lecture.'],
              ['capturedAtMillis', 'Horodatage système, différent du temps du jeu.'],
            ],
          ),
          links({
            label: 'Tous les champs TrainDynamics et DrivingObservation',
            to: '/reference/drivingobservation',
          }),
        ],
      },
    ],
  },
  {
    slug: 'lire/voies',
    title: 'Voies et distances',
    group: 'Lire et agir',
    description: 'Convertir une position sur une voie en mètres avec TrackMetric.',
    sections: [
      {
        id: 'position',
        title: 'Fraction et sens',
        blocks: [
          text(
            'Position identifie une voie, une fraction entre 0 et 1 sur cette voie et un sens. Le mètre zéro est celui de la représentation de la voie, pas la tête du train. Pour la construction, le sens vaut -1 ou 1 et la fraction doit rester strictement entre les extrémités.',
          ),
          code(
            'import fr.nimby.sdk.TrackMetric\n\nfun distanceSurVoie(metric: TrackMetric): Double {\n    val depart = metric.fraction(100.0) // 100 m depuis l’origine de la voie\n    val arrivee = metric.fraction(200.0)\n    return metric.distanceM(depart, arrivee) // 100 m\n}',
            'Exemple pour une voie longue d’au moins 200 m',
          ),
        ],
      },
      {
        id: 'disponibilite',
        title: 'Une longueur doit être observée',
        blocks: [
          code(
            'fun longueur(snapshot: fr.nimby.sdk.Observation, trackId: Long): Double? =\n    snapshot.trackMetrics?.firstOrNull { it.trackId == trackId }?.lengthM',
          ),
          text(
            'trackMetrics peut être null si la DLL est ancienne ou le profil non pris en charge. Une ligne manquante reste inconnue. Une longueur ne prouve ni la continuité du trajet, ni l’absence d’aiguille, ni une autorisation de construire.',
          ),
          links({
            label: 'TrackMetric : types, paramètres et validation',
            to: '/reference/trackmetric',
          }),
        ],
      },
    ],
  },
  {
    slug: 'lire/horloge',
    title: 'Horloge de simulation',
    group: 'Lire et agir',
    description: 'Lire le temps du jeu et changer sa date depuis un outil Kotlin.',
    sections: [
      {
        id: 'lire',
        title: 'Lire une date UTC',
        blocks: [
          code(
            'val date = client.readSimulationClock()?.toInstant()\nprintln(date ?: "Horloge indisponible")',
          ),
          text(
            'SimulationClock contient epochSeconds et ticks. Un tick représente un centième de seconde. toInstant combine les deux et accepte une époque antérieure à 1970 ; des ticks négatifs sont rejetés.',
          ),
        ],
      },
      {
        id: 'changer',
        title: 'Modifier explicitement le calendrier',
        blocks: [
          code(
            'val result = client.setSimulationDateTime(\n    java.time.Instant.parse("2026-09-27T12:00:00Z"),\n    recalculateTrains = false\n)\nprintln(result.clock.toInstant())',
          ),
          text(
            'L’entrée doit être en secondes UTC entières, sans nanosecondes. Le runtime préserve la phase sous-seconde native. recalculateTrains demande en plus le recalcul natif des trains ; interventions indique son résultat compté.',
          ),
          note(
            'Cette commande écrit dans le jeu et n’est pas réessayée automatiquement. Une erreur peut survenir après un travail partiel : relisez l’état avant de décider d’une nouvelle commande.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'lire/recettes',
    title: 'Recettes et contrôle',
    group: 'Lire et agir',
    description:
      'Tester un mod déjà chargé : forcer une indication, modifier une case ou appliquer une contrainte temporaire.',
    sections: [
      {
        id: 'session',
        title: 'Acquérir une session temporaire',
        blocks: [
          code(
            'fun testerSignal(client: fr.nimby.sdk.NimbyClient, modId: String, signalId: Long, aspect: Int) {\n    client.acquireModControl(modId, leaseMillis = 5000).use { recipe ->\n        recipe.forceSignal(signalId, aspect)\n        val state = recipe.readSignal(signalId)\n        println(state.detail)\n        recipe.restoreSignal(signalId)\n    }\n}',
          ),
          text(
            'Le mod doit être actif pour le jeu choisi et avoir observé un monde. Les codes d’indication et indices de case appartiennent au mod. Le SDK ne devine pas la signification d’un nombre. Le mod peut refuser un forçage.',
          ),
        ],
      },
      {
        id: 'expiration',
        title: 'Durée, restauration et erreurs',
        blocks: [
          list(
            'Le bail dure de 1 000 à 60 000 ms. Renouvelez-le explicitement avec renew si la recette dure plus longtemps.',
            'close libère le contrôle ; l’expiration abandonne également les surcharges temporaires.',
            'restoreSignal, restoreTrain et restoreSetting retirent une surcharge ciblée. clear les retire toutes pour cette session.',
            'Une erreur de transport ne déclenche pas de nouvelle écriture automatique. Inspectez les observations et le statut.',
          ),
          note(
            'readSignal retourne la dernière décision évaluée. readTrain.active encode un TrainControlState : ce n’est pas une autorisation native de mouvement.',
          ),
          links({ label: 'Commandes, modes et réponses', to: '/reference/modcontrol' }),
        ],
      },
      {
        id: 'texture',
        title: 'Affichage temporaire uniquement',
        blocks: [
          code(
            'client.showSignalTextureFor(signalId, catalogue, "test.svg", durationMillis = 5000)\n// Plus tard :\nclient.restoreSignalTexture(signalId)',
          ),
          text(
            'Cette commande change l’affichage pour 1 à 60 secondes. Elle ne change ni les règles du mod ni les permissions du signal. Pour tester le comportement, utilisez une recette de contrôle acceptée par le mod.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'lire/construction',
    title: 'Placement de signaux',
    group: 'Lire et agir',
    status: 'experimental',
    description:
      'Prévisualiser sans construire, confirmer une série, suivre son ticket et annuler quand le jeu le permet.',
    sections: [
      {
        id: 'cycle',
        title: 'Préparer, créer, observer',
        blocks: [
          code(
            'val confirmed = positions.toList()\nval ready = client.prepareConstruction(sourceSignal)\nif (ready.state == fr.nimby.sdk.ConstructionState.READY) {\n    val fresh = client.capture()\n    val recalculated = planPositions(fresh, sourceSignal)\n    if (recalculated == confirmed) {\n        val result = client.createSignals(ready.token, sourceSignal, confirmed)\n        println(result.state)\n        // Si PENDING, consulter pollConstruction(result.token).\n        // Ne jamais répéter createSignals pour attendre la réponse.\n    } else {\n        println("Preview changed: request confirmation again.")\n    }\n}',
          ),
          text(
            'Dans cet extrait, positions est la liste confirmée par l’utilisateur et planPositions est votre fonction de calcul, pas une API du SDK. Elle doit vérifier la session, les longueurs, les raccords et les exclusions sur la nouvelle capture. Conservez ready.token même si createSignals lève une exception.',
          ),
          text(
            'Le paquet Windows du SDK inclut le pont expérimental correspondant. Une série contient au maximum 64 positions distinctes sur des voies valides, fractions strictement entre 0 et 1 et sens -1 ou 1. Les tickets appartiennent à une session de jeu et à sa révision de construction. Après prepareConstruction, relisez le réseau et comparez le nouveau calcul à l’aperçu confirmé avant createSignals.',
          ),
        ],
      },
      {
        id: 'annuler',
        title: 'Annuler seulement la bonne série',
        blocks: [
          text(
            'undoConstruction(token) refuse si une autre commande a remplacé la série au sommet de l’historique natif. Vérifiez canUndo et l’état retourné. READY, APPLIED, UNDONE, REJECTED, PARTIAL et PENDING sont distincts.',
          ),
          note(
            'Le panneau accepte une saisie entière au clavier, un résumé et des aperçus temporaires sur la carte. Les tests automatisés contrôlent le transport et le cycle de vie ; ils ne valident pas visuellement chaque zoom, couche ou géométrie du jeu.',
          ),
          links({ label: 'Résultats et états de construction', to: '/reference/construction' }),
          links({ label: 'Boutons et outils optionnels', to: '/mods/outils-optionnels' }),
          links({
            label: 'Projet Signal Placement',
            to: 'https://github.com/NimbyRails-France/signal-placement',
          }),
        ],
      },
    ],
  },
  {
    slug: 'maintenance/tests',
    title: 'Tester son mod',
    group: 'Maintenance',
    description: 'Vérifier les règles en Kotlin avant les essais dans une vraie partie.',
    sections: [
      {
        id: 'unitaire',
        title: 'Tester sans lancer le jeu',
        blocks: [
          code(
            'import kotlin.test.Test\nimport kotlin.test.assertEquals\nimport nimby.*\n\nclass SignalTests {\n    @Test fun unknownBlockStaysClosed() {\n        val mod = nimby.mod.createMod()\n        val decision = mod.evaluate(\n            mapOf("active" to true),\n            Observation(block = Occupancy.Unknown, fresh = true, routeKnown = true)\n        )\n        assertEquals(nimby.mod.Aspect.Closed.ordinal, decision.aspect)\n    }\n}',
          ),
          text(
            'Lancez les tests Kotlin/Native Windows du projet Gradle. Testez les données inconnues, la péremption, les réglages absents, les liens manquants et les cycles, en plus du cas nominal. evaluateNetwork permet de fournir plusieurs Signal et de vérifier leurs décisions ensemble.',
          ),
        ],
      },
      {
        id: 'reel',
        title: 'Séparer les niveaux de validation',
        blocks: [
          table(
            ['Vérification', 'Ce qu’elle prouve'],
            [
              ['Tests des règles', 'Le résultat du code Kotlin sur les observations fournies.'],
              ['Tests du pont natif', 'La transmission des types et le cycle de vie des DLL.'],
              [
                'Recette en partie',
                'Le comportement sur le binaire et la sauvegarde réellement utilisés.',
              ],
            ],
          ),
          text(
            'Des tests unitaires verts ne prouvent pas qu’une nouvelle interaction avec l’interface native fonctionne en partie. Consignez le scénario, le résultat attendu, le résultat observé et les versions.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'maintenance/journaux',
    title: 'Journaux et dépannage',
    group: 'Maintenance',
    description:
      'Fournir des éléments utiles pour reproduire un problème et identifier la couche concernée.',
    sections: [
      {
        id: 'emplacement',
        title: 'Retrouver les journaux',
        blocks: [
          text(
            'Le client JVM écrit par défaut dans %LOCALAPPDATA%/NimbyRailsFrance/logs/<composant>/. La variable NRF_LOG_DIR permet de choisir une autre racine. DiagnosticLog produit des fichiers par processus avec rotation.',
          ),
          code(
            'val log = fr.nimby.sdk.DiagnosticLog.forComponent("mon-outil")\nlog.startApplication("0.1.0") // Une fois, au démarrage de votre application.\nlog.write("Chargement du profil terminé")',
          ),
          note(
            'startApplication installe un gestionnaire global d’exceptions et un hook d’arrêt JVM. Utilisez-le au point d’entrée de votre application, pas dans une bibliothèque chargée chez un autre programme.',
          ),
        ],
      },
      {
        id: 'rapport',
        title: 'Un rapport reproductible',
        blocks: [
          list(
            'Version du SDK, du mod, de l’outil et du jeu ; version de Windows.',
            'Étapes exactes, comportement attendu et comportement observé.',
            'Identifiants des objets concernés et heure de l’incident.',
            'Journaux du composant et, si utile, ceux du loader et du hub.',
          ),
          text(
            'Un journal peut contenir des chemins locaux et des noms de données du jeu. Relisez ce que vous partagez. Les erreurs JVM et les crashs natifs ne produisent pas les mêmes diagnostics.',
          ),
          links({ label: 'DiagnosticLog : méthodes et rotation', to: '/reference/diagnosticlog' }),
        ],
      },
    ],
  },
]
