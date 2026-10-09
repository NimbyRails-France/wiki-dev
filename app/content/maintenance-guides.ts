import type { Article } from './schema'
import { text, code, note, list, table, links } from './schema'

export const maintenanceEnglish: Record<string, string> = {}
const t = (fr: string, en: string) => {
  maintenanceEnglish[fr] = en
  return fr
}
const literal = (value: string) => t(value, value)

export const maintenanceGuides: Article[] = [
  {
    slug: 'maintenance/tests',
    title: t('Tester son mod', 'Test your mod'),
    group: 'Maintenance',
    description: t(
      'Vérifiez les décisions, le paquet et le comportement en partie avec des preuves adaptées à chaque niveau.',
      'Verify decisions, packaging and in-game behaviour with evidence appropriate to each level.',
    ),
    sections: [
      {
        id: 'unitaire',
        title: t(
          'Tester les décisions sans ouvrir le jeu',
          'Test decisions without opening the game',
        ),
        blocks: [
          text(
            t(
              'Prérequis : le premier mod et sa configuration Gradle. Créez le fichier ci-dessous dans le même projet. Le plugin fournit kotlin.test et prépare les ressources pour les tests Windows.',
              'Prerequisite: the first mod and its Gradle configuration. Create the file below in the same project. The plugin supplies kotlin.test and prepares resources for Windows tests.',
            ),
          ),
          code(
            `import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import nimby.*

class SignalTests {
    @Test fun unknownBlockStaysClosed() {
        val mod = nimby.mod.createMod()
        // Une observation fraîche peut avoir une occupation inconnue : conserver le repli.
        val decision = mod.evaluate(
            mapOf("active" to true),
            Observation(block = Occupancy.Unknown, fresh = true, routeKnown = true)
        )
        // Retrouver les valeurs du modèle, sans comparer ses enums à un code numérique.
        val indication = assertNotNull(mod.indication(decision)?.of(nimby.mod.firstSignal))
        assertEquals(nimby.mod.Aspect.Closed, indication.aspect)
        assertEquals(nimby.mod.Reason.Unknown, indication.reason)
    }

    @Test fun knownClearBlockOpens() {
        val mod = nimby.mod.createMod()
        // Cas nominal : réglage actif, route connue et canton explicitement libre.
        val decision = mod.evaluate(
            mapOf("active" to true),
            Observation(block = Occupancy.Clear, fresh = true, routeKnown = true)
        )
        val indication = assertNotNull(mod.indication(decision)?.of(nimby.mod.firstSignal))
        assertEquals(nimby.mod.Aspect.Open, indication.aspect)
        assertEquals(nimby.mod.Reason.Clear, indication.reason)
    }
}`,
            literal('src/test/kotlin/SignalTests.kt'),
          ),
          code(
            '.\\gradlew.bat windowsTest',
            t('Exécuter les tests', 'Run the tests'),
            'powershell',
          ),
          text(
            t(
              'Le premier test vérifie le repli ; le second vérifie le cas nominal. mod.indication(decision)?.of(firstSignal) retrouve les enums du modèle : comparez leurs valeurs typées, jamais le code Decision.aspect à un ordinal local. Les tests vérifient aussi le motif. Pour plusieurs modèles ou des dépendances entre voisins, utilisez evaluateNetwork avec des Signal préparés et vérifiez chaque indication avec son modèle.',
              'The first test checks fallback behaviour; the second checks the normal case. mod.indication(decision)?.of(firstSignal) retrieves the model’s enums: compare their typed values, never the Decision.aspect code to a local ordinal. The tests also check the reason. For multiple models or neighbour dependencies, use evaluateNetwork with prepared Signal values and check each indication against its model.',
            ),
          ),
          table([t('Argument ou résultat', 'Argument or result'), t('Sens dans le test', 'Meaning in the test')], [
            [literal('mapOf("active" to true)'), t('Valeur observée de la case du premier modèle. Ce dictionnaire ne modifie pas les réglages d’une partie.', 'Observed value of the first model’s checkbox. This map does not modify settings in a game.')],
            [literal('Observation.block'), t('Unknown et Clear sont deux états distincts, même lorsque fresh vaut true.', 'Unknown and Clear are distinct states, even when fresh is true.')],
            [literal('fresh / routeKnown'), t('Disponibilité de l’observation et connaissance de l’itinéraire. Modifiez-les séparément pour tester chaque repli.', 'Observation freshness and route knowledge. Change them separately to test each fallback.')],
            [literal('mod.evaluate(...)'), t('Renvoie une Decision calculée sur ces seules données ; cet appel pur ne pose pas un signal.', 'Returns a Decision calculated from these inputs only; this pure call does not place a signal.')],
            [literal('mod.indication(decision)?.of(firstSignal)'), t('Retrouve aspect et reason dans les types du modèle. assertNotNull vérifie d’abord que la décision correspond bien à ce modèle.', 'Retrieves aspect and reason in the model’s types. assertNotNull first checks that the decision really belongs to this model.')],
          ]),
          table(
            [
              t('Situation à fournir au test', 'Test input'),
              t('Résultat à définir', 'Result to define'),
            ],
            [
              [
                t(
                  'Occupation inconnue, observation périmée ou itinéraire inconnu',
                  'Unknown occupancy, stale observation or unknown route',
                ),
                t(
                  'Un repli explicite, sans déduire que la voie est libre.',
                  'An explicit fallback without assuming the track is clear.',
                ),
              ],
              [
                t(
                  'Réglage indisponible, valeur par défaut, bornes numériques',
                  'Unavailable setting, default value, numeric bounds',
                ),
                t(
                  'Une décision cohérente avec le contrat du réglage.',
                  'A decision consistent with the setting contract.',
                ),
              ],
              [
                t(
                  'Voisin absent, autre modèle, chaîne ou cycle',
                  'Missing neighbour, different model, chain or cycle',
                ),
                t(
                  'Une résolution bornée et un repli testable.',
                  'Bounded resolution and a testable fallback.',
                ),
              ],
              [
                t(
                  'Signal fermé pour deux motifs différents',
                  'Signal closed for two different reasons',
                ),
                t(
                  'Les consignes de conduite attendues pour chaque motif.',
                  'The expected driving instruction for each reason.',
                ),
              ],
              [
                t(
                  'Animation juste avant, à et après une limite de phase',
                  'Animation immediately before, at and after a phase boundary',
                ),
                t(
                  'L’image attendue pour un temps simulé fourni explicitement.',
                  'The expected image for an explicitly supplied simulated time.',
                ),
              ],
            ],
          ),
        ],
      },
      {
        id: 'reel',
        title: t('Vérifier chaque niveau séparément', 'Verify each level separately'),
        blocks: [
          table(
            [
              t('Vérification', 'Check'),
              t('Ce qu’elle établit', 'What it establishes'),
              t('Ce qui reste à vérifier', 'What remains to be checked'),
            ],
            [
              [
                literal('windowsTest'),
                t(
                  'Résultat des règles sur les entrées du test.',
                  'Rule results for the test inputs.',
                ),
                t(
                  'Données et comportement dans une vraie partie.',
                  'Data and behaviour in a real game.',
                ),
              ],
              [
                literal('assembleReleaseMod'),
                t(
                  'Production des fichiers et du catalogue du mod.',
                  'Production of mod files and catalogue.',
                ),
                t('Chargement et comportement du paquet.', 'Package loading and behaviour.'),
              ],
              [
                literal('verifyNativeMod'),
                t(
                  'Chargement, arrêt et rechargement hors jeu.',
                  'Loading, stopping and reloading outside the game.',
                ),
                t(
                  'Interactions avec le jeu et son interface.',
                  'Interactions with the game and its interface.',
                ),
              ],
              [
                t('Essai en partie', 'In-game test'),
                t(
                  'Résultat sur la sauvegarde, le SDK et le jeu utilisés.',
                  'Outcome on the save, SDK and game used.',
                ),
                t(
                  'Autres cartes, tailles de réseau et scénarios.',
                  'Other maps, network sizes and scenarios.',
                ),
              ],
            ],
          ),
          text(
            t(
              'Un rapport UP-TO-DATE signifie que Gradle réutilise un résultat dont les entrées sont inchangées. Pour exécuter de nouveau une tâche lors d’une recette précise, utilisez --rerun-tasks et conservez la commande avec le rapport. Ce choix n’est pas nécessaire à chaque modification de texte.',
              'An UP-TO-DATE report means that Gradle reuses a result whose inputs are unchanged. To rerun a task for a specific acceptance test, use --rerun-tasks and retain the command with its report. This is not required for every text change.',
            ),
          ),
          code(
            '.\\gradlew.bat windowsTest verifyNativeMod --rerun-tasks',
            t('Recette avec exécution explicite', 'Acceptance check with explicit execution'),
            'powershell',
          ),
        ],
      },
      {
        id: 'scenario',
        title: t('Rendre un essai en partie reproductible', 'Make an in-game test reproducible'),
        blocks: [
          list(
            t(
              'Préparez une copie ou une sauvegarde de test et notez le point de départ. Conservez les versions du jeu, du SDK et des mods.',
              'Prepare a test copy or save and record the starting point. Retain game, SDK and mod versions.',
            ),
            t(
              'Définissez un résultat observable : indication, consigne appliquée, panneau, objets créés ou résultat de ticket. Fixez aussi le cas de refus attendu.',
              'Define an observable result: aspect, applied driving instruction, panel, created objects or ticket result. Also define the expected refusal case.',
            ),
            t(
              'Essayez la pause, la reprise, plusieurs vitesses et un chargement de partie. Vérifiez que les données de l’ancienne session ne déclenchent pas une action.',
              'Try pause, resume, several speeds and loading a game. Check that old-session data cannot trigger an action.',
            ),
            t(
              'Pour un outil de construction, vérifiez l’aperçu, la confirmation, les résultats partiels, les objets créés et l’annulation autorisée.',
              'For a construction tool, check preview, confirmation, partial results, created objects and permitted undo.',
            ),
            t(
              'Terminez l’essai en fermant vos fenêtres et connexions et en retirant les effets temporaires. Notez ce qui a été restauré.',
              'Finish by closing your windows and connections and removing temporary effects. Record what was restored.',
            ),
          ),
          note(
            t(
              'Pour mesurer une régression, gardez une phase de référence, une phase sollicitée et une phase de récupération comparables. Une durée de requête SDK, une fréquence d’images et un facteur d’accélération du jeu sont des mesures différentes. Un compteur cumulatif maximal ne date pas à lui seul le ralentissement.',
              'To measure a regression, retain comparable baseline, load and recovery phases. SDK request duration, frame rate and game acceleration factor are different measurements. A cumulative maximum alone does not date a slowdown.',
            ),
          ),
          table([t('Exemple de scénario', 'Example scenario'), t('Action', 'Action'), t('Résultat attendu', 'Expected result')], [
            [t('Premier signal', 'First signal'), t('Observer un canton libre, puis une occupation inconnue.', 'Observe a clear block, then an unknown occupancy.'), t('Ouvert dans le premier cas, repli dans le second ; comparer aussi le motif et la consigne.', 'Open in the first case, fallback in the second; also compare the reason and driving instruction.')],
            [t('Outil d’aperçu', 'Preview tool'), t('Afficher, modifier la distance, puis fermer la fenêtre.', 'Show the preview, change the distance, then close the window.'), t('L’ancien aperçu est invalidé, le nouveau correspond aux arguments, et la fermeture enlève les repères.', 'The old preview is invalidated, the new one matches the arguments and closing removes the markers.')],
            [t('Limite de longueur', 'Length limit'), t('Avec 850 m de limite, tenter un total de 800 m puis de 870 m.', 'With an 850 m limit, attempt a total of 800 m and then 870 m.'), t('La règle permet 800 m et refuse 870 m ; le refus conserve la composition précédente.', 'The rule permits 800 m and rejects 870 m; rejection preserves the previous composition.')],
          ]),
          links(
            {
              label: t('Performance et isolation', 'Performance and isolation'),
              to: '/maintenance/performances',
            },
            { label: t('Préparer un rapport', 'Prepare a report'), to: '/maintenance/journaux' },
          ),
        ],
      },
    ],
  },
  {
    slug: 'maintenance/journaux',
    title: t('Journaux et dépannage', 'Logs and troubleshooting'),
    group: 'Maintenance',
    description: t(
      'Ajoutez des diagnostics utiles, trouvez les erreurs pertinentes et préparez un rapport reproductible.',
      'Add useful diagnostics, find relevant errors and prepare a reproducible report.',
    ),
    sections: [
      {
        id: 'emplacement',
        title: t('Retrouver le bon journal', 'Find the right log'),
        blocks: [
          text(
            t(
              'Sous Windows, la racine habituelle est %LOCALAPPDATA%/NimbyRailsFrance/logs/. Cherchez le composant et l’heure de votre essai. Le journal du Hub explique une construction ou une activation ; le journal d’un mod ou d’une application explique son exécution.',
              'On Windows, the usual root is %LOCALAPPDATA%/NimbyRailsFrance/logs/. Find the component and time of your test. The Hub log explains a build or activation; a mod or application log explains its execution.',
            ),
          ),
          text(
            t(
              'DiagnosticLog, côté JVM, écrit dans un dossier par composant et un fichier par processus. NRF_LOG_DIR remplace sa racine ; un root explicite au constructeur permet aussi de choisir le dossier. Les fichiers tournent avec une limite de taille : conservez rapidement les éléments d’un incident.',
              'On the JVM, DiagnosticLog writes to a component directory and a per-process file. NRF_LOG_DIR overrides its root; an explicit constructor root also lets you choose the directory. Files rotate with a size limit: retain incident evidence promptly.',
            ),
          ),
          code(
            `val log = fr.nimby.sdk.DiagnosticLog.forComponent("mon-outil")
log.startApplication("0.1.0")
log.write("Profile loaded")`,
            t('Au démarrage de votre application JVM', 'At JVM application startup'),
          ),
          note(
            t(
              'startApplication s’appelle une fois au point d’entrée de votre application. Il ajoute la version, un gestionnaire global d’exceptions et un événement d’arrêt JVM. Une bibliothèque intégrée dans un autre programme utilise write sans s’approprier son cycle de vie. Un crash natif ne devient pas une exception JVM.',
              'Call startApplication once at your application entry point. It adds version information, a global exception handler and a JVM shutdown event. A library embedded in another program uses write without taking over its lifecycle. A native crash does not become a JVM exception.',
            ),
          ),
        ],
      },
      {
        id: 'ecrire',
        title: t('Journaliser des événements utiles', 'Log useful events'),
        blocks: [
          code(
            'context.log("Preview unavailable", LogLevel.Warning)',
            t(
              'Fragment dans un callback Native avec ToolContext',
              'Fragment in a Native callback with ToolContext',
            ),
          ),
          text(
            t(
              'ToolContext.log accepte un message UTF-8 de 1 à 4 096 octets, sans caractère nul, avec Info, Warning ou Error. Utilisez le contexte uniquement pendant le callback. Consignez un changement d’état, une action demandée, un résultat ou une erreur exploitable ; évitez un message pour chaque lecture réussie.',
              'ToolContext.log accepts a UTF-8 message of 1 to 4,096 bytes, without a null character, using Info, Warning or Error. Use the context only during its callback. Record a state change, requested action, result or actionable error; avoid one message per successful read.',
            ),
          ),
          table([t('Argument', 'Argument'), t('Choix et résultat', 'Choice and result')], [
            [literal('message: String'), t('Décrire l’action et son résultat : "Preview unavailable" indique un refus d’aperçu. Ajoutez l’identité de la source lorsqu’elle permet de retrouver le scénario.', 'Describe the action and its outcome: "Preview unavailable" identifies a refused preview. Add the source identity when it helps reproduce the scenario.')],
            [literal('level: LogLevel'), t('Info pour une action normale, Warning pour un refus récupérable, Error pour un échec à analyser. Le niveau ne relance pas l’opération.', 'Info for a normal action, Warning for a recoverable refusal and Error for a failure to investigate. The level does not retry the operation.')],
            [literal('Unit'), t('L’appel écrit un événement ; il ne renvoie ni une décision de signal ni un résultat de construction.', 'The call records an event; it returns neither a signal decision nor a construction result.')],
          ]),
          text(
            t(
              'DiagnosticLog regroupe les répétitions identiques pendant une courte période. Gardez donc un message stable et ajoutez seulement les informations nécessaires : opération, identifiant concerné, résultat et contexte de session. Ne créez pas un texte unique à chaque tick pour contourner ce regroupement.',
              'DiagnosticLog coalesces identical repetitions over a short period. Keep a stable message and add only the necessary information: operation, affected identity, result and session context. Do not create unique text on every tick to defeat coalescing.',
            ),
          ),
          note(
            t(
              'Un refus temporaire peut faire partie du contrat d’une opération. Il ne justifie ni une boucle immédiate ni la répétition automatique d’une mutation. Consultez le résultat et l’état courant avant de décider de la suite.',
              'A temporary refusal can be part of an operation’s contract. It does not justify an immediate loop or automatic repetition of a mutation. Inspect the result and current state before deciding what to do next.',
            ),
          ),
        ],
      },
      {
        id: 'diagnostic',
        title: t('Relier le symptôme à une vérification', 'Connect the symptom to a check'),
        blocks: [
          table(
            [t('Symptôme', 'Symptom'), t('Première vérification', 'First check')],
            [
              [
                t('Import Kotlin non résolu', 'Unresolved Kotlin import'),
                t(
                  'API Native ou JVM, kit sélectionné, rechargement Gradle et première erreur de configuration.',
                  'Native or JVM API, selected kit, Gradle reload and first configuration error.',
                ),
              ],
              [
                t(
                  'Paquet construit, comportement ancien en jeu',
                  'Package built, old behaviour in game',
                ),
                t(
                  'Profil réellement activé, versions chargées et lancement effectué après l’activation.',
                  'Actually activated profile, loaded versions and launch after activation.',
                ),
              ],
              [
                t('Signal au repli', 'Signal showing fallback'),
                t(
                  'Fraîcheur, disponibilité des réglages, occupation et résolution du voisin avant l’image.',
                  'Freshness, setting availability, occupancy and neighbour resolution before the image.',
                ),
              ],
              [
                t('Outil refusé ou résultat en attente', 'Tool refused or result pending'),
                t(
                  'État de la partie, session et résultat du ticket ; ne pas rejouer la demande sans vérification.',
                  'Game state, session and ticket result; do not replay the request without checking.',
                ),
              ],
              [
                t('Fichier absent après installation', 'File missing after installation'),
                t(
                  'Premier échec de copie ou de vérification et historique de protection correspondant à la même heure.',
                  'First copy or verification failure and protection history at the same time.',
                ),
              ],
            ],
          ),
          note(
            t(
              'Un message « accès refusé » ne permet pas, à lui seul, de conclure à un antivirus, à un fichier utilisé ou à un défaut du mod. Conservez l’erreur initiale et les événements associés avant de choisir une réparation.',
              'An “access denied” message alone does not establish an antivirus block, an in-use file or a mod defect. Retain the initial error and associated events before choosing a repair.',
            ),
          ),
        ],
      },
      {
        id: 'rapport',
        title: t('Fournir un rapport reproductible', 'Provide a reproducible report'),
        blocks: [
          list(
            t(
              'Versions du jeu, du SDK, du kit, du mod et de l’application ; version de Windows.',
              'Game, SDK, kit, mod and application versions; Windows version.',
            ),
            t(
              'Étapes exactes, sauvegarde ou petit scénario, vitesse sélectionnée et actions avant l’incident.',
              'Exact steps, save or small scenario, selected speed and actions before the incident.',
            ),
            t(
              'Résultat attendu et observé, avec heure et fuseau ; identifiants utiles dans la session concernée.',
              'Expected and observed results, with time and time zone; useful identities within the relevant session.',
            ),
            t(
              'Première erreur et lignes qui la précèdent, puis résultat de récupération ou de fermeture.',
              'First error and preceding lines, followed by recovery or shutdown outcome.',
            ),
          ),
          text(
            t(
              'Les journaux peuvent contenir des chemins locaux et des noms de la partie. Relisez le rapport avant partage. Si vous retirez une information personnelle, indiquez-le en conservant les heures, les codes et l’ordre des événements utiles au diagnostic.',
              'Logs may contain local paths and game names. Review the report before sharing it. If you remove personal information, say so while preserving the times, codes and event order needed for diagnosis.',
            ),
          ),
          links(
            { label: literal('DiagnosticLog'), to: '/reference/diagnosticlog' },
            { label: t('Tester son mod', 'Test your mod'), to: '/maintenance/tests' },
          ),
        ],
      },
    ],
  },
  {
    slug: 'maintenance/distribution',
    title: t('Préparer et distribuer une version', 'Prepare and distribute a version'),
    group: 'Maintenance',
    description: t(
      'Produisez un paquet vérifié, expliquez sa compatibilité et distinguez construction, essai et publication.',
      'Produce a verified package, explain compatibility and distinguish building, testing and publishing.',
    ),
    sections: [
      {
        id: 'publication',
        title: t('Construire les fichiers de distribution', 'Build distribution files'),
        blocks: [
          text(
            t(
              'Prérequis : un projet Native avec tests et ressources valides. Choisissez une version dans mod.json, puis générez le paquet. Le plugin exécute les tests et la vérification native nécessaires à cette distribution.',
              'Prerequisite: a Native project with valid tests and resources. Choose a version in mod.json, then generate the package. The plugin runs the tests and native verification required for this distribution.',
            ),
          ),
          code(
            '.\\gradlew.bat packageMod',
            t('Créer une distribution locale', 'Create a local distribution'),
            'powershell',
          ),
          table(
            [t('Fichier produit', 'Output file'), t('Usage', 'Purpose')],
            [
              [
                literal('build/gradle/distributions/<modId>-<version>-windows-x64.zip'),
                t(
                  'Paquet Release avec un dossier racine <modId>-<version>.',
                  'Release package with a <modId>-<version> root directory.',
                ),
              ],
              [
                literal('project.json · project-windows-x64.json'),
                t(
                  'Descripteurs du paquet : identité, compatibilité, taille et SHA-256 calculés.',
                  'Package descriptors: identity, compatibility, calculated size and SHA-256.',
                ),
              ],
            ],
          ),
          text(
            t(
              'Par défaut, le champ url du descripteur est le nom local du ZIP. Le plugin ne téléverse pas les fichiers et ne les installe pas dans le jeu. Un paquet construit devient une version distribuée seulement après son essai et une publication explicite.',
              'By default, the descriptor url field is the local ZIP name. The plugin does not upload files or install them in the game. A built package becomes a distributed version only after testing and explicit publication.',
            ),
          ),
          links({
            label: t('Tâches et options Gradle', 'Gradle tasks and options'),
            to: '/reference/projet-gradle#taches',
          }),
        ],
      },
      {
        id: 'compatibilite',
        title: t('Décrire une version que l’on peut vérifier', 'Describe a verifiable version'),
        blocks: [
          list(
            t(
              'Conservez les identifiants du mod, des modèles et des réglages. Faites évoluer la version du paquet lorsque son contenu change.',
              'Keep mod, model and setting identifiers stable. Change the package version when its contents change.',
            ),
            t(
              'Déclarez une borne sdkMin qui couvre réellement les API utilisées et une borne sdkMaxExclusive testée. Une plage acceptée par le build ne prouve pas tous les comportements en jeu.',
              'Declare an sdkMin that covers the APIs actually used and a tested sdkMaxExclusive upper bound. A range accepted by the build does not prove every in-game behaviour.',
            ),
            t(
              'Validez le paquet exact qui sera distribué, avec le même SDK et le même binaire de jeu. Conservez le ZIP et ses rapports ensemble.',
              'Validate the exact package to be distributed, using the same SDK and game executable. Retain the ZIP and its reports together.',
            ),
            t(
              'Rédigez un changelog français et anglais avec les changements observables, les compatibilités et les limites connues.',
              'Write French and English release notes describing observable changes, compatibility and known limits.',
            ),
          ),
          note(
            t(
              'Ne remplacez pas les fichiers d’une version déjà publiée par un autre contenu portant la même version. Les tailles et empreintes doivent continuer à désigner le paquet vérifié.',
              'Do not replace a published version’s files with different contents under the same version. Sizes and hashes must continue to identify the verified package.',
            ),
          ),
        ],
      },
      {
        id: 'decouverte',
        title: t('Comprendre ce que le Hub découvre', 'Understand what the Hub discovers'),
        blocks: [
          text(
            t(
              'Un build local n’inscrit pas automatiquement un nouveau projet dans un catalogue public. Pour une distribution via le Hub, préparez les fichiers et les métadonnées attendus par le catalogue choisi. Les dépôts officiels NRF disposent de leur propre procédure de publication ; elle ne constitue pas une API du SDK pour tous les auteurs.',
              'A local build does not automatically register a new project in a public catalogue. For Hub distribution, prepare the files and metadata required by the chosen catalogue. Official NRF repositories have their own publication process; it is not an SDK API for all authors.',
            ),
          ),
          text(
            t(
              'Pour les projets proposés par le Hub, la découverte d’une version dépend du catalogue et du canal sélectionné. Une version visible, son téléchargement et son activation sont des étapes distinctes. Vérifiez la compatibilité indiquée et le profil utilisé avant de conclure qu’un mod a été remplacé.',
              'For projects offered by the Hub, version discovery depends on the catalogue and selected channel. A visible version, its download and its activation are distinct steps. Check the stated compatibility and active profile before concluding that a mod has been replaced.',
            ),
          ),
          text(t(
            'Exemple avec le projet Long trains : son paquet 0.1.0 exige sdkMin=0.9.0-alpha.3 parce que trainEditor est utilisé. Après packageMod, vérifiez le ZIP exact, ses descripteurs et son fonctionnement dans une partie de test. Si vous modifiez ensuite le code ou les ressources, reconstruisez le paquet avant de comparer son empreinte.',
            'Example using the Long trains project: its 0.1.0 package requires sdkMin=0.9.0-alpha.3 because it uses trainEditor. After packageMod, check the exact ZIP, its descriptors and its behaviour in a test game. If you subsequently change code or resources, rebuild the package before comparing its hash.',
          )),
          code('Get-FileHash -LiteralPath .\\build\\gradle\\distributions\\long-trains-0.1.0-windows-x64.zip -Algorithm SHA256', t('Vérifier l’empreinte du paquet Long trains', 'Check the Long trains package hash'), 'powershell'),
          text(t(
            'Cette commande lit le fichier et renvoie son SHA-256 ; elle ne le téléverse pas. Comparez cette valeur au champ sha256 du descripteur qui accompagnera ce même ZIP. Les noms du paquet viennent de modId et version, pas du titre traduit affiché au joueur.',
            'This command reads the file and returns its SHA-256; it does not upload it. Compare this value to the sha256 field of the descriptor accompanying that same ZIP. Package names come from modId and version, not the translated title shown to the player.',
          )),
          links({ label: t('Reproduire le projet Long trains', 'Reproduce the Long trains project'), to: '/mods/composition-trains' }),
          links(
            {
              label: t('Contrat du manifeste', 'Manifest contract'),
              to: '/reference/projet-gradle#manifeste',
            },
            { label: t('Vérifier le paquet', 'Verify the package'), to: '/maintenance/tests' },
            {
              label: t('Diagnostiquer une activation', 'Diagnose activation'),
              to: '/maintenance/journaux',
            },
          ),
        ],
      },
    ],
  },
]
