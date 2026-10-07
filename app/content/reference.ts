import snapshot from './generated/api.json'
import type { Article, Section } from './schema'
import { text, code, note, links, table } from './schema'
import existingEnglish from './en.json'
import { reviewedApiContracts, reviewedContractGuides } from './api-contracts'

export const referenceEnglish: Record<string, string> = {}
const t = (fr: string, en: string): string => {
  referenceEnglish[fr] = en
  return fr
}
const literal = (value: string) => t(value, value)
function documentation(symbol: { id: string; documentation: string }): string {
  const reviewed = reviewedApiContracts[symbol.id]
  if (!reviewed) throw new Error(`Public API contract needs FR/EN review: ${symbol.id}`)
  return t(...reviewed)
}

const descriptions: Record<string, string> = {
  Nimby: 'Point d’entrée du client : connexion et fonctions regroupées par usage dans Game.',
  Mod: 'Observations, réglages, décisions et contrats de signalisation et de conduite.',
  SignalMod:
    'Indication et ancienne déclaration à vocabulaire commun ; préférer signalModel pour les nouveaux projets.',
  SignalModel: 'Modèles indépendants : enums, règles, images, conduite et lecture typée du voisin.',
  SignalAnimation:
    'Images fixes et clignotantes déclarées par le mod, animées sur le temps du jeu.',
  ModServices: 'Déclarer un outil ou une action disponible lorsqu’un autre mod est chargé.',
  ToolContext:
    'Lire le réseau, préparer une pose, publier des boutons et écrire dans le journal depuis un outil.',
  NumberSetting: t(
    'Réglages entiers persistants et bornés dans les panneaux de signaux.',
    'Persistent bounded integer settings in signal panels.',
  ),
  ToolOperationException: t(
    'Refus typés des opérations et reprise des présentations temporaires.',
    'Typed operation refusals and recovery of temporary presentations.',
  ),
  ToolTopology: t(
    'Parcours des voies avec distances et connexions observées.',
    'Track traversal using observed distances and connections.',
  ),
  TrainObservation: t(
    'Copies de trains, services, lignes et arrêts accessibles dans les callbacks.',
    'Copied trains, services, lines and stops available in callbacks.',
  ),
  TrainTypes: t(
    'Identifiants typés, options de lecture et caractéristiques du matériel.',
    'Typed identifiers, read options and material characteristics.',
  ),
  TrainServices: t(
    'États, alertes et jointures des données de trains dans une capture.',
    'States, alerts and joins of train data within a snapshot.',
  ),
  SignalTypes: 'Valider les identifiants, catalogues et cases des modèles de signaux.',
  AutomaticDriving: 'Construire des consignes génériques avec les vitesses choisies par votre mod.',
  Translations: 'Textes d’interface traduits depuis le JSON du mod, avec paramètres et repli.',
  Files: 'Lire un fichier UTF-8 borné depuis Kotlin/Native.',
  NimbyClient: 'Connexion, captures, lectures ciblées et commandes du client Kotlin/JVM.',
  Observation: 'Trains, voies, signaux, services, horloge et collections observées.',
  DrivingObservation: 'Lecture ciblée d’un train et caractéristiques déclarées du matériel.',
  TrackMetric: 'Convertir les fractions de voie et les distances en mètres.',
  ModControl: 'Baux de recette, commandes temporaires et réponses du mod.',
  Construction: 'Tickets et résultats du pont de construction expérimental.',
  DiagnosticLog:
    'Journaux applicatifs avec rotation, regroupement des répétitions et suivi des erreurs.',
}
const extra: Record<string, Section[]> = {
  ToolContext: [
    {
      id: 'contrat-outil',
      title: 'Contexte, unités et opérations',
      blocks: [
        text(
          'Le contexte est prêt à utiliser dans service et onTick. Il appartient au callback courant : conservez les valeurs copiées et les tickets, jamais ce contexte. Le SDK refuse les appels après le retour du callback.',
        ),
        table(
          ['Valeur', 'Contrat'],
          [
            ['ToolTrack.lengthM', 'Mètres, optionnel ; null impose d’arrêter le parcours.'],
            ['SignalPosition.fraction', 'Fraction native strictement entre 0 et 1 pour une pose.'],
            [
              'SignalPosition.direction',
              'Sens natif -1 ou 1 ; distinct du sens visuel de certains modèles.',
            ],
            [
              'ConstructionResult.reason',
              'Code de refus du pont natif ; à conserver dans le journal.',
            ],
            [
              'ToolButton',
              'Identifiant, libellé, état activé ; au maximum 12 boutons par panneau.',
            ],
            [
              'ToolNumberInput',
              'Champ entier saisissable au clavier : id, label, value, minimum, maximum, enabled. Sélection, effacement et collage sont possibles. Un texte vide, incomplet ou hors limites reste un brouillon local et bloque les commandes ; seul un entier valide est transmis au mod. Quatre champs maximum, avec des identifiants distincts de ceux des boutons.',
            ],
            [
              'SignalActionRequest.value',
              'Nouvelle valeur entière pour une édition de champ (action contient son id) ; null pour un bouton. Une édition bloque les boutons jusqu’à la republication du panneau.',
            ],
            [
              'showPanel',
              'Message UTF-8 limité à 256 octets ; remplace l’action qui a ouvert l’outil.',
            ],
          ],
        ),
        note(
          t(
            'La construction reste expérimentale. Après une réponse incertaine, consulter le ticket existant : ne pas répéter une création ou une annulation. Un refus temporaire d’aperçu ou de panneau peut être repris au prochain tick, en bloquant les confirmations locales.',
            'Construction remains experimental. After an uncertain response, poll the existing ticket: do not repeat creation or undo. A temporary preview or panel refusal may be retried at the next tick while blocking local confirmations.',
          ),
        ),
        links({ label: 'Créer un outil optionnel', to: '/mods/outils-optionnels' }),
      ],
    },
  ],
  TrackMetric: [
    {
      id: 'contrat',
      title: 'Unités et validation',
      blocks: [
        table(
          ['Élément', 'Type / unité', 'Validation'],
          [
            ['trackId', 'Long opaque', 'Non nul.'],
            ['lengthM', 'Double · mètres', 'Fini et strictement positif.'],
            ['offsetM(fraction)', 'Double · mètres', 'fraction finie dans [0, 1].'],
            ['fraction(offsetM)', 'Double · fraction', 'offsetM fini dans [0, lengthM].'],
            [
              'distanceM(fromFraction, toFraction)',
              'Double · mètres',
              'Distance absolue, sans notion d’itinéraire.',
            ],
          ],
        ),
        code(
          'val metric = fr.nimby.sdk.TrackMetric(trackId = 1L, lengthM = 800.0)\ncheck(metric.offsetM(0.25) == 200.0)\ncheck(metric.fraction(400.0) == 0.5)\ncheck(metric.distanceM(0.75, 0.25) == 400.0)',
        ),
        note(
          'Ces nombres servent à illustrer le calcul. En partie, utilisez les identifiants et métriques réellement observés. Les valeurs hors contrat provoquent IllegalArgumentException.',
        ),
      ],
    },
  ],
  Mod: [
    {
      id: 'unites',
      title: 'Unités et données inconnues',
      blocks: [
        table(
          ['Propriété / famille', 'Unité ou sens'],
          [
            ['speedMps, reopenedSpeedMps', 'mètres par seconde ; km/h ÷ 3,6.'],
            ['beginM, endM, headM, lengthM, marginM', 'mètres.'],
            ['…Mps2', 'mètres par seconde carrée.'],
            ['emptyMassKg, extraMassKg', 'kilogrammes.'],
            ['tractiveEffortN / powerW', 'newtons / watts.'],
            ['Observation.fresh', 'La fraîcheur des observations reçues.'],
            ['Occupancy.Unknown', 'Absence de preuve de canton libre ou occupé.'],
            ['DrivingPlan.available', 'Disponibilité du calcul du mod, pas permission native.'],
          ],
        ),
        text(
          'Signal, Observation et DrivingSettings de nimby concernent le mod natif. Les types de même nom dans fr.nimby.sdk appartiennent au client JVM : vérifiez vos imports.',
        ),
      ],
    },
  ],
  Files: [
    {
      id: 'usage',
      title: 'Lire un fichier',
      blocks: [
        code('val contenu = nimby.readTextFile("config/options.json")'),
        text(
          'Le chemin est résolu depuis le répertoire de travail. La lecture est limitée à 4 194 304 octets et ferme le fichier même en cas d’erreur. Le SDK ne parse pas automatiquement le JSON et n’enregistre pas ce fichier pour vous.',
        ),
      ],
    },
  ],
}

const trainContracts: Section[] = [
  {
    id: 'contrats-trains',
    title: t(
      'Choisir la lecture et interpréter les résultats',
      'Choose a read and interpret its results',
    ),
    blocks: [
      text(
        t(
          'Dans un mod, utiliser ToolContext.trains(query). Dans une application JVM, utiliser game.trains.snapshot(query = query) ; sélectionner un train demande aussi son plan de ligne. Une requête groupe tous les trains : ne pas créer une capture par train. La lecture de l’horloge et la lecture ciblée d’un train sont séparées.',
          'In a mod, use ToolContext.trains(query). In a JVM application, use game.trains.snapshot(query = query); selecting a train also requests its line plan. One query batches all trains: do not create a snapshot per train. Clock reads and targeted single-train reads are separate.',
        ),
      ),
      table(
        [
          t('Option TrainQuery', 'TrainQuery option'),
          t('Par défaut', 'Default'),
          t('Données demandées', 'Requested data'),
        ],
        [
          [
            literal('includeService'),
            literal('true'),
            t('État, service et affectation observés.', 'Observed state, service and assignment.'),
          ],
          [
            literal('includeLocations'),
            literal('true'),
            t(
              'Positions et références de localisation nécessaires.',
              'Positions and required location references.',
            ),
          ],
          [
            literal('includeCharacteristics'),
            literal('false'),
            t(
              'Profils du matériel configuré et actuel.',
              'Configured and current material profiles.',
            ),
          ],
          [
            literal('includeTimetables'),
            literal('false'),
            t(
              'Informations d’horaires disponibles ; implique includeService.',
              'Available timetable information; implies includeService.',
            ),
          ],
          [
            literal('includeTags'),
            literal('false'),
            t(
              'Tags déclarés et références pour leur héritage ; implique includeLines.',
              'Declared tags and inheritance references; implies includeLines.',
            ),
          ],
          [
            literal('includePassengers'),
            literal('false'),
            t(
              'Occupants observés, distincts de la capacité.',
              'Observed occupants, distinct from capacity.',
            ),
          ],
          [
            literal('includeLines'),
            literal('false'),
            t(
              'Catalogue des lignes, y compris celles sans train affecté.',
              'Line catalog, including lines with no assigned train.',
            ),
          ],
          [
            literal('includeComposition'),
            literal('false'),
            t(
              'Véhicules ordonnés des compositions configurée et actuelle et modèles référencés.',
              'Ordered vehicles of configured and current compositions and referenced models.',
            ),
          ],
        ],
      ),
      note(
        t(
          'Une capture dédiée aux trains ne fournit pas le réseau complet, les occupations, les réservations et les états des signaux. Pour ces données, utiliser la capture réseau correspondante ; une collection non demandée ne prouve pas que la carte est vide.',
          'A train-data snapshot does not provide the full network, occupations, reservations and signal states. Use the corresponding network snapshot for that data; an unrequested collection does not prove that the map is empty.',
        ),
      ),
      table(
        [t('Valeur', 'Value'), t('Unité et contrat', 'Unit and contract')],
        [
          [
            literal('Train.speedMps / Train.speedKmh'),
            t(
              'Vitesse actuelle. Native : une mesure indisponible reste null. JVM : vérifier aussi speedDefaulted avant d’interpréter une valeur de secours comme une mesure.',
              'Current speed. Native: an unavailable measurement remains null. JVM: also check speedDefaulted before treating a fallback value as a measurement.',
            ),
          ],
          [
            literal('maximumSpeedMps / maximumSpeedKmh'),
            t(
              'Vitesse maximale du matériel, en m/s ou km/h ; distincte de la vitesse actuelle et de la limite de voie.',
              'Material maximum speed, in m/s or km/h; distinct from current speed and the track speed limit.',
            ),
          ],
          [
            literal('lengthM / emptyMassKg / maximumAccelerationMps2'),
            t(
              'Mètres, kilogrammes, mètres par seconde carrée.',
              'Metres, kilograms, metres per second squared.',
            ),
          ],
          [literal('powerW / tractiveForceN'), t('Watts et newtons.', 'Watts and newtons.')],
          [
            literal('passengers / passengerCapacity / carCount'),
            t(
              'Occupants, capacité et nombre de véhicules : trois quantités distinctes.',
              'Occupants, capacity and vehicle count: three distinct quantities.',
            ),
          ],
          [
            literal('configured / current / composition'),
            t(
              'Profils indépendants, sans remplacement des valeurs absentes. Composition null : inconnue ou non demandée ; liste vide : composition observée vide.',
              'Independent profiles, without filling missing values from one another. Null composition: unknown or unrequested; empty list: observed empty composition.',
            ),
          ],
          [
            literal('predictedArrivalDelayUs / predictedArrivalDelaySeconds'),
            t(
              'Estimation signée, en microsecondes ou secondes ; négative pour une arrivée prévue en avance. Ni âge d’échéance ni priorité.',
              'Signed estimate in microseconds or seconds; negative for predicted early arrival. Neither deadline age nor priority.',
            ),
          ],
          [
            literal('arrivalOffsetSeconds / departureOffsetSeconds'),
            t(
              'Offsets validés, en secondes depuis l’origine du plan de ligne. Ne pas les convertir en date absolue d’un train.',
              'Validated offsets in seconds from the line-plan origin. Do not convert them into a train’s absolute date.',
            ),
          ],
          [
            literal('arrivalTimeUs / departureTimeUs / dispatchRetryTimeUs'),
            t(
              'Microsecondes depuis l’origine de simulation, pas depuis 1970. Utiliser les helpers de calendrier ; une date reste null si l’origine est inconnue.',
              'Microseconds from the simulation origin, not 1970. Use calendar helpers; dates remain null when the origin is unknown.',
            ),
          ],
          [
            literal('capturedAtMillis / ageMillis'),
            t(
              'Heure UTC de l’ordinateur / âge monotone lors de la copie ; distincts du calendrier du jeu.',
              'Computer UTC time / monotonic age when copying; distinct from the game calendar.',
            ),
          ],
        ],
      ),
      text(
        t(
          'Les identifiants typés sont opaques. TimetableShiftId est unique seulement avec son TimetableId. LineType distingue uniquement Depot et Other ; aucune catégorie voyageurs/fret n’est inférée. Un nom d’horaire indisponible reste null. Les tags sont des libellés, sans priorité automatique ; un héritage incomplet ou cyclique reste inconnu. VehicleModel.nameEnglish conserve le nom anglais du catalogue.',
          'Typed identifiers are opaque. TimetableShiftId is unique only together with its TimetableId. LineType distinguishes only Depot and Other; no passenger/freight category is inferred. An unavailable timetable name remains null. Tags are labels without automatic priority; incomplete or cyclic inheritance remains unknown. VehicleModel.nameEnglish retains the English catalog name.',
        ),
      ),
      text(
        t(
          'TrainVehicle décrit un véhicule dans une composition. Le type nimby.Vehicle utilisé par le calcul de conduite est un autre contrat. Ne pas mélanger les classes homonymes des packages nimby et fr.nimby.sdk.',
          'TrainVehicle describes a vehicle within a composition. The nimby.Vehicle type used in driving calculations is a different contract. Do not mix identically named classes from nimby and fr.nimby.sdk.',
        ),
      ),
    ],
  },
]

export const referenceArticles: Article[] = snapshot.files.map((file) => {
  const name = file.file.replace('.kt', '')
  const title = name === 'TrainTypes' ? literal(`${name} · ${file.runtime}`) : literal(name)
  literal(file.runtime)
  literal(file.package)
  literal(file.path)
  const sections: Section[] = [
    {
      id: 'contexte',
      title: 'Contexte d’utilisation',
      blocks: [
        table(['Module', 'Package', 'Source SDK'], [[file.runtime, file.package, file.path]]),
        text(
          t(
            `API publique du SDK ${snapshot.sdkVersion}. Chaque entrée donne la signature Kotlin et son contrat : sens de la valeur, conditions d’utilisation et effets à connaître. Choisissez les imports du module indiqué ci-dessus.`,
            `Public API for SDK ${snapshot.sdkVersion}. Each entry provides the Kotlin signature and its contract: what the value means, conditions of use and effects to understand. Choose imports from the module shown above.`,
          ),
        ),
        note(
          t(
            'Les valeurs optionnelles, données non demandées et réponses en attente ont des significations distinctes. Consultez le contrat avant de remplacer null par une valeur par défaut ou de répéter une commande.',
            'Optional values, data that was not requested and pending responses have distinct meanings. Read the contract before replacing null with a default or repeating a command.',
          ),
        ),
        code(
          [
            ...new Set(
              snapshot.exports
                .filter(
                  (item) =>
                    item.package === file.package &&
                    item.runtime === file.runtime &&
                    item.to.startsWith(`/${file.slug}#`),
                )
                .map((item) => `import ${item.import}`),
            ),
            ...file.imports.map((item) => `import ${item}`),
          ].join('\n'),
          t('Imports de cette page', 'Imports on this page'),
        ),
      ],
    },
    ...(extra[name] || []),
    ...(['TrainTypes', 'TrainObservation', 'TrainServices', 'Observation'].includes(name)
      ? trainContracts
      : []),
  ]
  file.symbols.forEach((symbol) => {
    const comment = documentation(symbol)
    sections.push({
      id: symbol.anchor,
      title: literal(symbol.owner ? `${symbol.owner}.${symbol.name}` : symbol.name),
      blocks: [
        code(symbol.signature, literal(`${file.package} · ${symbol.kind}`)),
        ...('defaultNotes' in symbol && symbol.defaultNotes?.includes('model-title')
          ? [
              text(
                t(
                  'Par défaut, name reprend le titre du modèle ; catalogueName reprend name.',
                  'By default, name uses the model title; catalogueName uses name.',
                ),
              ),
            ]
          : []),
        ...(comment ? [text(comment)] : []),
        ...(reviewedContractGuides[symbol.id]?.length
          ? [
              links(
                ...reviewedContractGuides[symbol.id]!.map((to, index) => ({
                  label: t(
                    index === 0
                      ? 'Guide et exemple d’utilisation →'
                      : `Guide complémentaire ${index + 1} →`,
                    index === 0 ? 'Usage guide and example →' : `Related guide ${index + 1} →`,
                  ),
                  to,
                })),
              ),
            ]
          : []),
      ],
    })
  })
  return {
    slug: file.slug,
    title,
    group: 'Référence',
    description:
      descriptions[name] ||
      t('Déclarations publiques Kotlin du SDK.', 'Public Kotlin SDK declarations.'),
    status: ['Construction', 'ToolContext', 'ModServices'].includes(name)
      ? 'experimental'
      : name === 'SignalMod'
        ? 'development'
        : undefined,
    sections,
  }
})

export const referenceIndex: Article = {
  slug: 'reference',
  title: 'Toute l’API Kotlin',
  group: 'Référence',
  description:
    'Les déclarations publiques des modules Kotlin/Native et Kotlin/JVM, regroupées par usage.',
  sections: [
    {
      id: 'mod',
      title: 'Créer un mod · Kotlin/Native',
      blocks: [
        text(
          'Le module nimby est inclus dans le kit Kotlin. Le plugin Gradle fournit le pont natif et le chargement du mod.',
        ),
        links(
          ...referenceArticles
            .filter(
              (a) => snapshot.files.find((f) => f.slug === a.slug)?.runtime === 'Kotlin/Native',
            )
            .map((a) => ({
              label: t(
                `${a.title} — ${a.description}`,
                `${a.title} — ${referenceEnglish[a.description] || (existingEnglish as Record<string, string>)[a.description]}`,
              ),
              to: `/${a.slug}`,
            })),
        ),
      ],
    },
    {
      id: 'outil',
      title: 'Créer un outil · Kotlin/JVM',
      blocks: [
        text(
          'Le module fr.nimby.sdk fournit les lectures et commandes utilisées par les outils externes. Ses connexions doivent être fermées.',
        ),
        links(
          ...referenceArticles
            .filter((a) => snapshot.files.find((f) => f.slug === a.slug)?.runtime === 'Kotlin/JVM')
            .map((a) => ({
              label: t(
                `${a.title} — ${a.description}`,
                `${a.title} — ${referenceEnglish[a.description] || (existingEnglish as Record<string, string>)[a.description]}`,
              ),
              to: `/${a.slug}`,
            })),
        ),
      ],
    },
    {
      id: 'couverture',
      title: 'Ce que couvre cette référence',
      blocks: [
        text(
          t(
            `${snapshot.files.length} fichiers publics Kotlin sont recensés. Chaque propriété de constructeur et valeur d’enum possède une entrée. Les mêmes noms dans nimby et fr.nimby.sdk appartiennent à deux API distinctes : choisir les imports du bon environnement.`,
            `${snapshot.files.length} public Kotlin files are listed. Each constructor property and enum entry has its own entry. Identical names in nimby and fr.nimby.sdk belong to two distinct APIs: choose imports for the correct environment.`,
          ),
        ),
        note(
          t(
            'Cette référence décrit l’API publique disponible dans les sources synchronisées. Une signature ne prouve pas qu’une donnée sera disponible sur chaque train ou dans chaque partie. Respecter les valeurs null et les contrats de chaque lecture.',
            'This reference describes the public API in the synchronized sources. A signature does not prove that data is available for every train or game. Respect null values and the contracts of each read.',
          ),
        ),
      ],
    },
  ],
}
