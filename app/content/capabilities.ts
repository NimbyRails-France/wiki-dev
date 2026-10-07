import type { Article } from './schema'
import { text, code, note, table, links } from './schema'

export const capabilitiesEnglish: Record<string, string> = {}
const t = (fr: string, en: string) => {
  capabilitiesEnglish[fr] = en
  return fr
}
const literal = (value: string) => t(value, value)

export const capabilities: Article[] = [
  {
    slug: 'commencer/possibilites',
    title: t('Trouver la bonne fonction', 'Find the right function'),
    group: 'Commencer',
    description: t(
      'Partez du résultat souhaité pour choisir une API Native ou JVM et son guide.',
      'Start from the desired outcome to choose a Native or JVM API and guide.',
    ),
    sections: [
      {
        id: 'dans-le-mod',
        title: t('Signaux et outils intégrés au jeu', 'Signals and in-game tools'),
        blocks: [
          text(
            t(
              'Utilisez le package nimby dans un projet Kotlin/Native. Les fonctions ci-dessous sont des points d’entrée ; leurs guides expliquent les conditions, les valeurs inconnues et les résultats à traiter. Vos règles restent propres à votre mod.',
              'Use package nimby in a Kotlin/Native project. The functions below are entry points; their guides explain conditions, unknown values and results to handle. Your rules remain specific to your mod.',
            ),
          ),
          table(
            [
              t('Résultat recherché', 'Desired outcome'),
              t('API à consulter', 'API to look up'),
              t('Décision de l’auteur', 'Author decision'),
            ],
            [
              [
                t('Plusieurs modèles de signaux', 'Several signal models'),
                literal('signalModel · signalMod · signal · Indication'),
                t(
                  'Types d’aspect et de motif, règles et repli de chaque modèle.',
                  'Aspect and reason types, rules and fallback for each model.',
                ),
              ],
              [
                t('Décider à partir du réseau', 'Decide from the network'),
                literal('rules · next · of · invalidNetwork'),
                t(
                  'Priorités locales, dépendance au voisin et liens non résolus.',
                  'Local priorities, neighbour dependencies and unresolved links.',
                ),
              ],
              [
                t('Détecter une approche en amont', 'Detect an upstream approach'),
                literal('observeApproach · trainApproaching · approachingTrain'),
                t(
                  'Nombre de cantons observés et effet d’une approche confirmée.',
                  'Number of observed blocks and effect of a confirmed approach.',
                ),
              ],
              [
                t('Réglages persistants et visibilité', 'Persistent settings and visibility'),
                literal('checkbox · NumberSetting · enabled · number · settingsStatus'),
                t(
                  'Identifiants stables, défauts, bornes, ordre et visibilité.',
                  'Stable identifiers, defaults, bounds, order and visibility.',
                ),
              ],
              [
                t('Apparence fixe ou animée', 'Static or animated appearance'),
                literal('construction · images · appearance · steady · blink'),
                t(
                  'Ressources, ordre du catalogue et cadence en temps simulé.',
                  'Resources, catalogue order and simulated-time cadence.',
                ),
              ],
              [
                t('Décrire la conduite', 'Describe driving behaviour'),
                literal('driving · AutomaticDriving · DrivingRule'),
                t(
                  'Vitesses en m/s, arrêt et conditions de libération.',
                  'Speeds in m/s, stopping and release conditions.',
                ),
              ],
              [
                t('Partager une préparation entre signaux', 'Share preparation across signals'),
                literal('prepareNetwork · Signal'),
                t(
                  'Calcul borné sur des copies, sans modifier les données persistantes.',
                  'Bounded computation on copies without modifying persistent data.',
                ),
              ],
              [
                t('Proposer un service optionnel', 'Offer an optional service'),
                literal('action · whenMod · service · toolMod'),
                t(
                  'Disponibilité du fournisseur et comportement en son absence.',
                  'Provider availability and behaviour when it is absent.',
                ),
              ],
              [
                t('Panneaux, champs et fenêtres', 'Panels, fields and windows'),
                literal('ToolContext · ToolNumberInput · ToolWindow'),
                t(
                  'Validation de la saisie, génération de fenêtre et durée des callbacks.',
                  'Input validation, window generation and callback lifetime.',
                ),
              ],
              [
                t('Parcourir et copier des signaux', 'Traverse and copy signals'),
                literal('ToolTopology · travelDirection · placementAt'),
                t(
                  'Limites de parcours, longueurs inconnues et sens de circulation.',
                  'Traversal bounds, unknown lengths and travel direction.',
                ),
              ],
              [
                t('Prévisualiser puis construire', 'Preview then construct'),
                literal('showSignalPreview · createSignals · ConstructionResult'),
                t(
                  'Confirmation, suivi et annulation autorisée.',
                  'Confirmation, tracking and permitted undo.',
                ),
              ],
              [
                t('Lire des trains depuis un outil', 'Read trains from a tool'),
                literal('ToolContext.trains · TrainQuery · TrainSnapshot'),
                t(
                  'Groupes nécessaires, fraîcheur et conservation des copies.',
                  'Required groups, freshness and retention of copied values.',
                ),
              ],
              [
                t('Lire le calendrier', 'Read the calendar'),
                literal('ToolContext.clock · GameDateTime'),
                t('Temps simulé et conversion des dates.', 'Simulated time and date conversion.'),
              ],
              [
                t('Traduire et lire des ressources', 'Translate and read resources'),
                literal('tr · translations.json · readTextFile'),
                t(
                  'Textes visibles, langue de repli et chemins relatifs au paquet.',
                  'Visible text, fallback language and package-relative paths.',
                ),
              ],
            ],
          ),
          links(
            { label: t('Modèles et réseau', 'Models and network'), to: '/mods/signaux' },
            { label: t('Réglages', 'Settings'), to: '/mods/reglages' },
            { label: t('Apparence', 'Appearance'), to: '/mods/images' },
            { label: t('Conduite', 'Driving'), to: '/mods/conduite' },
            { label: t('Interface des outils', 'Tool interface'), to: '/mods/interface' },
            { label: t('Cycle des outils', 'Tool lifecycle'), to: '/mods/cycle-outils' },
            { label: t('Parcours des voies', 'Track traversal'), to: '/mods/parcours-voies' },
            {
              label: t('Préparation du réseau', 'Network preparation'),
              to: '/mods/preparer-reseau',
            },
            { label: t('Horloge en jeu', 'In-game clock'), to: '/mods/horloge' },
          ),
        ],
      },
      {
        id: 'depuis-un-outil',
        title: t('Applications Kotlin/JVM connectées', 'Connected Kotlin/JVM applications'),
        blocks: [
          text(
            t(
              'Utilisez fr.nimby.sdk lorsque votre programme s’exécute séparément du jeu. Commencez par Nimby.connect, fermez les ressources que vous ouvrez et choisissez vos lectures selon votre besoin. Une observation conservée reste une copie de son instant de capture.',
              'Use fr.nimby.sdk when your program runs separately from the game. Start with Nimby.connect, close resources you open and choose reads according to your needs. A retained observation remains a copy from its capture time.',
            ),
          ),
          table(
            [
              t('Résultat recherché', 'Desired outcome'),
              t('API à consulter', 'API to look up'),
              t('Point à vérifier', 'Check'),
            ],
            [
              [
                t('Connexion et copie du réseau', 'Connection and network snapshot'),
                literal('Nimby.connect · Game · snapshot · Observation'),
                t(
                  'Jeu choisi, durée de la connexion, disponibilité et session.',
                  'Selected game, connection lifetime, availability and session.',
                ),
              ],
              [
                t('Trains et groupes optionnels', 'Trains and optional groups'),
                literal('Game.trains.snapshot · TrainQuery · TrainId · Observation'),
                t(
                  'Demandé, non demandé, absent et vide sont des états distincts.',
                  'Requested, not requested, absent and empty are distinct states.',
                ),
              ],
              [
                t('Lignes et tags', 'Lines and tags'),
                literal('Line · LineId · LineType · Tag · tagsForLine'),
                t(
                  'Identités, héritage et valeurs effectivement disponibles.',
                  'Identities, inheritance and actually available values.',
                ),
              ],
              [
                t('Service, horaires et retard', 'Service, timetables and delay'),
                literal('TrainDetails · Timetable · LineStop · predictedArrivalDelaySeconds'),
                t(
                  'Heure absolue, offset de plan et retard prédit signé.',
                  'Absolute time, plan offset and signed predicted delay.',
                ),
              ],
              [
                t('Matériel et composition', 'Material and composition'),
                literal('TrainCharacteristics · TrainVehicle · VehicleModel · TrainMetadata'),
                t(
                  'Configuration, valeurs courantes, unités, capacité et voyageurs.',
                  'Configuration, current values, units, capacity and passengers.',
                ),
              ],
              [
                t('Dynamique ciblée', 'Targeted dynamics'),
                literal('readTrain · DrivingObservation · TrainDynamics'),
                t(
                  'Vitesse observée, propriétés physiques et données inconnues.',
                  'Observed speed, physical properties and unknown data.',
                ),
              ],
              [
                t('Géométrie et distances', 'Geometry and distances'),
                literal('TrackMetric · fraction · lengthM'),
                t(
                  'Sens et longueur connue avant conversion en mètres.',
                  'Direction and known length before conversion to metres.',
                ),
              ],
              [
                t('Calendrier', 'Calendar'),
                literal('Game.clock · SimulationClock'),
                t(
                  'Temps simulé et résultat des changements demandés.',
                  'Simulated time and result of requested changes.',
                ),
              ],
              [
                t('Contrôle temporaire', 'Temporary control'),
                literal('Game.mods · ModControlSession · ControlRequest'),
                t(
                  'Permissions, durée, restauration et fermeture.',
                  'Permissions, duration, restoration and closure.',
                ),
              ],
              [
                t('Création et suivi', 'Creation and tracking'),
                literal('Construction'),
                t(
                  'Tickets, résultats partiels et annulation autorisée.',
                  'Tickets, partial results and permitted undo.',
                ),
              ],
              [
                t('Diagnostic de votre application', 'Application diagnostics'),
                literal('DiagnosticLog'),
                t(
                  'Événements utiles, sans message à chaque lecture.',
                  'Useful events without a message on every read.',
                ),
              ],
            ],
          ),
          links(
            { label: t('Connexion', 'Connection'), to: '/lire/connexion' },
            {
              label: t('Choisir les données de trains', 'Choose train data'),
              to: '/lire/trains-observations',
            },
            { label: t('Lignes et tags', 'Lines and tags'), to: '/lire/lignes-et-tags' },
            {
              label: t('Horaires et retards', 'Timetables and delays'),
              to: '/lire/horaires-trains',
            },
            { label: t('Matériel et voyageurs', 'Material and passengers'), to: '/lire/materiel' },
            { label: t('Contrôle temporaire', 'Temporary control'), to: '/lire/recettes' },
            { label: t('Construction', 'Construction'), to: '/lire/construction' },
          ),
          note(
            t(
              'Lire une donnée ne donne pas le droit de la modifier. Les tags et les horaires peuvent servir à vos analyses, mais ne constituent pas une priorité de circulation automatiquement appliquée par le SDK. Consultez les commandes et capacités explicitement exposées avant de proposer une action.',
              'Reading data does not grant permission to modify it. Tags and timetables can support your analysis, but do not constitute a traffic priority automatically applied by the SDK. Check explicitly exposed commands and capabilities before offering an action.',
            ),
          ),
        ],
      },
      {
        id: 'livraison',
        title: t('Du projet au paquet vérifié', 'From project to verified package'),
        blocks: [
          text(
            t(
              'Le plugin Gradle concerne les projets Native ; la référence Kotlin distingue chaque API Native/JVM. Pour une fonction précise, ouvrez son type, lisez les unités et les résultats inconnus, puis suivez l’exemple du guide lié.',
              'The Gradle plugin applies to Native projects; the Kotlin reference distinguishes each Native/JVM API. For a specific function, open its type, read units and unknown-result semantics, then follow the linked guide example.',
            ),
          ),
          links(
            {
              label: t('Contrat du projet Gradle', 'Gradle project contract'),
              to: '/reference/projet-gradle',
            },
            { label: t('Tester', 'Test'), to: '/maintenance/tests' },
            { label: t('Performance', 'Performance'), to: '/maintenance/performances' },
            { label: t('Distribuer', 'Distribute'), to: '/maintenance/distribution' },
            {
              label: t('Référence Kotlin complète', 'Complete Kotlin reference'),
              to: '/reference',
            },
          ),
        ],
      },
    ],
  },
  {
    slug: 'mods/exemples-sfr',
    title: t('Lire trois choix d’un mod de signalisation', 'Read three signalling mod decisions'),
    group: 'Créer un mod',
    description: t(
      'Des extraits d’AB Signalisation lumineuse illustrent la séparation entre observation, décision, apparence et conduite.',
      'AB Signalisation lumineuse excerpts illustrate the separation between observation, decision, appearance and driving.',
    ),
    sections: [
      {
        id: 'approche',
        title: t(
          'Une approche observée, une ouverture décidée',
          'An observed approach, a chosen opening',
        ),
        blocks: [
          text(
            t(
              'Prérequis : connaître signalModel et rules. Ces fragments proviennent d’AB Signalisation lumineuse ; CarreAspect, CarreReason et CarreDecision appartiennent à ce mod. Ils expliquent un mécanisme sans constituer un projet autonome.',
              'Prerequisite: familiarity with signalModel and rules. These fragments come from AB Signalisation lumineuse; CarreAspect, CarreReason and CarreDecision belong to that mod. They explain a mechanism without constituting a standalone project.',
            ),
          ),
          code(
            'observeApproach(blocks = 2)',
            t('Déclaration du modèle Carré Avertissement', 'Carré Avertissement model declaration'),
          ),
          code(
            'if (!context.trainApproaching)\n    return closed(CarreReason.AwaitingApproach)\nreturn CarreDecision(CarreAspect.Warning, CarreReason.ApproachConfirmed)',
            t(
              'Fin de la règle, après ses autres vérifications',
              'End of the rule, after its other checks',
            ),
          ),
          text(
            t(
              'Le SDK fournit l’observation d’approche ; le mod choisit si elle permet d’ouvrir. Les réglages, la fraîcheur, la panne, l’arrêt forcé et l’occupation aval sont traités avant ces lignes. La tolérance éventuelle à un aval inconnu appartient au modèle concerné, pas à tous les signaux.',
              'The SDK supplies the approach observation; the mod decides whether it permits opening. Settings, freshness, failure, forced stop and downstream occupancy are handled before these lines. Any tolerance for unknown downstream state belongs to the specific model, not every signal.',
            ),
          ),
          links({
            label: t('Observations et règles de réseau', 'Observations and network rules'),
            to: '/mods/signaux',
          }),
        ],
      },
      {
        id: 'images',
        title: t('Préparer une animation réutilisable', 'Prepare a reusable animation'),
        blocks: [
          code(
            'private val redFlash = blink(\n    on = "imgs/ca/sem_bal/tex09.svg",\n    off = "imgs/ca/sem_bal/tex10.svg",\n    everyMs = 500\n)',
            t('Description d’animation dans BalTextures', 'Animation description in BalTextures'),
          ),
          code(
            'appearance { BalTextures.forAspect(it.aspect) }',
            t('Sélection de l’animation par le modèle', 'Model animation selection'),
          ),
          text(
            t(
              'Le mod prépare les descriptions une seule fois et choisit celle de l’aspect courant. Le SDK utilise le temps simulé pour déterminer la phase. Le callback ne doit pas alterner lui-même les images selon l’horloge réelle. Un modèle fixe peut simplement déclarer images.',
              'The mod prepares descriptions once and chooses the one for the current aspect. The SDK uses simulated time to determine phase. The callback should not alternate images itself using real time. A static model can simply declare images.',
            ),
          ),
          links({ label: t('Images et animation', 'Images and animation'), to: '/mods/images' }),
        ],
      },
      {
        id: 'conduite',
        title: t(
          'Relier une consigne au motif de fermeture',
          'Connect an instruction to the closure reason',
        ),
        blocks: [
          code(
            'BalAspect.S ->\n    if (decision.reason == BalReason.BlockOccupied)\n        AutomaticDriving.restrictedUntilNextSignal(\n            entrySpeedMps = 0.0,\n            maximumSpeedMps = ON_SIGHT_SPEED,\n            stopFirst = true\n        )\n    else AutomaticDriving.stop()',
            t('Branche du calcul de conduite BAL', 'BAL driving calculation branch'),
          ),
          text(
            t(
              'Pour une fermeture due à l’occupation, AB Signalisation lumineuse demande ici un arrêt avant une marche limitée jusqu’au prochain signal. D’autres motifs demandent un arrêt sans cette permission. ON_SIGHT_SPEED est une vitesse choisie par le mod, en m/s. Cet extrait ne crée pas une règle ferroviaire universelle.',
              'For closure caused by occupancy, AB Signalisation lumineuse requests a stop before restricted movement until the next signal. Other reasons request a stop without that permission. ON_SIGHT_SPEED is a speed chosen by the mod, in m/s. This excerpt does not establish a universal railway rule.',
            ),
          ),
          note(
            t(
              'Définissez vos propres types, limites et cas de test. Testez la décision, la consigne produite et le comportement en partie : une couleur identique peut correspondre à des permissions différentes.',
              'Define your own types, limits and test cases. Test the decision, produced instruction and in-game behaviour: the same colour can correspond to different permissions.',
            ),
          ),
          links(
            { label: t('Consignes de conduite', 'Driving instructions'), to: '/mods/conduite' },
            { label: t('Tester les décisions', 'Test decisions'), to: '/maintenance/tests' },
          ),
        ],
      },
    ],
  },
]
