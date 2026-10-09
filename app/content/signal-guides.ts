import type { Article } from './schema'
import { text, code, note, list, table, links } from './schema'
import signalModels from './snippets/SignalModels.kt?raw'
import approachSignal from './snippets/ApproachSignal.kt?raw'
import blinkSignal from './snippets/BlinkSignal.kt?raw'
import drivingRules from './snippets/DrivingRules.kt?raw'
import preparedNetwork from './snippets/PreparedNetwork.kt?raw'
import previewTool from './snippets/PreviewTool.kt?raw'

export const signalGuidesEnglish: Record<string, string> = {}
const t = (fr: string, en: string) => {
  signalGuidesEnglish[fr] = en
  return fr
}
const literal = (value: string) => t(value, value)

export const signalGuides: Article[] = [
  {
    slug: 'mods/signaux',
    title: t('Signaux et réseau', 'Signals and network'),
    group: 'Créer un mod',
    status: 'development',
    description: t(
      'Composez plusieurs modèles, résolvez leurs voisins et traitez les observations inconnues.',
      'Compose several models, resolve their neighbours and handle unknown observations.',
    ),
    sections: [
      {
        id: 'organisation',
        title: t('Organiser les rôles d’un modèle', 'Organise a model’s responsibilities'),
        blocks: [
          text(
            t(
              'Après le premier mod, vous pouvez ajouter plusieurs familles de signaux au même paquet. Chaque signalModel possède son identité, ses enums et ses callbacks. Le point d’entrée signalMod assemble ces déclarations ; il ne doit pas devenir une grande règle qui compare tous les types.',
              'After the first mod, you can add several signal families to one package. Each signalModel owns its identity, enums and callbacks. The signalMod entry point assembles these declarations; it should not become one large rule comparing every type.',
            ),
          ),
          table(
            [t('Rôle', 'Responsibility'), t('Ce que vous écrivez', 'What you write')],
            [
              [
                t('Déclaration', 'Declaration'),
                t(
                  'Identifiant stable, catalogue, replis et raccordement des fonctions.',
                  'Stable identity, catalogue, fallbacks and function registration.',
                ),
              ],
              [
                t('Indications', 'Indications'),
                t(
                  'Deux enums : l’aspect à afficher et le motif qui explique la décision.',
                  'Two enums: the displayed aspect and the reason explaining the decision.',
                ),
              ],
              [
                t('Réglages', 'Settings'),
                t(
                  'Cases et entiers nommés, valeurs initiales et aide du panneau.',
                  'Named checkboxes and integers, initial values and panel help.',
                ),
              ],
              [
                t('Règles', 'Rules'),
                t(
                  'Une décision à partir de l’observation et, si nécessaire, du voisin aval.',
                  'A decision from the observation and, when needed, the downstream neighbour.',
                ),
              ],
              [
                t('Apparence', 'Appearance'),
                t(
                  'Images du catalogue et éventuelle animation.',
                  'Catalogue images and optional animation.',
                ),
              ],
              [
                t('Conduite', 'Driving'),
                t(
                  'Consigne et vitesses choisies explicitement pour chaque indication.',
                  'An explicitly chosen rule and speeds for each indication.',
                ),
              ],
              [
                t('Diagnostic', 'Diagnostics'),
                t(
                  'Noms lisibles des motifs et décisions classées comme défauts.',
                  'Readable reason names and decisions classified as faults.',
                ),
              ],
            ],
          ),
          text(
            t(
              'Gardez les petits modèles dans un fichier. Quand ils grandissent, regroupez leurs fichiers dans un dossier par famille ; placez les règles réellement partagées dans un dossier commun nommé selon leur domaine. Les fonctions de règles travaillent sur les valeurs fournies, sans ouvrir de connexion au jeu ni lancer de minuteur.',
              'Keep small models in one file. As they grow, group files by family; place genuinely shared rules in a common directory named for their domain. Rule functions work on supplied values without opening a game connection or starting timers.',
            ),
          ),
          links(
            { label: t('Structure du projet', 'Project structure'), to: '/mods/structure' },
            { label: t('Premier mod complet', 'Complete first mod'), to: '/commencer/premier-mod' },
          ),
        ],
      },
      {
        id: 'types',
        title: t(
          'Deux modèles avec des vocabulaires indépendants',
          'Two models with independent vocabularies',
        ),
        blocks: [
          code(signalModels, literal('SignalModels.kt')),
          text(
            t(
              'Le modèle principal décide localement. Le modèle d’annonce vérifie d’abord son propre canton, puis interprète le principal avec next.of(mainSignal). Ces noms et ces règles sont fictifs : aucune convention ferroviaire nationale n’est fournie par le SDK.',
              'The main model decides locally. The distant model first checks its own block, then interprets the main model with next.of(mainSignal). These names and rules are fictional: the SDK supplies no national railway convention.',
            ),
          ),
          text(t(
            'Ajoutez ce fichier à un projet Native préparé, puis créez assets/main-closed.svg, main-open.svg, distant-wait.svg et distant-proceed.svg. Chaque modèle déclare son catalogue et sa conduite. Le fichier suivant constitue l’unique point d’entrée du projet ; createNetworkMod assemble les mêmes instances que celles utilisées par next.of.',
            'Add this file to a prepared Native project, then create assets/main-closed.svg, main-open.svg, distant-wait.svg and distant-proceed.svg. Each model declares its catalogue and driving policy. The following file is the project’s sole entry point; createNetworkMod assembles the same instances used by next.of.',
          )),
          code('package nimby.mod\n\n// Assembler le catalogue avec l’identité générée depuis mod.json.\nfun createMod() = wiki.models.createNetworkMod(modInfo)', literal('src/main/kotlin/Entry.kt')),
          table([t('Situation observée', 'Observed situation'), t('Résultat de l’annonce', 'Distant result')], [
            [t('Son propre canton est inconnu, occupé ou non frais.', 'Its own block is unknown, occupied or stale.'), literal('Wait / Unknown')],
            [t('Canton local libre ; principal résolu et fermé.', 'Local block clear; resolved main signal closed.'), literal('Wait / MainClosed')],
            [t('Canton local libre ; principal résolu et ouvert.', 'Local block clear; resolved main signal open.'), literal('Proceed / MainOpen')],
            [t('Voisin d’un autre modèle ou impossible à résoudre.', 'Neighbour from another model or impossible to resolve.'), literal('Wait / Unknown')],
          ]),
          table(
            [t('Identité', 'Identity'), t('Portée', 'Scope')],
            [
              [
                literal('ModInfo.id'),
                t(
                  'Le paquet : utilisé pour l’installation et les services optionnels.',
                  'The package: used for installation and optional services.',
                ),
              ],
              [
                literal('SignalType.id'),
                t(
                  'Le modèle constructible : ses règles, ses réglages et son catalogue.',
                  'The constructible model: its rules, settings and catalogue.',
                ),
              ],
              [
                literal('Signal.id'),
                t(
                  'Une instance posée dans la partie observée ; ne pas réutiliser dans une autre partie.',
                  'A placed instance in the observed game; do not reuse it in another game.',
                ),
              ],
            ],
          ),
          text(
            t(
              'Un mod déclare de 1 à 16 modèles, avec identifiants et catalogues distincts. Réutilisez la même instance de SignalModel dans signal(model) et next.of(model) : un nom ou un ordinal identique ne rend pas deux déclarations interchangeables.',
              'A mod declares 1 through 16 models with distinct identities and catalogues. Reuse the same SignalModel instance in signal(model) and next.of(model): matching names or ordinals do not make two declarations interchangeable.',
            ),
          ),
        ],
      },
      {
        id: 'reseau',
        title: t(
          'Résoudre le voisin seulement quand il est utile',
          'Resolve a neighbour only when needed',
        ),
        blocks: [
          list(
            t(
              'Le premier appel à rules reçoit next == null. Une indication renvoyée conclut immédiatement pour ce signal.',
              'The first rules call receives next == null. Returning an indication immediately settles this signal.',
            ),
            t(
              'Renvoyer null demande au SDK de résoudre le lien nextSignal. La règle est ensuite rappelée avec le voisin résolu.',
              'Returning null asks the SDK to resolve the nextSignal link. The rule is then called again with the resolved neighbour.',
            ),
            t(
              'Si le lien manque, si la dépendance boucle sans décision locale ou si la règle ne conclut toujours pas, le modèle utilise invalidNetwork.',
              'If the link is missing, the dependency cycles without a local decision, or the rule still does not conclude, the model uses invalidNetwork.',
            ),
          ),
          text(
            t(
              'Distinguez next == null de next.of(mainSignal) == null. Dans le premier cas, la résolution n’a pas encore fourni de voisin. Dans le second, un voisin peut être résolu mais appartenir à un autre modèle : choisissez alors une politique explicite. L’exemple ci-dessus renvoie son repli pour ce modèle inconnu.',
              'Distinguish next == null from next.of(mainSignal) == null. The first means resolution has not supplied a neighbour yet. The second can mean a resolved neighbour belongs to another model: choose an explicit policy for that case. The example above returns its fallback for that unknown model.',
            ),
          ),
          table(
            [t('Propriété du voisin', 'Neighbour property'), t('Utilisation', 'Use')],
            [
              [
                literal('id / type'),
                t(
                  'Identifier le signal aval et son modèle dans cette observation.',
                  'Identify the downstream signal and its model in this observation.',
                ),
              ],
              [
                literal('of(model)'),
                t(
                  'Lire les enums exactes du modèle reconnu, sans conversion numérique.',
                  'Read the recognised model’s exact enums without numeric conversion.',
                ),
              ],
              [
                literal('drivingRule'),
                t(
                  'Consulter la consigne déclarée, si votre règle sait l’interpréter ; null reste une absence de consigne.',
                  'Read the declared rule if your rule knows how to interpret it; null remains a missing rule.',
                ),
              ],
              [
                literal('active'),
                t(
                  'Lire activeWhen du voisin ; cela ne prouve ni fraîcheur ni voie libre.',
                  'Read the neighbour’s activeWhen result; this proves neither freshness nor a clear track.',
                ),
              ],
            ],
          ),
          text(
            t(
              'next suit le réseau observé de votre mod. Il ne recherche pas tous les signaux proches et ne lit pas automatiquement les décisions privées d’autres mods. evaluateNetwork permet de tester ce même mécanisme hors jeu ; sa limite de 4096 signaux par appel n’est pas une promesse de taille maximale de carte.',
              'next follows your mod’s observed network. It neither searches all nearby signals nor automatically reads other mods’ private decisions. evaluateNetwork tests the same mechanism outside the game; its 4096-signal limit per call is not a maximum map-size promise.',
            ),
          ),
          text(t(
            'Testez séparément une décision locale, un voisin reconnu fermé/ouvert, un modèle inconnu, un lien manquant et une boucle. Hors jeu, construisez les observations puis utilisez evaluateNetwork ; dans le jeu, vérifiez également que le sens du lien aval correspond aux signaux posés.',
            'Test a local decision, a recognised closed/open neighbour, an unknown model, a missing link and a cycle separately. Outside the game, build observations and use evaluateNetwork; in the game, also verify that the downstream link direction matches the placed signals.',
          )),
        ],
      },
      {
        id: 'inconnu',
        title: t(
          'Faire de l’inconnu un résultat explicite',
          'Make unknown information an explicit result',
        ),
        blocks: [
          table(
            [t('Entrée', 'Input'), t('Interprétation à conserver', 'Meaning to preserve')],
            [
              [
                literal('fresh == false'),
                t(
                  'Les valeurs ne prouvent pas l’état actuel. Choisir le repli du modèle.',
                  'Values do not establish the current state. Choose the model’s fallback.',
                ),
              ],
              [
                literal('routeKnown == false'),
                t(
                  'Le parcours nécessaire n’est pas établi ; ne pas en déduire un canton libre.',
                  'The required route is not established; do not infer a clear block.',
                ),
              ],
              [
                literal('Occupancy.Unknown'),
                t(
                  'Ni Clear ni Occupied ne sont prouvés. Ne pas remplacer par Clear.',
                  'Neither Clear nor Occupied is established. Do not substitute Clear.',
                ),
              ],
              [
                literal('SettingsStatus.Unavailable'),
                t(
                  'Le profil ne peut pas être lu ; SignalRuleContext rend l’observation non fraîche.',
                  'The profile cannot be read; SignalRuleContext marks the observation stale.',
                ),
              ],
              [
                literal('forcedStop / lampFailed'),
                t(
                  'Données à interpréter dans votre règle ; leur nom ne crée pas une décision à votre place.',
                  'Data for your rule to interpret; their names do not make a decision on your behalf.',
                ),
              ],
            ],
          ),
          text(
            t(
              'fallback sert notamment au calcul isolé qui ne conclut pas ; invalidNetwork couvre une dépendance aval impossible à résoudre. Ces déclarations ne remplacent pas les branches de rules sur fresh, routeKnown et Occupancy.Unknown. Choisissez un motif distinct quand il aide à expliquer le résultat, puis testez les entrées inconnues avant les cas favorables.',
              'fallback is used notably when isolated calculation does not conclude; invalidNetwork covers an unresolved downstream dependency. These declarations do not replace rules branches for fresh, routeKnown and Occupancy.Unknown. Choose a distinct reason when it helps explain the result, then test unknown inputs before favourable cases.',
            ),
          ),
          links(
            { label: t('Tests de règles', 'Rule tests'), to: '/maintenance/tests' },
            { label: t('Réglages effectifs', 'Effective settings'), to: '/mods/reglages' },
          ),
        ],
      },
      {
        id: 'approche',
        title: t(
          'Observer une approche à plusieurs cantons',
          'Observe an approach across several blocks',
        ),
        blocks: [
          code(approachSignal, literal('ApproachSignal.kt')),
          text(
            t(
              'Dans un projet préparé avec le premier tutoriel, ajoutez ce fichier et assemblez approachSignal depuis createMod. Le catalogue déclare closed.svg et open.svg : ajoutez ces fichiers dans assets. Le résultat attendu est un modèle qui s’ouvre uniquement lorsque ses conditions locales et une approche fraîche sont réunies.',
              'In a project prepared with the first tutorial, add this file and assemble approachSignal from createMod. The catalogue declares closed.svg and open.svg: add these files to assets. The expected result is a model that opens only when its local conditions and a fresh approach are satisfied.',
            ),
          ),
          code(
            'package nimby.mod\n\nimport nimby.*\nimport wiki.approach.approachSignal\n\nfun createMod() = signalMod(modInfo) {\n    metadata(author = "Your name", description = "Approach-controlled signal.")\n    // Enregistrer exactement le modèle dont le fichier déclare les règles et les images.\n    signal(approachSignal)\n}',
            literal('src/main/kotlin/Entry.kt'),
          ),
          text(
            t(
              'observeApproach(blocks = 2) demande une tête de train orientée vers le signal dans les deux cantons en amont. La portée accepte 1 à 16 cantons. trainApproaching vaut true seulement avec une approche exploitable et fraîche ; approachingTrain fournit alors son identifiant. Une absence de preuve donne false/null, pas une preuve qu’aucun train n’existe.',
              'observeApproach(blocks = 2) requests a train head directed towards the signal within the two upstream blocks. The range accepts 1 through 16 blocks. trainApproaching is true only for a usable, fresh approach; approachingTrain then supplies its identity. Missing evidence produces false/null, not proof that no train exists.',
            ),
          ),
          text(
            t(
              'Le parcours respecte le sens observé et ne choisit pas arbitrairement une branche. Après le passage de la tête au signal, ce train n’est plus une approche de ce signal. La détection ne prouve ni réservation ni autorisation de mouvement ; elle se combine aux contrôles du canton dans votre règle.',
              'Traversal follows the observed direction and does not choose a branch arbitrarily. After the head passes the signal, that train is no longer approaching it. Detection proves neither reservation nor movement permission; combine it with block checks in your rule.',
            ),
          ),
          note(
            t(
              'blocks mesure une portée amont en cantons. signalsAhead, dans une consigne de conduite, désigne une cible aval. Aucun des deux ne représente des mètres ou des secondes ; n’augmentez pas la portée pour compenser l’accélération du jeu.',
              'blocks measures an upstream range in blocks. signalsAhead, in a driving rule, identifies a downstream target. Neither represents metres or seconds; do not increase the range to compensate for game acceleration.',
            ),
            t('Deux directions différentes', 'Two different directions'),
          ),
          links(
            { label: t('Référence des modèles', 'Model reference'), to: '/reference/signalmodel' },
            { label: t('Consignes de conduite', 'Driving rules'), to: '/mods/conduite' },
          ),
        ],
      },
    ],
  },
  {
    slug: 'mods/outils-optionnels',
    title: t('Coopérer avec un autre mod', 'Cooperate with another mod'),
    group: 'Créer un mod',
    status: 'experimental',
    description: t(
      'Reliez un bouton facultatif à un service et construisez un outil d’aperçu indépendant.',
      'Connect an optional button to a service and build an independent preview tool.',
    ),
    sections: [
      {
        id: 'bouton',
        title: t(
          'Déclarer le contrat entre les deux projets',
          'Declare the contract between two projects',
        ),
        blocks: [
          text(
            t(
              'Ce guide suppose un projet de signaux déjà fonctionnel. Ajoutez une action à son signalModel et créez un second projet Native pour le fournisseur. Le signal garde ses règles quand l’outil n’est pas installé ; whenMod n’ajoute pas une dépendance d’installation.',
              'This guide assumes a working signal project. Add an action to its signalModel and create a second Native project for the provider. The signal keeps its rules when the tool is not installed; whenMod does not add an installation dependency.',
            ),
          ),
          table([t('Essai', 'Test'), t('Résultat attendu avec cet exemple', 'Expected result with this example')], [
            [t('Train orienté vers le signal dans un des deux cantons amont ; canton local libre.', 'Train directed towards the signal in either upstream block; local block clear.'), literal('Open / TrainApproaching')],
            [t('Train au-delà de la portée ou déjà passé devant le signal.', 'Train beyond the range or already past the signal.'), literal('Closed / Unknown')],
            [t('Approche détectée mais canton local occupé, forcé à l’arrêt ou non frais.', 'Approach detected but local block occupied, forced to stop or stale.'), literal('Closed / Unknown')],
          ]),
          code(
            'action("preview", "Preview markers",\n    whenMod = "preview-tool", service = "preview.v1")',
            t('Fragment dans votre signalModel', 'Fragment inside your signalModel'),
          ),
          table(
            [t('Champ', 'Field'), t('Contrat', 'Contract')],
            [
              [
                literal('preview'),
                t(
                  'Identifiant de cette action dans le modèle de signal.',
                  'Identity of this action within the signal model.',
                ),
              ],
              [
                literal('preview-tool'),
                t(
                  'Identifiant exact du mod fournisseur, déclaré dans son mod.json.',
                  'Exact provider mod identity, declared in its mod.json.',
                ),
              ],
              [
                literal('preview.v1'),
                t(
                  'Nom du service déclaré par le fournisseur avec service.',
                  'Service name registered by the provider with service.',
                ),
              ],
            ],
          ),
          text(
            t(
              'Le bouton devient disponible lorsque le fournisseur et son service sont présents avec une observation fraîche de la même partie. Un clic transmet une SignalActionRequest : source, action, service et portée de partie. Il ne donne à lui seul aucune autorisation de construire.',
              'The button becomes available when the provider and its service are present with a fresh observation of the same game. A click sends a SignalActionRequest containing the source, action, service and game scope. A click alone grants no construction permission.',
            ),
          ),
        ],
      },
      {
        id: 'outil',
        title: t(
          'Choisir un service ou une fenêtre autonome',
          'Choose a service or a standalone window',
        ),
        blocks: [
          text(
            t(
              'toolMod déclare un outil sans modèle de signal fictif. Choisissez au moins un service, une fenêtre ou une règle trainEditor. Un service traite les actions de signaux ; une fenêtre permet un outil sans signal sélectionné ; trainEditor agit directement dans la composition des trains, sans fenêtre ni callback de surveillance. Les callbacks de service et de fenêtre utilisent le ToolContext reçu pendant l’appel.',
              'toolMod declares a tool without a fictitious signal model. Choose at least one service, window or trainEditor rule. A service handles signal actions; a window supports tools without a selected signal; trainEditor acts directly in train composition, without a window or monitoring callback. Service and window callbacks use the ToolContext supplied for that call.',
            ),
          ),
          table(
            [t('Déclaration', 'Declaration'), t('Usage', 'Use')],
            [
              [
                literal('service(id) { request -> … }'),
                t(
                  'Recevoir un clic ou une édition valide d’un champ du panneau.',
                  'Receive a click or valid panel-field edit.',
                ),
              ],
              [
                literal('window(id, title, shortcut) { event -> … }'),
                t(
                  'Recevoir les événements d’une fenêtre autonome.',
                  'Receive standalone-window events.',
                ),
              ],
              [
                literal('trainEditor { maximumLength(...) }'),
                t(
                  'Déclarer une limite de composition, son option et ses messages. Aucun contexte de jeu à lire périodiquement.',
                  'Declare a composition limit, its option and its messages. No game context needs periodic reading.',
                ),
              ],
              [
                literal('onTick { … }'),
                t(
                  'Avancer un travail borné ou renouveler un aperçu actif, sans attente.',
                  'Advance bounded work or renew an active preview without waiting.',
                ),
              ],
              [
                literal('onStop { … }'),
                t(
                  'Nettoyer l’état local lors d’un arrêt normal ; ne pas compter sur ce callback après un arrêt brutal.',
                  'Clean local state during normal shutdown; do not rely on this callback after abrupt termination.',
                ),
              ],
            ],
          ),
          text(
            t(
              'Un mod accepte jusqu’à 32 services et 8 fenêtres, avec des identifiants distincts dans chaque groupe. Les handlers d’un même mod sont sérialisés : un handler qui attend empêche ses autres tâches d’avancer. Conservez des valeurs et un état de travail ; chaque callback reçoit un nouveau contexte utilisable.',
              'A mod accepts up to 32 services and 8 windows, with distinct identities within each group. Handlers within one mod are serialized: a waiting handler prevents its other tasks from advancing. Retain values and work state; each callback receives a usable context.',
            ),
          ),
          links(
            { label: t('Premier outil autonome : horloge', 'First standalone tool: clock'), to: '/mods/horloge' },
            { label: t('Fenêtres et formulaires', 'Windows and forms'), to: '/mods/interface' },
            { label: t('Règle de composition sans fenêtre', 'Composition rule without a window'), to: '/mods/composition-trains' },
            { label: t('Cycle de vie des outils', 'Tool lifecycle'), to: '/mods/cycle-outils' },
          ),
        ],
      },
      {
        id: 'contexte',
        title: t('Utiliser le contexte sans le conserver', 'Use the context without retaining it'),
        blocks: [
          table(
            [t('Appel ou valeur', 'Call or value'), t('Résultat utile', 'Useful result')],
            [
              [
                literal('worldId / generation'),
                t(
                  'Portée des données : invalider calculs, source et état périmés lorsqu’elle change.',
                  'Data scope: invalidate stale calculations, source and state when it changes.',
                ),
              ],
              [
                literal('network()'),
                t(
                  'Nouvelle copie du réseau. Demander au début d’un calcul, pas à chaque renouvellement visuel.',
                  'A new network copy. Request it when beginning a calculation, not for every visual renewal.',
                ),
              ],
              [
                literal('showPanel(request, message, buttons, inputs)'),
                t(
                  'Panneau associé à l’action source : au plus 12 boutons et 4 champs entiers.',
                  'Panel associated with the source action: at most 12 buttons and 4 integer fields.',
                ),
              ],
              [
                literal('showSignalPreview(request, positions)'),
                t(
                  'Publication d’au plus 64 positions temporaires, sans poser de signal.',
                  'Publish at most 64 temporary positions without placing signals.',
                ),
              ],
              [
                literal('clearSignalPreview()'),
                t(
                  'Retirer l’aperçu de cet outil, sans toucher aux signaux construits.',
                  'Remove this tool’s preview without touching constructed signals.',
                ),
              ],
              [
                literal('log(message)'),
                t(
                  'Journaliser un événement ou un changement d’état utile.',
                  'Log a useful event or state change.',
                ),
              ],
            ],
          ),
          text(
            t(
              'Les copies Kotlin restent lisibles après le retour du callback ; le ToolContext ne reste pas utilisable. Une ancienne demande et ses positions doivent encore appartenir au worldId/generation courant avant une republication. Ne transformez pas un refus temporaire en résultat vide ou en réussite.',
              'Kotlin copies remain readable after the callback returns; ToolContext does not remain usable. An older request and its positions must still belong to the current worldId/generation before republication. Do not turn a temporary refusal into an empty result or success.',
            ),
          ),
          text(
            t(
              'ToolOperationException.isBusy signale un refus temporaire. Pour un aperçu, conserver les positions et réessayer au callback suivant est possible ; aucune boucle d’attente n’est nécessaire. Pour une construction dont la réponse est incertaine, conservez le ticket et consultez son état au lieu de renvoyer la commande.',
              'ToolOperationException.isBusy indicates a temporary refusal. For previews, retaining positions and retrying in the next callback is allowed; no waiting loop is needed. For construction with an uncertain response, retain the ticket and inspect its state instead of resending the command.',
            ),
          ),
        ],
      },
      {
        id: 'exemple-apercu',
        title: t(
          'Exemple complet : un aperçu sans construction',
          'Complete example: preview without construction',
        ),
        blocks: [
          text(
            t(
              'Ce fichier place des repères à intervalles de fraction réguliers sur la voie du signal source. Il ne choisit aucune branche et ne calcule pas un espacement en mètres. La classe PreviewSession sépare la logique des appels SDK pour permettre des tests hors jeu.',
              'This file places markers at evenly spaced fractions on the source signal’s track. It chooses no branches and does not calculate spacing in metres. PreviewSession separates logic from SDK calls so it can be tested outside the game.',
            ),
          ),
          code(previewTool, literal('src/main/kotlin/PreviewTool.kt')),
          code(
            'package nimby.mod\n\n// Utiliser l’identité fournie par le manifeste de ce projet.\nfun createMod() = wiki.preview.createPreviewTool(modInfo)',
            t(
              'Point d’entrée du projet outil : src/main/kotlin/Entry.kt',
              'Tool project entry point: src/main/kotlin/Entry.kt',
            ),
          ),
          text(
            t(
              'Créez le projet avec le guide d’installation, puis fixez id à preview-tool dans mod.json pour correspondre à cet exemple. Il n’a pas besoin d’assets de signal. Installez ensemble le mod de signaux portant l’action et cet outil ; ouvrez l’action, choisissez un nombre puis Afficher l’aperçu. Vous devez voir plusieurs repères temporaires et aucun nouveau signal dans la partie.',
              'Create the project using the setup guide, then set id to preview-tool in mod.json to match this example. It needs no signal assets. Install the signal mod containing the action together with this tool; open the action, choose a count and select Show preview. You should see several temporary markers and no new signals in the game.',
            ),
          ),
          note(
            t(
              'L’aperçu reprend le modèle et le sens du signal source. Une publication réussie ne prouve pas que tous les repères sont visibles : cadrage et couches du jeu restent applicables. Elle ne prouve pas non plus que les emplacements sont constructibles.',
              'The preview reuses the source signal’s model and direction. Successful publication does not prove every marker is visible: game framing and layers still apply. It also does not prove the positions can be built.',
            ),
            t('Résultat graphique', 'Visual result'),
          ),
        ],
      },
      {
        id: 'cycle-apercu',
        title: t('Gérer édition, expiration et refus', 'Handle editing, expiry and refusal'),
        blocks: [
          list(
            t(
              'Un champ vide ou invalide reste un brouillon. Le callback reçoit value seulement pour une valeur entière valide ; ne remplacez pas null par zéro.',
              'An empty or invalid field remains a draft. The callback receives value only for a valid integer; do not replace null with zero.',
            ),
            t(
              'Une nouvelle saisie masque l’ancien aperçu. Invalidez également votre ancien calcul avant toute opération susceptible d’échouer.',
              'A new edit hides the previous preview. Also invalidate the previous calculation before any operation that can fail.',
            ),
            t(
              'Publiez la liste complète des positions en un appel. L’aperçu expire après deux secondes sans renouvellement ; onTick peut renouveler les copies sans relire tout le réseau.',
              'Publish the complete position list in one call. The preview expires after two seconds without renewal; onTick can renew copied values without rereading the entire network.',
            ),
            t(
              'Un refus isBusy ne renouvelle pas l’aperçu. Désactivez toute confirmation de pose qui dépend de ce nouvel affichage jusqu’à une publication réussie.',
              'An isBusy refusal does not renew the preview. Disable any placement confirmation depending on that new display until publication succeeds.',
            ),
            t(
              'Un seul aperçu est actif à la fois. Il reste lié à l’édition du signal source et disparaît à l’arrêt du mod ou de la partie.',
              'Only one preview is active at a time. It remains tied to editing the source signal and disappears when the mod or game stops.',
            ),
          ),
          links(
            {
              label: t(
                'Parcourir les voies et mesurer les distances',
                'Traverse tracks and measure distances',
              ),
              to: '/mods/parcours-voies',
            },
            {
              label: t('Tickets de construction', 'Construction tickets'),
              to: '/mods/cycle-outils#ticket',
            },
          ),
        ],
      },
      {
        id: 'replier-menu',
        title: t(
          'Fermer l’interface sans perdre le suivi',
          'Close the interface without losing tracking',
        ),
        blocks: [
          text(
            t(
              'Conservez séparément l’état ouvert/fermé, les valeurs du formulaire, l’aperçu et le ticket éventuel. Pour replier le panneau, retirez l’aperçu, republiez seulement le bouton d’origine et cessez de renouveler les anciens contrôles. PreviewSession réalise cette séparation.',
              'Keep open/closed state, form values, preview and any ticket separately. To collapse the panel, remove the preview, republish only the original button, and stop renewing the old controls. PreviewSession implements this separation.',
            ),
          ),
          code(
            'clearSignalPreview()\nshowPanel(request, "", listOf(\n    ToolButton(request.originAction, "Open tool")\n))',
            t('Fragment dans un callback de fermeture', 'Fragment inside a close callback'),
          ),
          text(
            t(
              'Le prochain clic utilise originAction et peut rouvrir le formulaire. Une erreur de retrait doit laisser la confirmation locale désactivée, avec nettoyage à reprendre. Fermer le panneau n’annule pas une construction déjà envoyée : continuez de consulter son ticket jusqu’à un état terminal.',
              'The next click uses originAction and can reopen the form. A removal error must leave local confirmation disabled, with cleanup still pending. Closing the panel does not cancel construction already sent: keep polling its ticket until it reaches a terminal state.',
            ),
          ),
          links(
            {
              label: t('Référence du contexte outil', 'Tool context reference'),
              to: '/reference/toolcontext',
            },
            {
              label: t('Référence des services', 'Service reference'),
              to: '/reference/modservices',
            },
          ),
        ],
      },
    ],
  },
  {
    slug: 'mods/reglages',
    title: t('Réglages et valeurs effectives', 'Settings and effective values'),
    group: 'Créer un mod',
    status: 'development',
    description: t(
      'Déclarez cases et entiers, lisez leur disponibilité et préparez des règles de zone sans écrire les profils.',
      'Declare checkboxes and integers, read their availability, and prepare area rules without writing profiles.',
    ),
    sections: [
      {
        id: 'case',
        title: t('Une déclaration réutilisée par la règle', 'One declaration reused by the rule'),
        blocks: [
          text(
            t(
              'Un réglage appartient à un modèle. Donnez-lui une clé stable pour les parties sauvegardées, un libellé lisible et un défaut explicite. Le libellé et l’aide peuvent utiliser tr ; la clé technique ne se traduit pas. Déclarer une case ne modifie aucune règle : lisez enabled dans rules.',
              'A setting belongs to a model. Give it a stable key for saved games, a readable label and an explicit default. The label and help can use tr; the technical key is not translated. Declaring a checkbox changes no rule: read enabled inside rules.',
            ),
          ),
          code(
            'val active = checkbox(\n    name = "active", label = "Enabled",\n    description = "Use this model’s rules.", defaultValue = true\n)\nrules {\n    when {\n        !enabled(active) -> Indication(Aspect.Closed, Reason.Disabled)\n        !fresh || !routeKnown || block != Occupancy.Clear ||\n            observation.forcedStop || observation.lampFailed ->\n            Indication(Aspect.Closed, Reason.Unknown)\n        else -> Indication(Aspect.Open, Reason.Clear)\n    }\n}',
            t(
              'Fragment dans un modèle déclarant ces enums',
              'Fragment inside a model declaring these enums',
            ),
          ),
          text(
            t(
              'Conservez la Checkbox retournée et passez cette même déclaration à enabled. Une case issue d’un autre modèle est refusée, même si elle porte le même nom. Deux modèles peuvent chacun déclarer active avec des défauts différents.',
              'Retain the returned Checkbox and pass that same declaration to enabled. A checkbox from another model is rejected even if it has the same name. Two models can each declare active with different defaults.',
            ),
          ),
          table(
            [
              t('Statut', 'Status'),
              t('Lecture dans SignalRuleContext', 'Meaning in SignalRuleContext'),
            ],
            [
              [
                literal('Present'),
                t(
                  'Profil effectif fourni. Le SDK peut compléter les défauts d’un signal connu sans valeurs sauvegardées.',
                  'Effective profile supplied. The SDK can fill defaults for a known signal without saved values.',
                ),
              ],
              [
                literal('Absent'),
                t(
                  'Le contexte utilise les défauts déclarés et conserve ce statut. Cela ne prouve pas qu’un profil a été lu dans la partie.',
                  'The context uses declared defaults and retains this status. This does not prove a profile was read from the game.',
                ),
              ],
              [
                literal('Unavailable'),
                t(
                  'Profil indisponible : l’observation devient non fraîche. Une valeur par défaut ne constitue pas une lecture réussie.',
                  'Unavailable profile: the observation becomes stale. A default value is not a successful read.',
                ),
              ],
            ],
          ),
          text(
            t(
              'enabled utilise le défaut lorsqu’une clé manque. Vérifiez aussi fresh et les observations nécessaires à votre règle ; ne traitez jamais un profil indisponible comme toutes les cases décochées. Le DSL à enums communes conserve lui aussi settingsStatus, mais n’applique pas toute la normalisation de SignalRuleContext.',
              'enabled uses the default when a key is missing. Also check fresh and the observations your rule requires; never treat an unavailable profile as all checkboxes unchecked. The shared-enum DSL also retains settingsStatus but does not apply all SignalRuleContext normalisation.',
            ),
          ),
        ],
      },
      {
        id: 'nombres',
        title: t(
          'Placer un entier sous sa case de contrôle',
          'Place an integer below its controlling checkbox',
        ),
        blocks: [
          code(
            'val work = checkbox("work", "Work zone", defaultValue = false)\nval workBlocks = NumberSetting(\n    "workBlocks", "Following blocks", maximum = 64,\n    defaultValue = 0, visibleWhen = work.name\n)\nnumber(workBlocks)\n\n// Inside rules:\n// val following = workBlocks.read(settings)',
            t('Fragment dans votre signalModel', 'Fragment inside your signalModel'),
          ),
          text(
            t(
              'visibleWhen désigne la case du même modèle qui affiche le champ. Le panneau place ce champ sous sa case de contrôle. Masquer le champ conserve sa valeur : votre règle doit décider si cette valeur a un effet lorsque la case est désactivée. Une chaîne visibleWhen vide laisse le champ sans condition de visibilité.',
              'visibleWhen names the same-model checkbox that shows the field. The panel places the field below its controlling checkbox. Hiding it retains its value: your rule must decide whether that value has any effect while the checkbox is off. An empty visibleWhen string leaves the field without a visibility condition.',
            ),
          ),
          table(
            [t('Paramètre ou fonction', 'Parameter or function'), t('Contrat', 'Contract')],
            [
              [
                literal('maximum'),
                t(
                  'De 1 à 65535 ; la plage du champ est 0..maximum.',
                  'From 1 through 65535; the field range is 0..maximum.',
                ),
              ],
              [
                literal('defaultValue'),
                t(
                  'Dans 0..maximum. Le sens de zéro est choisi par votre règle.',
                  'Within 0..maximum. Your rule chooses what zero means.',
                ),
              ],
              [
                literal('read(settings)'),
                t(
                  'Lit une valeur bornée dans la copie des réglages, sans accès au jeu.',
                  'Reads a bounded value from copied settings without game access.',
                ),
              ],
              [
                literal('withValue(settings, value)'),
                t(
                  'Retourne une nouvelle carte de réglages pour le calcul ou les tests ; ne sauvegarde rien.',
                  'Returns a new settings map for calculations or tests; saves nothing.',
                ),
              ],
            ],
          ),
          text(
            t(
              'Un modèle accepte jusqu’à quatre NumberSetting distincts. Utilisez leur API, sans construire leurs champs de stockage. Les champs entiers ToolNumberInput d’un formulaire outil constituent une autre API : ils transmettent une saisie à votre service, pas un réglage persistant de signal.',
              'A model accepts up to four distinct NumberSetting declarations. Use their API without constructing storage fields. ToolNumberInput integer fields in tool forms are a separate API: they deliver input to your service, not a persistent signal setting.',
            ),
          ),
        ],
      },
      {
        id: 'preparation',
        title: t('Préparer les réglages d’une zone', 'Prepare an area’s effective settings'),
        blocks: [
          text(
            t(
              'prepareNetwork reçoit les signaux observés du mod avant leur résolution. Il peut dériver les réglages utilisés par ce calcul, par exemple propager une option sur un nombre de signaux suivants. Il ne sauvegarde pas ces valeurs. Conservez nombre, ordre, identités, liens, types et observations des signaux ; le SDK vérifie cette conservation.',
              'prepareNetwork receives the mod’s observed signals before resolution. It can derive settings for that calculation, for example propagating an option across a number of following signals. It does not save those values. Preserve signal count, order, identities, links, types and observations; the SDK checks that they are preserved.',
            ),
          ),
          code(preparedNetwork, literal('PreparedNetwork.kt')),
          text(
            t(
              'Dans cet exemple, zéro vise seulement la source ; deux vise la source et deux signaux suivants du même modèle. Le parcours s’arrête sur un lien absent, un cycle, un autre modèle ou des données non exploitables. La zone impose ici une fermeture : c’est une politique fictive pour démontrer la préparation, pas une convention de signalisation des travaux.',
              'In this example, zero targets only the source; two targets the source and two following signals of the same model. Traversal stops at a missing link, cycle, another model or unusable data. This area imposes closure: it is a fictional policy demonstrating preparation, not a work-zone signalling convention.',
            ),
          ),
          text(
            t(
              'Testez cette fonction avec des valeurs Kotlin et vérifiez que les entrées restent inchangées. prepareObservedNetwork contrôle les identités et la conservation du réseau ; evaluateNetwork résout ensuite les dépendances. Évitez de refaire la même recherche globale dans chaque règle de signal.',
              'Test this function with Kotlin values and verify the inputs remain unchanged. prepareObservedNetwork checks identities and network preservation; evaluateNetwork then resolves dependencies. Avoid repeating the same global search inside every signal rule.',
            ),
          ),
        ],
      },
      {
        id: 'migration',
        title: t('Conserver des identités de réglages stables', 'Keep setting identities stable'),
        blocks: [
          text(
            t(
              'Changer un libellé ne nécessite pas de changer la clé. Conservez les identifiants du modèle, du catalogue et des réglages pour retrouver les valeurs d’une partie. onlyWhenEnabled peut servir à un avertissement visible tant qu’il reste à acquitter ; il ne change pas le sens métier de la case.',
              'Changing a label does not require changing its key. Retain model, catalogue and setting identities to find a game’s values. onlyWhenEnabled can represent a warning visible until acknowledged; it does not change the checkbox’s domain meaning.',
            ),
          ),
          text(
            t(
              'Si vous renommez volontairement une clé déjà distribuée, migrateSettings reçoit uniquement les valeurs réellement sauvegardées. Convertissez celles qui existent, laissez les autres absentes pour que leurs défauts soient complétés et rendez la transformation idempotente. Les nouveaux projets n’ont pas besoin de cette étape.',
              'If you deliberately rename an already distributed key, migrateSettings receives only actually saved values. Convert existing ones, leave others absent so defaults can be filled, and make the transformation idempotent. New projects do not need this step.',
            ),
          ),
          links(
            {
              label: t('Panneaux et champs numériques', 'Panels and numeric fields'),
              to: '/mods/interface',
            },
            {
              label: t('Traduire les libellés', 'Translate labels'),
              to: '/mods/metadonnees-traduites',
            },
            { label: t('Tester les réglages', 'Test settings'), to: '/maintenance/tests' },
          ),
        ],
      },
    ],
  },
  {
    slug: 'mods/images',
    title: t('Images et clignotement', 'Images and blinking'),
    group: 'Créer un mod',
    status: 'development',
    description: t(
      'Déclarez les ressources, sélectionnez les images et vérifiez une animation sur le temps simulé.',
      'Declare resources, select images and verify animation against simulation time.',
    ),
    sections: [
      {
        id: 'images',
        title: t('Relier les fichiers à l’indication', 'Connect files to the indication'),
        blocks: [
          text(
            t(
              'À partir d’un signalModel fonctionnel, placez les SVG dans assets et déclarez tous les chemins utilisés avec construction(states = …). assets/closed.svg devient closed.svg dans le paquet. images choisit un chemin de ce catalogue à partir de l’indication complète ; il ne modifie aucune consigne de conduite.',
              'Starting from a working signalModel, place SVGs in assets and declare every used path through construction(states = …). assets/closed.svg becomes closed.svg in the package. images selects a catalogue path from the complete indication; it changes no driving rule.',
            ),
          ),
          code(
            'construction(\n    states = listOf("closed.svg", "open.svg"),\n    size = 4, left = true\n)\nimages { indication ->\n    when (indication.aspect) {\n        Aspect.Closed -> "closed.svg"\n        Aspect.Open -> "open.svg"\n    }\n}',
            t('Fragment dans un modèle à deux aspects', 'Fragment inside a two-aspect model'),
          ),
          text(
            t(
              'size accepte 0 à 4 ; left et size sont les valeurs initiales de construction. Sans arguments, les valeurs sont size=0 et left=false. L’exemple choisit explicitement la gauche et la taille 4. Un catalogue conserve un ordre stable ; changer un libellé ne justifie pas de réordonner les images d’une version déjà utilisée.',
              'size accepts 0 through 4; left and size are initial construction values. Without arguments, defaults are size=0 and left=false. The example explicitly chooses left and size 4. Keep catalogue order stable; changing a label does not justify reordering images from an already used version.',
            ),
          ),
          text(
            t(
              'Chaque modèle possède sa propre sélection d’images. Un ordinal commun à deux enums ne signifie pas un aspect commun. Déclarez les chemins complets relatifs au paquet et vérifiez leur présence lors de assembleReleaseMod.',
              'Each model owns its image selection. An ordinal shared by two enums does not mean a shared aspect. Declare complete package-relative paths and verify they exist with assembleReleaseMod.',
            ),
          ),
          links({
            label: t('Catalogue et paquet généré', 'Catalogue and generated package'),
            to: '/mods/paquet-genere',
          }),
        ],
      },
      {
        id: 'clignoter',
        title: t('Déclarer une cadence liée au jeu', 'Declare a game-time cadence'),
        blocks: [
          code(blinkSignal, literal('BlinkSignal.kt')),
          text(
            t(
              'Ajoutez blinkingSignal à votre signalMod et fournissez closed.svg, on.svg et off.svg dans assets. Quand la règle renvoie Flashing, on et off alternent toutes les 250 millisecondes simulées. Ce modèle exige volontairement toujours l’arrêt : l’animation ne crée aucune permission.',
              'Add blinkingSignal to your signalMod and supply closed.svg, on.svg and off.svg in assets. When the rule returns Flashing, on and off alternate every 250 simulation milliseconds. This model deliberately always requires stopping: animation creates no permission.',
            ),
          ),
          table(
            [t('Déclaration', 'Declaration'), t('Résultat', 'Result')],
            [
              [
                literal('steady(path)'),
                t(
                  'Une image fixe, quel que soit le temps simulé.',
                  'A fixed image regardless of simulation time.',
                ),
              ],
              [
                literal('blink(on, off, everyMs)'),
                t(
                  'Deux images, chacune pendant 100 à 10000 ms simulées. 500 donne un cycle complet de 1000 ms.',
                  'Two images, each lasting 100 through 10000 simulation ms. 500 gives a complete 1000 ms cycle.',
                ),
              ],
              [
                literal('appearance { … }'),
                t(
                  'Retourne la description d’affichage de l’indication ; déclarez les descriptions réutilisées une seule fois.',
                  'Returns the indication’s appearance description; declare reused descriptions once.',
                ),
              ],
              [
                literal('frameAt(simulationMs)'),
                t(
                  'Calcule localement l’image à un instant positif ou nul pour vos tests.',
                  'Locally computes the frame at a nonnegative time for tests.',
                ),
              ],
            ],
          ),
          text(
            t(
              'La pause fige la phase ; l’accélération suit le temps simulé. Les signaux de même cadence sont synchronisés. Le mod n’a pas besoin de thread, de temporisation réelle ou de réévaluer ses règles pour chaque changement d’image. La fluidité effectivement visible dépend encore du rendu du jeu.',
              'Pause freezes the phase; acceleration follows simulation time. Signals with the same cadence are synchronized. The mod needs no thread, real-time timer or rule reevaluation for each frame change. Actual visible smoothness still depends on game rendering.',
            ),
          ),
          code(
            'val animation = blink("on.svg", "off.svg", everyMs = 250)\ncheck(animation.frameAt(0) == "on.svg")\ncheck(animation.frameAt(249) == "on.svg")\ncheck(animation.frameAt(250) == "off.svg")\ncheck(animation.frameAt(500) == "on.svg")',
            t('Vérification locale des limites de phase', 'Local phase-boundary check'),
          ),
          note(
            t(
              'animatedImages reste disponible pour une sélection par callback avec simulationMs et halfPeriodMs. Le rendu en partie de cette forme utilise deux images échantillonnées à sa demi-période ; elle n’est pas un lecteur d’animation arbitraire. Utilisez appearance et blink pour une cadence propre au modèle.',
              'animatedImages remains available for callback selection with simulationMs and halfPeriodMs. Its in-game rendering uses two images sampled at its half-period; it is not an arbitrary animation player. Use appearance and blink for a model-specific cadence.',
            ),
            t('Choisir la forme adaptée', 'Choose the appropriate form'),
          ),
        ],
      },
      {
        id: 'verification',
        title: t(
          'Distinguer règle, ressource et affichage',
          'Distinguish rule, resource and display',
        ),
        blocks: [
          list(
            t(
              'Testez l’indication produite par rules avant de vérifier son image.',
              'Test the indication produced by rules before checking its image.',
            ),
            t(
              'Vérifiez que chaque chemin retourné est déclaré et présent dans le paquet.',
              'Verify every returned path is declared and present in the package.',
            ),
            t(
              'Testez les frontières de frameAt, puis observez pause et accélération dans une partie de test.',
              'Test frameAt boundaries, then observe pause and acceleration in a test game.',
            ),
            t(
              'Si l’image est correcte mais le mouvement inattendu, examinez la consigne driving et son motif séparément.',
              'If the image is correct but movement is unexpected, inspect the driving rule and its reason separately.',
            ),
          ),
          links(
            {
              label: t('Référence des animations', 'Animation reference'),
              to: '/reference/signalanimation',
            },
            { label: t('Consignes de conduite', 'Driving rules'), to: '/mods/conduite' },
            {
              label: t('Diagnostic et journaux', 'Diagnostics and logs'),
              to: '/maintenance/journaux',
            },
          ),
        ],
      },
    ],
  },
  {
    slug: 'mods/conduite',
    title: t('Consignes de conduite', 'Driving rules'),
    group: 'Créer un mod',
    description: t(
      'Choisissez les cibles, les vitesses, les permissions et les conditions de fin de chaque restriction.',
      'Choose targets, speeds, permissions and end conditions for each restriction.',
    ),
    sections: [
      {
        id: 'choix',
        title: t('Associer une consigne à une indication', 'Associate a rule with an indication'),
        blocks: [
          text(
            t(
              'Ce guide complète un modèle dont les règles et les images sont déjà définies. AutomaticDriving construit une DrivingRule sans lire le jeu. Retournez cette valeur depuis driving : fabriquer une consigne dans une variable ne la publie pas. Votre mod définit les vitesses et la signification de chaque aspect et motif.',
              'This guide completes a model whose rules and images are already defined. AutomaticDriving builds a DrivingRule without reading the game. Return it from driving: creating a rule in a variable does not publish it. Your mod defines speeds and the meaning of every aspect and reason.',
            ),
          ),
          table(
            [t('Fonction', 'Function'), t('Cible et durée', 'Target and duration')],
            [
              [
                literal('stop()'),
                t(
                  'Arrêt au signal courant, sans autorisation de le franchir.',
                  'Stop at the current signal without permission to pass it.',
                ),
              ],
              [
                literal('clear()'),
                t(
                  'Libération des restrictions dont la politique attend Clear ; ne prouve pas une voie physiquement libre.',
                  'Release restrictions whose policy waits for Clear; does not prove a physically clear track.',
                ),
              ],
              [
                literal('announceStop(…)'),
                t(
                  'Arrêt mémorisé à un ou deux signaux en aval ; la permission de la cible peut le remplacer par la vitesse de passage jusqu’à la tête.',
                  'Remembered stop one or two signals downstream; target permission can replace it with the passage speed until the head passes.',
                ),
              ],
              [
                literal('limitAtSignal(…)'),
                t(
                  'Plafond ponctuel au signal courant, sans restriction conservée après franchissement.',
                  'Local ceiling at the current signal without a restriction retained after passage.',
                ),
              ],
              [
                literal('limitUntilClearThenRear(…)'),
                t(
                  'Plafond au signal courant ou à un/deux signaux en aval, retenu jusqu’au dégagement par la queue d’un Clear effectivement franchi.',
                  'Ceiling at the current signal or one/two signals downstream, retained until the rear clears a Clear signal actually passed.',
                ),
              ],
              [
                literal('restrictedUntilNextSignal(…)'),
                t(
                  'Après entrée, plafond et freinage sur l’espace physiquement libre jusqu’au passage de la tête au signal suivant.',
                  'After entry, a ceiling and braking for physically clear space until the head passes the next signal.',
                ),
              ],
            ],
          ),
          text(
            t(
              'Les couleurs ne déterminent aucune permission. Deux indications qui partagent le même aspect peuvent choisir des consignes différentes selon leur motif. Une fonction driving qui renvoie null ne fournit aucune consigne ; null ne doit pas être assimilé à clear().',
              'Colours determine no permission. Two indications sharing an aspect can choose different rules according to their reason. A driving function returning null supplies no rule; null must not be treated as clear().',
            ),
          ),
        ],
      },
      {
        id: 'vitesses',
        title: t(
          'Choisir des vitesses et permissions explicites',
          'Choose explicit speeds and permissions',
        ),
        blocks: [
          text(
            t(
              'Toutes les vitesses de ces helpers sont en mètres par seconde. Convertissez une valeur choisie en km/h en la divisant par 3,6, une seule fois à la frontière de votre configuration. Les valeurs doivent être finies ; zéro désigne un arrêt, jamais une vitesse de circulation implicite.',
              'All helper speeds are in metres per second. Convert a chosen km/h value by dividing it by 3.6 once at your configuration boundary. Values must be finite; zero denotes a stop, never an implicit running speed.',
            ),
          ),
          table(
            [t('Paramètre', 'Parameter'), t('Interprétation et limites', 'Meaning and limits')],
            [
              [
                literal('signalsAhead'),
                t(
                  '1 ou 2 pour announceStop ; 0, 1 ou 2 pour limitUntilClearThenRear. Zéro vise le signal courant.',
                  '1 or 2 for announceStop; 0, 1 or 2 for limitUntilClearThenRear. Zero targets the current signal.',
                ),
              ],
              [
                literal('passableHere'),
                t(
                  'Permission du signal courant selon la politique choisie ; ne donne aucune permission au signal cible et ne retire pas les autres restrictions.',
                  'Current-signal permission under the chosen policy; grants no target-signal permission and removes no other restrictions.',
                ),
              ],
              [
                literal('followTargetSpeed'),
                t(
                  'Autorise le suivi de la vitesse numérique déclarée par la cible d’une annonce.',
                  'Allows following the numeric speed declared by an announcement target.',
                ),
              ],
              [
                literal('cancelAtNextClear'),
                t(
                  'Option d’annonce acceptée seulement avec followTargetSpeed=true et signalsAhead=2.',
                  'Announcement option accepted only with followTargetSpeed=true and signalsAhead=2.',
                ),
              ],
              [
                literal('limitAtSignal'),
                t(
                  'Vitesse positive ou nulle ; passableHere=true exige une vitesse strictement positive.',
                  'Nonnegative speed; passableHere=true requires a strictly positive speed.',
                ),
              ],
              [
                literal('limitUntilClearThenRear'),
                t(
                  'Vitesse strictement positive. Une réouverture ne suffit pas à effacer une restriction mémorisée.',
                  'Strictly positive speed. Reopening alone does not erase a remembered restriction.',
                ),
              ],
              [
                literal('restrictedUntilNextSignal'),
                t(
                  'maximumSpeedMps > 0 et 0 ≤ entrySpeedMps ≤ maximumSpeedMps ; stopFirst=true exige entrySpeedMps=0.',
                  'maximumSpeedMps > 0 and 0 ≤ entrySpeedMps ≤ maximumSpeedMps; stopFirst=true requires entrySpeedMps=0.',
                ),
              ],
            ],
          ),
          text(
            t(
              'Avec stopFirst, l’entrée restreinte attend une preuve d’arrêt. Sans cette option, la vitesse d’entrée peut être choisie explicitement. Choisissez la condition de libération selon votre règle : une libération par la tête et une libération par la queue ne couvrent pas la même longueur de train.',
              'With stopFirst, restricted entry waits for evidence of a stop. Without that option, entry speed can be chosen explicitly. Choose the release condition according to your rule: head and rear release do not cover the same train length.',
            ),
          ),
        ],
      },
      {
        id: 'exemple-politique',
        title: t('Une politique fictive que vous pouvez tester', 'A fictional policy you can test'),
        blocks: [
          code(drivingRules, literal('DrivingRules.kt')),
          text(
            t(
              'Ce fichier définit une fonction pure instruction. Intégrez-la dans un signalModel utilisant cet enum Aspect et son propre enum de motifs. Closed impose l’arrêt ; Warning annonce le signal suivant ; Restricted choisit ici une entrée sans arrêt préalable ; Open émet Clear. Ces choix et vitesses appartiennent uniquement à cet exemple.',
              'This file defines the pure instruction function. Use it in a signalModel with this Aspect enum and its own reason enum. Closed requires stopping; Warning announces the next signal; Restricted here chooses entry without a prior stop; Open emits Clear. These choices and speeds belong only to this example.',
            ),
          ),
          code(
            'val speeds = wiki.driving.Speeds(passageKmh = 25.0, restrictedKmh = 12.0)\nval rule = wiki.driving.instruction(wiki.driving.Aspect.Warning, speeds)\ncheck(rule.signalsAhead == 1)\ncheck(rule.reopenedSpeedMps == 25.0 / 3.6)\ncheck(DrivingFlag.ApproachPassable in rule.flags)',
            t('Contrôles sur la consigne retournée', 'Checks on the returned rule'),
          ),
          table([t('Argument ou résultat', 'Argument or result'), t('Valeur dans ce test', 'Value in this test'), t('Interprétation', 'Meaning')], [
            [literal('passageKmh / restrictedKmh'), literal('25.0 / 12.0 km/h'), t('Paramètres métier de cette fonction, finis et strictement positifs.', 'Policy inputs of this function, finite and strictly positive.')],
            [literal('signalsAhead'), literal('1'), t('Le prochain signal aval est la cible ; ce nombre n’est pas une distance.', 'The next downstream signal is the target; this number is not a distance.')],
            [literal('reopenedSpeedMps'), literal('25.0 / 3.6 ≈ 6.94 m/s'), t('La fonction convertit la vitesse de passage en unités attendues par la conduite.', 'The function converts passage speed to the units expected by driving.')],
            [literal('DrivingRule'), t('Objet retourné par instruction', 'Object returned by instruction'), t('Il n’agit sur un train que s’il est retourné par le callback driving du modèle.', 'It affects a train only when returned by the model’s driving callback.')],
          ]),
          text(
            t(
              'Complétez les tests avec la cible fermée puis autorisée, le passage de la tête, le dégagement de la queue pour une restriction HoldToClear et une observation devenue inconnue. Vérifiez aussi qu’une permission au signal courant ne donne pas une permission à la cible.',
              'Extend tests with a closed then permitted target, head passage, rear clearance for a HoldToClear restriction, and an observation becoming unknown. Also verify that permission at the current signal does not grant permission at its target.',
            ),
          ),
        ],
      },
      {
        id: 'limites',
        title: t(
          'Comprendre les effets qui dépassent l’affichage',
          'Understand effects beyond display',
        ),
        blocks: [
          note(
            t(
              'Sous Windows, la permission de marche restreinte peut remplacer le verrou d’occupation/réservation sur la voie suivie. Les obstacles physiques, les conflits de croisement et les contrôles d’itinéraire restent bloquants. Le mod doit choisir quand cette entrée est permise ; une voie réservée ne devient pas libre.',
              'On Windows, restricted-movement permission can replace the followed track’s occupancy/reservation gate. Physical obstacles, crossing conflicts and route checks remain blocking. The mod must choose when this entry is permitted; a reserved track does not become clear.',
            ),
            t('Marche restreinte', 'Restricted movement'),
          ),
          text(
            t(
              'maximumLineSpeed est une option du mod, désactivée par défaut. Elle permet d’utiliser le maximum du matériel comme plafond de marche tout en conservant une cible native active ; son effet peut aussi concerner des trains sans contrainte de signal de votre mod. N’activez cette option que si elle fait partie du comportement voulu et testé.',
              'maximumLineSpeed is a mod option disabled by default. It allows the material maximum as a cruising ceiling while retaining an active native target; it can also affect trains without your mod’s signal constraints. Enable it only when it is part of the intended, tested behaviour.',
            ),
          ),
          text(
            t(
              'drivingPlan prend Vehicle, DrivingSettings, DrivingInput et des Constraint et retourne un DrivingPlan de calcul ou de diagnostic. Ce résultat n’actionne pas directement le train. Pour la conduite en partie, définissez les DrivingRule des signaux ; ne supposez pas qu’un plan consultatif remplace ces consignes.',
              'drivingPlan takes Vehicle, DrivingSettings, DrivingInput and Constraint values and returns a computational or diagnostic DrivingPlan. This result does not directly control the train. Define signal DrivingRule values for in-game driving; do not assume an advisory plan replaces them.',
            ),
          ),
          links(
            {
              label: t('Référence AutomaticDriving', 'AutomaticDriving reference'),
              to: '/reference/automaticdriving',
            },
            {
              label: t('Recettes de contrôle en jeu', 'In-game control tests'),
              to: '/lire/recettes',
            },
            { label: t('Tests et cas limites', 'Tests and edge cases'), to: '/maintenance/tests' },
          ),
        ],
      },
    ],
  },
]
