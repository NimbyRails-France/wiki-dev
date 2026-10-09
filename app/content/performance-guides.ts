import type { Article } from './schema'
import { text, code, note, table, links } from './schema'
import preparedExample from './snippets/PreparedNetwork.kt?raw'

export const performanceGuidesEnglish: Record<string, string> = {}
const t = (fr: string, en: string) => {
  performanceGuidesEnglish[fr] = en
  return fr
}
const literal = (value: string) => t(value, value)

export const performanceGuides: Article[] = [
  {
    slug: 'mods/preparer-reseau',
    group: 'Créer un mod',
    title: t('Préparer les réglages effectifs du réseau', 'Prepare effective network settings'),
    description: t(
      'Une transformation pure avant les règles : portée de travaux, valeurs dérivées et tests sans partie.',
      'A pure transformation before rules: work-zone range, derived values and tests without a game.',
    ),
    sections: [
      {
        id: 'contrat',
        title: t('Ce que prepareNetwork peut changer', 'What prepareNetwork may change'),
        blocks: [
          text(
            t(
              'Déclarez prepareNetwork dans signalMod quand plusieurs signaux participent à une même règle. Le callback reçoit les signaux observés du mod, avant leurs décisions. Il renvoie les réglages effectifs utilisés pour cette évaluation. Il n’enregistre aucun réglage, ne construit aucun signal et ne modifie pas les observations du jeu. Une portée de travaux, par exemple, peut activer une option sur les prochains signaux uniquement dans cette copie.',
              'Declare prepareNetwork in signalMod when several signals participate in one rule. The callback receives the mod’s observed signals before decisions. It returns effective settings used for this evaluation. It saves no settings, builds no signals and changes no game observations. A work-zone range, for example, can activate an option on following signals only in this copy.',
            ),
          ),
          table(
            [t('Conserver', 'Preserve'), t('Transformer', 'Transform')],
            [
              [
                t(
                  'Nombre et ordre des entrées, ID complet, modèle, lien nextSignal, observation et disponibilité.',
                  'Entry count and order, complete ID, model, nextSignal link, observation and availability.',
                ),
                t(
                  'Les valeurs effectives de settings, en produisant une copie des seuls signaux modifiés.',
                  'Effective settings values, copying only signals that change.',
                ),
              ],
              [
                t(
                  'La différence entre inconnu, occupé et libre ; les frontières absentes du réseau du mod.',
                  'The distinction between unknown, occupied and clear, and boundaries absent from the mod’s network.',
                ),
                t(
                  'La politique métier explicite : portée, priorité entre sources, traitement d’une donnée inconnue.',
                  'Explicit domain policy: range, priority between sources, and handling of unknown data.',
                ),
              ],
            ],
          ),
          note(
            t(
              'N’écrivez pas dans la liste reçue et ne forcez pas fresh=true. Ne persistez pas les valeurs propagées : au cycle suivant, repartez des valeurs réellement observées pour qu’une option retirée cesse aussi de se propager. La migration des réglages sauvegardés est un mécanisme différent.',
              'Do not mutate the received list or force fresh=true. Do not persist propagated values: start from genuinely observed settings each cycle so removing an option also stops its propagation. Migrating saved settings is a separate mechanism.',
            ),
          ),
        ],
      },
      {
        id: 'exemple',
        title: t('Source de travaux et portée entière', 'Work-zone source and integer range'),
        blocks: [
          code(
            preparedExample,
            t(
              'PreparedNetwork.kt — modèle et préparation testables',
              'PreparedNetwork.kt — testable model and preparation',
            ),
          ),
          text(
            t(
              'L’exemple choisit une règle simple : workBlocks vaut zéro pour la source seule et indique ensuite un nombre de liens nextSignal. Il prépare une table d’identifiants une fois, parcourt au plus 65 signaux par source et coupe aux cycles, modèles différents ou données indisponibles. Ce n’est pas une distance en mètres ni un calcul d’itinéraire. Le résultat original reste intact ; read et withValue de NumberSetting évitent de connaître le stockage du nombre.',
              'The example chooses a simple policy: workBlocks is zero for the source alone, then counts nextSignal links. It builds an ID lookup once, visits at most 65 signals per source and stops at cycles, other models or unavailable data. This is neither a distance in metres nor route planning. The original input stays intact; NumberSetting.read and withValue avoid knowledge of numeric storage.',
            ),
          ),
          text(
            t(
              'Dans le projet du premier signal, placez ce fichier dans src/main/kotlin/wiki/prepared/PreparedNetwork.kt et conservez assets/closed.svg et assets/open.svg. Remplacez Entry.kt par le point d’entrée ci-dessous : modInfo conserve l’identité du manifeste et createPreparedMod fournit les métadonnées du paquet. Adaptez les anciens tests à model et createPreparedMod. Les identifiants et chemins du modèle sont des exemples ; gardez les vôtres stables après distribution.',
              'In the first-signal project, place this file at src/main/kotlin/wiki/prepared/PreparedNetwork.kt and keep assets/closed.svg and assets/open.svg. Replace Entry.kt with the entry point below: modInfo preserves the manifest identity and createPreparedMod supplies package metadata. Adapt the previous tests to model and createPreparedMod. Model IDs and paths are examples; keep your own stable after distribution.',
            ),
          ),
          code('package nimby.mod\n\nimport wiki.prepared.createPreparedMod\n\nfun createMod() = createPreparedMod(modInfo)', literal('src/main/kotlin/Entry.kt')),
        ],
      },
      {
        id: 'arguments',
        title: t('Entrée, résultat et exemple à trois signaux', 'Input, result and a three-signal example'),
        blocks: [
          table([t('Élément', 'Element'), t('Contrat de l’exemple', 'Example contract')], [
            [literal('signals: List<Signal>'), t('Liste observée du mod. Chaque entrée apporte id, type, nextSignal, settings et la fraîcheur de l’observation.', 'The mod’s observed list. Each entry supplies id, type, nextSignal, settings and observation freshness.')],
            [literal('workBlocks.read(source.settings)'), t('Nombre entier de liens suivants, entre 0 et 64 ; zéro signifie la source seule.', 'Integer number of following links, from 0 through 64; zero means the source only.')],
            [literal('List<Signal>'), t('Nouvelle liste de même taille et ordre ; seuls les réglages effectifs concernés changent. Les données d’entrée ne sont pas modifiées.', 'A new list with the same size and order; only the affected effective settings change. Input data is not modified.')],
          ]),
          text(t(
            'Supposons A → B → C, trois signaux de ce modèle, avec des observations fraîches et des réglages disponibles. A active work avec workBlocks=1 ; B et C n’activent pas work. Le résultat effectif active work sur A et B, mais pas sur C. Mettre workBlocks=0 conserve seulement A. Retirer work sur A lors de la lecture suivante arrête cette propagation : les valeurs dérivées du résultat précédent ne sont pas réutilisées comme entrée.',
            'Assume A → B → C, three signals of this model with fresh observations and available settings. A enables work with workBlocks=1; B and C do not enable work. The effective result enables work on A and B, but not C. Setting workBlocks=0 retains A only. Removing work from A in the next read stops that propagation: derived values from the previous result are not reused as input.',
          )),
          text(t(
            'Si B est absent, appartient à un autre modèle ou possède une observation indisponible, l’exemple arrête la propagation avant de traverser cette frontière. Il ne cherche pas un autre itinéraire. Cette politique est choisie par cet exemple et peut être remplacée par votre règle métier en conservant les limites de parcours.',
            'If B is absent, belongs to another model or has an unavailable observation, the example stops propagation before crossing that boundary. It does not look for another route. This example chooses that policy; you can replace it with your domain rule while keeping traversal bounded.',
          )),
        ],
      },
      {
        id: 'tester',
        title: t('Tester les données dérivées', 'Test derived data'),
        blocks: [
          text(
            t(
              'Dans un test, appelez mod.prepareObservedNetwork(input) pour examiner les réglages préparés avec les gardes du SDK, ou mod.evaluateNetwork(input) pour vérifier les décisions finales. Vérifiez une portée nulle, une limite, un cycle, une frontière absente, une source retirée et une observation indisponible. Comparez aussi le réseau d’entrée après l’appel pour prouver qu’il n’a pas été modifié. N’appliquez pas deux fois la préparation au même résultat dérivé.',
              'In a test, call mod.prepareObservedNetwork(input) to inspect prepared settings through the SDK guards, or mod.evaluateNetwork(input) to check final decisions. Test a zero range, a limit, a cycle, a missing boundary, a removed source and an unavailable observation. Also compare the input after the call to prove it was not mutated. Do not apply preparation twice to the same derived result.',
            ),
          ),
          links(
            {
              label: t('Réglage numérique ou formulaire', 'Numeric setting or form input'),
              to: '/mods/interface#nombres',
            },
            {
              label: t('Garder les callbacks courts', 'Keep callbacks short'),
              to: '/maintenance/performances',
            },
          ),
        ],
      },
    ],
  },
  {
    slug: 'maintenance/performances',
    group: 'Maintenance',
    title: t('Écrire un mod réactif et indépendant', 'Write a responsive, independent mod'),
    description: t(
      'Limiter le travail utile, gérer les reprises et mesurer sans confondre chargement, calcul et affichage.',
      'Bound useful work, handle recovery and measure without confusing loading, computation and display.',
    ),
    sections: [
      {
        id: 'isolation',
        title: t('Ce que le SDK prend en charge', 'What the SDK handles'),
        blocks: [
          text(
            t(
              'Le SDK surveille les mods natifs compatibles. Il peut arrêter un mod qui plante ou dont un callback ne répond plus, tout en laissant fonctionner les autres mods. Pour l’auteur du mod, le contrat reste simple : utiliser les fonctions publiques, borner chaque calcul et rendre la main. Après un arrêt pour faute, corrigez la cause et relancez une session de test ; ne supposez pas que le callback sera rejoué automatiquement.',
              'The SDK supervises compatible native mods. It can stop a mod that crashes or whose callback stops responding while other mods keep running. The mod-author contract stays simple: use public functions, bound each calculation and return. After a fault stops a mod, fix the cause and start a new test session; do not assume that the callback will be replayed automatically.',
            ),
          ),
          note(
            t(
              'L’isolation ne rend pas les ressources de la machine infinies et ne garantit pas une latence nulle. Une grosse capture, un calcul excessif ou une forte vitesse du jeu restent coûteux. Les demandes sont bornées et peuvent être temporairement refusées. Ne contournez pas un refus en créant de nouvelles connexions, des threads de reprise ou des files illimitées.',
              'Isolation does not make machine resources infinite or guarantee zero latency. A large capture, excessive computation or high simulation speed still costs work. Requests are bounded and may be refused temporarily. Do not bypass a refusal by creating new connections, retry threads or unbounded queues.',
            ),
          ),
        ],
      },
      {
        id: 'callbacks',
        title: t(
          'Un callback fait un travail borné puis rend la main',
          'A callback does bounded work, then returns',
        ),
        blocks: [
          table(
            [t('Moment', 'When'), t('Bonne organisation', 'Useful structure')],
            [
              [
                t('Déclaration du mod', 'Mod declaration'),
                t(
                  'Préparer les modèles, réglages, descriptions d’images et règles fixes une fois. Garder stables les identifiants.',
                  'Prepare models, settings, image descriptions and fixed rules once. Keep identifiers stable.',
                ),
              ],
              [
                t('Observation de signalisation', 'Signalling observation'),
                t(
                  'Utiliser le réseau et les observations fournis. Créer les index utiles une fois par lot ; éviter une recherche complète de tous les signaux pour chaque signal.',
                  'Use the supplied network and observations. Build useful indexes once per batch; avoid scanning all signals for every signal.',
                ),
              ],
              [
                literal('service / onTick'),
                t(
                  'Les callbacks de l’outil sont sérialisés. Calculer sur demande ; au repos, ne rien relire. Pendant un aperçu, renouveler les positions copiées. Pendant une commande, interroger son ticket.',
                  'Tool callbacks are serialized. Calculate on request; reread nothing while idle. During a preview, renew copied positions. During a command, poll its ticket.',
                ),
              ],
              [
                literal('onStop / worldId / generation'),
                t(
                  'Libérer les données du mod à l’arrêt ; invalider les plans, index et événements d’une autre session. Ne conserver aucun ToolContext au-delà de son callback.',
                  'Release mod data on stop; invalidate plans, indexes and events from another session. Retain no ToolContext beyond its callback.',
                ),
              ],
            ],
          ),
          text(
            t(
              'Un intervalle d’observation est une cadence visée, pas une garantie de fréquence. Si un calcul dépasse cet intervalle, ne lancez pas une rafale de rattrapage. À haute vitesse, le temps simulé avance plus vite que les callbacks et que les images visibles : une animation ne peut pas promettre l’affichage de chaque phase.',
              'An observation interval is a target cadence, not a frequency guarantee. If a calculation exceeds that interval, do not launch a catch-up burst. At high speed, simulated time advances faster than callbacks and visible frames: an animation cannot promise to display every phase.',
            ),
          ),
          table([t('Fonction à créer', 'Feature to build'), t('Organisation concrète', 'Concrete structure')], [
            [t('Limite de longueur configurable', 'Configurable length limit'), t('Déclarer une IntegerOption et trainEditor une fois. Aucun onTick ni lecture de trains par le mod.', 'Declare an IntegerOption and trainEditor once. No onTick or train reads in the mod.')],
            [t('Fenêtre de date et heure', 'Date and time window'), t('Lire clock() à l’ouverture ou sur Actualiser. Valider la saisie, puis appeler le changement d’heure une seule fois sur confirmation.', 'Read clock() on opening or Refresh. Validate input, then call the time change once on confirmation.')],
            [t('Aperçu de signaux', 'Signal preview'), t('Calculer les positions quand les arguments changent ; renouveler le même aperçu pendant son affichage et l’effacer à sa fermeture.', 'Compute positions when arguments change; renew the same preview while displayed and clear it when closed.')],
            [t('Construction de signaux', 'Signal construction'), t('Envoyer une demande confirmée une fois, conserver son ticket, puis consulter son résultat. Un délai ne signifie pas que la construction a échoué.', 'Submit a confirmed request once, keep its ticket and then query its result. A delay does not mean construction failed.')],
          ]),
        ],
      },
      {
        id: 'lectures',
        title: t('Demander les données nécessaires', 'Request the data you need'),
        blocks: [
          table(
            [
              t('Besoin', 'Need'),
              t('Dans un outil natif', 'In a native tool'),
              t('Dans une application JVM', 'In a JVM application'),
            ],
            [
              [
                t('Horloge seule', 'Clock only'),
                literal('ToolContext.clock()'),
                literal('Game.clock.read()'),
              ],
              [
                t('Familles de données trains', 'Train data families'),
                literal('ToolContext.trains(TrainQuery(...))'),
                literal('Game.trains.snapshot(query = TrainQuery(...))'),
              ],
              [
                t('Géométrie du réseau', 'Network geometry'),
                literal('ToolContext.network()'),
                literal('Game.snapshot()'),
              ],
            ],
          ),
          text(
            t(
              'Demandez les voyageurs, horaires, tags, caractéristiques ou compositions seulement si votre fonction les utilise. Une carte complète n’est pas nécessaire pour un formulaire de date. À l’inverse, ne remplacez pas une nouvelle lecture nécessaire par un cache fondé uniquement sur le temps écoulé : un monde, une voie ou une source peuvent avoir changé. Une valeur absente reste inconnue, pas zéro ni une liste vide inventée.',
              'Request passengers, timetables, tags, characteristics or compositions only when your feature uses them. A full map is unnecessary for a date form. Conversely, do not replace a required fresh read with a cache based only on elapsed time: a world, track or source may have changed. Missing data remains unknown, not zero or an invented empty list.',
            ),
          ),
          text(
            t(
              'Les résultats copiés sont utiles pour calculer et afficher. Dans un callback natif, les demandes de trains déjà couvertes peuvent réutiliser la lecture du callback ; network() et un changement d’heure invalident cette réutilisation. Dans une application JVM, chaque demande de capture est une nouvelle lecture. Ouvrez et fermez explicitement votre connexion et libérez vos caches quand elle change.',
              'Copied results are useful for calculation and display. Within a native callback, already-covered train requests can reuse that callback’s read; network() and a time change invalidate this reuse. In a JVM application, each capture request makes a fresh read. Explicitly open and close your connection and discard caches when it changes.',
            ),
          ),
        ],
      },
      {
        id: 'mesures',
        title: t(
          'Vérifier le comportement avant de promettre un gain',
          'Verify behaviour before claiming a gain',
        ),
        blocks: [
          text(
            t(
              'Testez hors jeu un callback lent, une exception, une donnée inconnue et plusieurs refus temporaires, puis le retour à la normale. Vérifiez que les autres fonctions continuent, que les files restent bornées et qu’une opération de pose n’est envoyée qu’une fois. Mesurez séparément le temps de lecture, le calcul du mod et la fréquence réellement observée. Une moyenne seule masque les pointes.',
              'Outside the game, test a slow callback, an exception, unknown data and repeated temporary refusals, followed by recovery. Check that other features continue, queues stay bounded and a placement operation is submitted only once. Measure read time, mod computation and actual observed cadence separately. An average alone hides spikes.',
            ),
          ),
          text(
            t(
              'Pour une recette en jeu, conservez la version et l’empreinte des paquets, la partie de référence, les phases avant/après et les logs du bon démarrage. Attendez la fin du chargement avant la référence de mesure. Les compteurs depuis le démarrage incluent souvent cette phase : comparez des différences entre deux horodatages connus. Gardez les mêmes réglages de vitesse et de rendu entre les essais. Un clic qui répond ou une capture isolée ne mesure pas les temps de chaque image.',
              'For an in-game test, retain package versions and hashes, the reference save, before/after phases and logs from the correct launch. Wait for loading to finish before recording the baseline. Startup counters often include that phase: compare differences between known timestamps. Keep speed and rendering settings consistent between runs. A responding click or isolated snapshot does not measure every frame’s duration.',
            ),
          ),
          table(
            [t('Mesure', 'Measurement'), t('Ce qu’elle permet de conclure', 'What it establishes')],
            [
              [
                t('Lecture ciblée', 'Targeted read'),
                t(
                  'Taux de réussite et durée des demandes utiles ; comparez médiane, percentile 95 et maximum.',
                  'Success rate and duration of useful requests; compare median, 95th percentile and maximum.',
                ),
              ],
              [
                t('Horloge simulée', 'Simulation clock'),
                t(
                  'Rapport entre le temps du jeu et le temps réel écoulé. Le palier choisi dans l’interface ne prouve pas la vitesse atteinte.',
                  'Ratio of game time to elapsed real time. The selected UI speed does not prove the achieved speed.',
                ),
              ],
              [
                t('Conduite et apparence', 'Driving and appearance'),
                t(
                  'Testez séparément le passage de trains devant les signaux, la décision produite et les images réellement visibles. Une lecture rapide ne prouve pas un affichage instantané.',
                  'Test train passages at signals, produced decisions and actually visible frames separately. A fast read does not prove instant display.',
                ),
              ],
              [
                t('Récupération', 'Recovery'),
                t(
                  'Après la faute, vérifier que les autres fonctions progressent et que les délais reviennent dans leur plage habituelle, sans rejouer une mutation incertaine.',
                  'After the fault, check that other features progress and delays return to their usual range without replaying an uncertain mutation.',
                ),
              ],
            ],
          ),
          links(
            {
              label: t(
                'Reprendre un aperçu sans rejouer une commande',
                'Resume a preview without replaying a command',
              ),
              to: '/mods/cycle-outils',
            },
            {
              label: t('Préparer le réseau une fois', 'Prepare the network once'),
              to: '/mods/preparer-reseau',
            },
            {
              label: t('Journaux et diagnostic', 'Logs and diagnostics'),
              to: '/maintenance/journaux',
            },
          ),
        ],
      },
    ],
  },
]
