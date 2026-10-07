import type { Article } from './schema'
import { text, code, note, list, table, links } from './schema'
import nativeQueries from './snippets/NativeTrainQueries.kt?raw'
import jvmQueries from './snippets/jvm/JvmTrainQueries.kt?raw'
import nativeLines from './snippets/NativeTrainLines.kt?raw'
import jvmLines from './snippets/jvm/JvmTrainLines.kt?raw'
import nativeTimetables from './snippets/NativeTrainTimetables.kt?raw'
import jvmTimetables from './snippets/jvm/JvmTrainTimetables.kt?raw'
import nativeMaterial from './snippets/NativeTrainMaterial.kt?raw'
import jvmMaterial from './snippets/jvm/JvmTrainMaterial.kt?raw'

export const trainGuidesEnglish: Record<string, string> = {}
export const trainCodeEnglish: Record<string, string> = {
  "Appeler depuis un callback d'outil ; ne pas conserver son ToolContext.":
    'Call from a tool callback; do not retain its ToolContext.',
  'null reste inconnu ; une vitesse nulle connue vaut bien 0.0.':
    'null stays unknown; a known zero speed really is 0.0.',
  'Exemple ponctuel ; une application conserve sa connexion entre deux lectures.':
    'One-off example; an application keeps its connection between reads.',
  'Résultat ternaire : true, false ou appartenance inconnue.':
    'Three-state result: true, false or unknown membership.',
  "Un nom traduit ou renommé ne remplace pas l'identifiant du tag.":
    'A translated or renamed label does not replace the tag identity.',
  'Une seule requête riche avant de lire le plan dans cette capture.':
    'One rich query before reading the plan in this capture.',
  'Conserver les offsets ; ne pas fabriquer une date de prochain passage.':
    'Keep offsets; do not manufacture a next passing date.',
  'selectedTrain ajoute son plan ; la liste trains reste une capture par lot.':
    'selectedTrain adds its plan; the trains list remains a batch capture.',
  'Aucune capacité de remplacement quand le matériel actuel est inconnu.':
    'No substitute capacity when current material is unknown.',
  "L'ordre et les répétitions de modèles décrivent la composition.":
    'Model order and repetitions describe the composition.',
  "Un nombre d'occupants inconnu ne devient jamais zéro.":
    'An unknown occupant count never becomes zero.',
}
const t = (fr: string, en: string) => {
  trainGuidesEnglish[fr] = en
  return fr
}
const literal = (value: string) => t(value, value)

export const trainGuides: Article[] = [
  {
    slug: 'lire/trains-observations', group: 'Lire et agir', status: 'experimental',
    title: t('Observer les trains : requêtes, identités et états', 'Observe trains: queries, identities and states'),
    description: t('Construire des fiches de trains avec les seuls groupes utiles et conserver le sens des données inconnues.', 'Build train cards from only the required groups and preserve the meaning of unknown data.'),
    sections: [
      { id: 'deux-api', title: t('Choisir le point d’entrée', 'Choose the entry point'), blocks: [
        text(t('Vous allez obtenir un lot de trains, joindre leurs informations puis préparer des valeurs d’affichage. Un outil Native doit déjà recevoir un ToolContext actif ; une application JVM doit déjà posséder un Game ouvert. Les résultats sont des copies conservables, mais le ToolContext appartient uniquement au callback qui l’a fourni.', 'You will obtain a batch of trains, join their information and prepare display values. A Native tool must already receive an active ToolContext; a JVM application must already own an open Game. Results are retainable copies, but a ToolContext belongs only to the callback that supplied it.')),
        table([t('Besoin', 'Need'), literal('Native'), literal('JVM')], [
          [t('Lot de données de trains', 'Batch of train data'), 'context.trains(query)', 'game.trains.snapshot(query = query)'],
          [t('Joindre un train identifié', 'Join an identified train'), 'snapshot[trainId]', 'snapshot.train(trainId)'],
          [t('Plan de ligne d’un train', 'A train’s line plan'), 'context.linePlan(trainId)', 'game.trains.snapshot(selectedTrain = trainId, query = query)'],
          [t('Mesure de conduite ciblée', 'Targeted driving measurement'), t('Observations du callback de conduite', 'Driving callback observations'), 'game.trains.read(trainId)'],
        ]),
        note(t('selectedTrain ajoute le plan d’un train à la capture JVM ; il ne filtre pas la liste trains. Pour la seule vitesse ou position d’un train, utilisez la lecture ciblée. Les types nimby et fr.nimby.sdk ont des contrats voisins, mais leurs objets ne sont pas interchangeables.', 'selectedTrain adds one train’s plan to a JVM capture; it does not filter the trains list. Use a targeted read when you only need one train’s speed or position. nimby and fr.nimby.sdk types have related contracts, but their objects are not interchangeable.')),
      ]},
      { id: 'groupes', title: t('Composer une requête selon l’écran', 'Compose a query for the screen'), blocks: [
        text(t('TrainQuery choisit les données supplémentaires. Déclarez ensemble tous les besoins du calcul puis réutilisez le lot. Les valeurs par défaut incluent le service et les lieux ; désactivez-les pour un écran qui ne les utilise pas. En Native, une requête déjà couverte dans le callback réutilise sa copie ; une demande plus riche peut déclencher une nouvelle lecture.', 'TrainQuery selects additional data. Declare all the calculation’s needs together, then reuse the batch. Defaults include service and locations; disable them for a screen that does not use them. In Native, a query already covered within the callback reuses its copy; a richer request may trigger a new read.')),
        table([t('Option', 'Option'), t('Défaut', 'Default'), t('Ce qu’elle demande', 'What it requests')], [
          ['includeService', 'true', t('Service et état opérationnel associés au train.', 'Service and operational state associated with the train.')],
          ['includeLocations', 'true', t('Voies et gares pour les jointures de localisation ; ne demande pas la table des quais.', 'Tracks and stations for location joins; does not request the platform table.')],
          ['includeTimetables', 'false', t('Affectation et échéances ; implique le service et les voies/gares même si includeLocations vaut false.', 'Assignment and deadlines; implies service and tracks/stations even when includeLocations is false.')],
          ['includeLines', 'false', t('Catalogue des lignes, identités et relations parentales disponibles.', 'Line catalogue, identities and available parent relationships.')],
          ['includeTags', 'false', t('Tags et déclarations des lignes ; implique le catalogue des lignes.', 'Tags and line declarations; implies the line catalogue.')],
          ['includeCharacteristics', 'false', t('Caractéristiques des profils configuré et actuel.', 'Characteristics of configured and current profiles.')],
          ['includeComposition', 'false', t('Composition ordonnée et catalogue des modèles de véhicules.', 'Ordered composition and vehicle-model catalogue.')],
          ['includePassengers', 'false', t('Nombre observé d’occupants ; indépendant de la capacité.', 'Observed occupant count; independent of capacity.')],
        ]),
        text(t('La capture spécialisée ne demande pas la carte complète, les signaux, les quais, les occupations, les réservations ou le chemin réservé. Des tables de réseau vides dans ce profil ne prouvent donc pas que le monde est vide. Pour les quais en JVM, demandez game.snapshot() et utilisez Observation.platform. Demandez le réseau uniquement si votre fonctionnalité en a besoin.', 'The specialised capture does not request the whole map, signals, platforms, occupation, reservations or reserved path. Empty network tables in this profile therefore do not prove that the world is empty. For JVM platform data, request game.snapshot() and use Observation.platform. Request the network only when your feature needs it.')),
      ]},
      { id: 'identites', title: t('Faire les jointures sans perdre les inconnues', 'Join data without losing unknowns'), blocks: [
        text(t('TrainId, LineId, StationId, TrackId, TimetableId, TagId et VehicleModelId expriment la nature d’une identité. Leur value est opaque : ne la découpez pas et ne la remplacez pas par un nom. Utilisez les recherches indexées du lot : get et line en Native, train, line et station en JVM. Les véhicules portent directement leur model ; inutile de le rechercher pour chaque fiche.', 'TrainId, LineId, StationId, TrackId, TimetableId, TagId and VehicleModelId express the kind of identity. Their value is opaque: do not decode it or replace it with a name. Use indexed batch lookups: get and line in Native, train, line and station in JVM. Vehicles directly carry their model; there is no need to look it up for each card.')),
        table([t('Situation', 'Situation'), t('Traitement attendu', 'Expected handling')], [
          [t('Groupe non demandé', 'Group not requested'), t('Ne pas afficher « aucun ». Demander ce groupe si l’écran en a besoin.', 'Do not display “none”. Request that group if the screen needs it.')],
          [t('Objet ou propriété nullable absent', 'Missing nullable object or property'), t('Conserver « inconnu » ou « indisponible » ; la requête ne suffit pas à garantir sa présence.', 'Keep “unknown” or “unavailable”; requesting data does not guarantee it exists.')],
          [t('Liste nullable obtenue et vide', 'Supplied nullable list is empty'), t('Aucun élément dans cette liste observée ; ce constat ne s’étend pas aux tables non demandées.', 'No items in that observed list; this does not extend to unrequested tables.')],
          [t('Identité présente, jointure absente', 'Identity exists, join is missing'), t('Conserver l’identité et afficher un libellé de remplacement sans fabriquer l’objet joint.', 'Keep the identity and display a fallback label without fabricating the joined object.')],
        ]),
        text(t('En Native, Train rassemble les parties disponibles : une demande de localisation peut fournir un TrainService partiel avec présence et lieux, sans état de service. Les demandes du callback se cumulent ; une option false ne retire pas un groupe déjà lu. En JVM, Observation.train(id) retourne un TrainRecord regroupant train, service, details et metadata ; le service y reste absent si son groupe n’a pas été demandé. La présence d’un train ne garantit donc pas toutes ses parties enrichies.', 'In Native, Train groups available parts: a location request can supply a partial TrainService with presence and places, without service state. Callback requests accumulate; a false option does not remove a group already read. In JVM, Observation.train(id) returns a TrainRecord grouping train, service, details and metadata; service remains absent when its group was not requested. A train being present therefore does not guarantee all its enriched parts.')),
      ]},
      { id: 'etats', title: t('Distinguer mouvement, état et alerte', 'Distinguish movement, state and alert'), blocks: [
        text(t('La vitesse mesurée décrit le mouvement. TrainState décrit un état opérationnel et TrainAlert un signalement ; aucun de ces champs ne constitue une permission de franchir un signal. Interprétez chaque enum dans son domaine, sans attribuer un ordre de gravité à sa position dans entries.', 'Measured speed describes movement. TrainState describes an operational state and TrainAlert a reported condition; none of those fields grants permission to pass a signal. Interpret each enum within its domain, without assigning severity from its position in entries.')),
        table([t('Valeur', 'Value'), t('Sens', 'Meaning')], [
          ['null', t('Donnée indisponible ou non demandée à cet emplacement.', 'Data unavailable or not requested at this location.')],
          ['Unknown', t('Le jeu rapporte explicitement son état inconnu.', 'The game explicitly reports its unknown state.')],
          ['Other', t('Une valeur observée ne correspond pas aux catégories nommées du SDK.', 'An observed value does not match the SDK’s named categories.')],
          ['TrainAlert.None', t('Aucune alerte rapportée ; ce n’est pas une autorisation de mouvement.', 'No alert reported; this is not movement permission.')],
        ]),
        note(t('Une vitesse connue de 0 est bien un arrêt mesuré. Une vitesse absente ou marquée speedDefaulted reste inconnue. Les exemples conservent cette différence au lieu de convertir toutes les absences en zéro.', 'A known speed of 0 really is a measured stop. A missing speed or one marked speedDefaulted remains unknown. The examples preserve this difference rather than converting every absence to zero.')),
      ]},
      { id: 'exemples', title: t('Construire des fiches prêtes à afficher', 'Build cards ready for display'), blocks: [
        code(nativeQueries, t('Native : appeler readTrainCards dans le callback de l’outil', 'Native: call readTrainCards in the tool callback')),
        code(jvmQueries, t('JVM : réutiliser le Game de l’application', 'JVM: reuse the application’s Game')),
        text(t('Les fonctions renvoient des TrainCard composées uniquement de valeurs copiées. La gare de position et la gare du service sont deux informations distinctes : un train peut rouler entre gares tout en ayant une destination de service. L’interface peut afficher un tiret pour une valeur inconnue sans modifier le résultat SDK.', 'The functions return TrainCard values made only from copied data. Position station and service station are separate facts: a train may run between stations while having a service destination. The interface may display a dash for an unknown without modifying the SDK result.')),
      ]},
      { id: 'fraicheur', title: t('Conserver une copie sans la croire actuelle', 'Retain a copy without treating it as current'), blocks: [
        text(t('Une copie reste lisible après le callback ou la lecture, mais elle ne se met pas à jour. En Native, worldId et generation décrivent son contexte ; capturedAtMillis date la capture et ageMillis est son âge au moment de la copie, pas un compteur qui progresse. Effacez les calculs associés lors d’un changement de monde ou de génération.', 'A copy remains readable after the callback or read, but does not update itself. In Native, worldId and generation describe its context; capturedAtMillis dates the capture and ageMillis is its age when copied, not a ticking counter. Clear associated calculations on a world or generation change.')),
        text(t('En JVM, conservez les jointures à l’intérieur d’un même Observation et invalidez votre cache lors d’un changement de partie ou de connexion. processId et gameHash donnent un contexte de processus et de version ; ils ne sont pas une identité durable de sauvegarde. Une opération ultérieure doit vérifier ses propres préconditions actuelles.', 'In JVM, keep joins within a single Observation and invalidate your cache when changing games or connections. processId and gameHash provide process and version context; they are not a durable save identity. A later operation must check its own current preconditions.')),
        links({ label: t('Lignes et tags', 'Lines and tags'), to: '/lire/lignes-et-tags' }, { label: t('Horaires et retard', 'Timetables and delay'), to: '/lire/horaires-trains' }, { label: t('Matériel et voyageurs', 'Material and passengers'), to: '/lire/materiel' }),
      ]},
    ],
  },
  {
    slug: 'lire/lignes-et-tags', group: 'Lire et agir', status: 'experimental',
    title: t('Relier les trains, les lignes et les tags', 'Connect trains, lines and tags'),
    description: t('Lire les lignes de la partie et distinguer leurs tags déclarés des tags hérités de leurs parents.', 'Read the game’s lines and distinguish their declared tags from tags inherited from parents.'),
    sections: [
      { id: 'catalogue', title: t('Demander le catalogue utile', 'Request the catalogue you need'), blocks: [
        text(t('Ce guide prolonge les requêtes de trains. Pour afficher une ligne, demandez includeLines ; pour ses tags, demandez includeTags, qui inclut déjà les lignes. Un train peut avoir un lineId sans que le catalogue ait été demandé : une jointure manquante ne signifie pas que le train n’a pas de ligne.', 'This guide builds on train queries. Request includeLines to display a line; request includeTags for its tags, which already includes lines. A train may have a lineId even when the catalogue was not requested: a missing join does not mean that the train has no line.')),
        table([t('Information', 'Information'), literal('Native'), literal('JVM')], [
          [t('Identité de ligne du train', 'Train’s line identity'), 'train.service?.line?.lineId', 'record.service?.line'],
          [t('Rechercher la ligne', 'Look up the line'), 'snapshot.line(lineId)', 'snapshot.line(lineId)'],
          [t('Parent observé', 'Observed parent'), 'line.parentLineId', 'line.parentId'],
          [t('Dépôt', 'Depot'), 'line.isDepot', 'line.type == LineType.Depot'],
        ]),
        text(t('LineType distingue Depot et Other. Other ne signifie ni « voyageurs » ni « marchandises ». Le nom est une propriété de présentation ; conservez LineId comme clé même après un renommage. La fiche Line n’expose ni fréquence commerciale, ni liste calculée de prochains départs.', 'LineType distinguishes Depot and Other. Other means neither “passenger” nor “freight”. Name is a presentation property; keep LineId as the key even after renaming. A Line record exposes neither commercial frequency nor a calculated list of upcoming departures.')),
      ]},
      { id: 'declarations', title: t('Lire les tags réellement déclarés', 'Read explicitly declared tags'), blocks: [
        text(t('Tag associe un TagId à un libellé. Line.declaredTags décrit uniquement les tags de cette ligne. Une liste vide obtenue indique aucune déclaration locale ; null indique que la déclaration n’a pas été fournie. Pour tester un tag, comparez son identité au lieu de comparer un nom susceptible d’être modifié.', 'Tag associates a TagId with a label. Line.declaredTags describes only tags on that line. A supplied empty list means no local declaration; null means the declaration was not supplied. To test membership, compare identities rather than a name that may change.')),
        note(t('Un tag est une donnée du jeu. Le SDK n’en déduit pas une priorité, une règle de régulation ou une permission. Un futur mod peut définir ces conventions dans ses propres règles, en expliquant leur configuration à son utilisateur.', 'A tag is game data. The SDK does not infer priority, regulation rules or permission from it. A future mod may define those conventions in its own rules and explain their configuration to its user.')),
      ]},
      { id: 'parents', title: t('Résoudre un héritage sans masquer l’inconnu', 'Resolve inheritance without hiding unknowns'), blocks: [
        text(t('snapshot.tagsForLine(lineId) regroupe les tags de la ligne et de ses parents, sans doublons. Pour les seuls tags locaux, utilisez line.declaredTags. Ces lectures travaillent sur le lot déjà copié ; elles ne complètent pas silencieusement un catalogue incomplet en relisant le jeu.', 'snapshot.tagsForLine(lineId) combines tags from the line and its parents without duplicates. Use line.declaredTags for local tags only. These reads operate on the copied batch; they do not silently reread the game to complete an incomplete catalogue.')),
        table([t('Cas', 'Case'), t('Interprétation', 'Interpretation')], [
          ['parentInformationAvailable = false', t('Relation parentale inconnue, même si parentId est null.', 'Parent relationship unknown, even if parentId is null.')],
          [t('Parent disponible et null', 'Parent available and null'), t('Racine observée : aucun parent déclaré.', 'Observed root: no parent declared.')],
          [t('Parent absent du catalogue, cycle ou limite atteinte', 'Parent missing from catalogue, cycle or limit reached'), t('Résolution incomplète : le résultat reste null.', 'Incomplete resolution: the result remains null.')],
          [t('Résultat non nul et vide', 'Non-null empty result'), t('Aucun tag dans la chaîne résolue demandée.', 'No tags in the requested resolved chain.')],
        ]),
        text(t('Gardez un résultat d’appartenance ternaire : true, false ou null. Réduire null à false ferait passer une lecture incomplète pour une absence de tag certaine, ce qui peut inverser une règle de votre mod.', 'Keep membership three-valued: true, false or null. Reducing null to false would turn an incomplete read into a definite absence of a tag, potentially reversing a mod rule.')),
      ]},
      { id: 'exemples', title: t('Comparer tags locaux et hérités', 'Compare local and inherited tags'), blocks: [
        code(nativeLines, t('Native : exécuter avec le contexte du callback', 'Native: run with the callback context')),
        code(jvmLines, t('JVM : lire le catalogue dans une seule capture', 'JVM: read the catalogue in one capture')),
        text(t('La fiche renvoie la ligne, ses déclarations locales et l’ensemble résolu. Appelez hasTag avec le TagId choisi dans votre configuration. Si le résultat est null, l’écran peut expliquer « tags indisponibles » et la règle métier peut appliquer explicitement son comportement en cas d’inconnu.', 'The card returns the line, its local declarations and the resolved set. Call hasTag with the TagId selected in your configuration. If the result is null, the screen can explain “tags unavailable” and the business rule can explicitly apply its unknown-data behaviour.')),
        links({ label: t('Affectation et horaires du train', 'Train assignment and timetable'), to: '/lire/horaires-trains' }),
      ]},
    ],
  },
  {
    slug: 'lire/horaires-trains', group: 'Lire et agir', status: 'experimental',
    title: t('Lire les horaires et le retard des trains', 'Read train timetables and delay'),
    description: t('Séparer affectation, échéances simulées, retard prévu et offsets du plan de ligne.', 'Separate assignment, simulation deadlines, predicted delay and line-plan offsets.'),
    sections: [
      { id: 'affectation', title: t('Identifier ce que le train doit exécuter', 'Identify what the train is assigned to run'), blocks: [
        text(t('Demandez TrainQuery(includeTimetables = true), qui demande aussi le service et les voies/gares nécessaires. L’affectation décrit horaire, service horaire et index d’ordre lorsqu’ils sont disponibles. La ligne est jointe depuis le service observé, qui décrit l’activité en cours ; ces informations répondent à des questions différentes.', 'Request TrainQuery(includeTimetables = true), which also requests service and the required tracks/stations. Assignment describes the timetable, timetable shift and order index when available. The line is joined from the observed service, which describes current activity; these facts answer different questions.')),
        table([t('Donnée', 'Data'), t('Contrat', 'Contract')], [
          ['Timetable', t('Identité de l’horaire affecté. Son nom n’est pas résolu actuellement : name reste null.', 'Identity of the assigned timetable. Its name is currently unresolved: name remains null.')],
          ['TimetableShiftId', t('Identité du service à l’intérieur d’un horaire. Conserver ensemble timetableId et value.', 'Identity of a shift within a timetable. Keep timetableId and value together.')],
          ['orderIndex', t('Index d’ordre observé, éventuellement absent ; ne pas le confondre avec un index de gare.', 'Observed order index, possibly absent; do not confuse it with a station index.')],
          [t('Gare de service', 'Service station'), t('Lieu lié au service courant ; différent de la gare de position physique.', 'Location associated with current service; distinct from the physical position station.')],
        ]),
      ]},
      { id: 'temps', title: t('Convertir les échéances sans mélanger les horloges', 'Convert deadlines without mixing clocks'), blocks: [
        text(t('Les échéances du service sont des instants simulés. En Native, train.service?.times regroupe les valeurs brutes et leurs GameInstant. En JVM, record.service fournit directement les valeurs et leurs Instant. Les accesseurs de date traitent l’origine simulée ; ne passez pas directement arrivalTimeUs à une conversion depuis 1970.', 'Service deadlines are simulation instants. In Native, train.service?.times groups raw values and their GameInstant values. In JVM, record.service directly provides values and Instant conversions. Date accessors account for the simulation origin; do not pass arrivalTimeUs directly to a conversion relative to 1970.')),
        table([t('Accesseur', 'Accessor'), t('Ce qu’il représente', 'What it represents')], [
          ['observedAt', t('Instant simulé associé à l’observation du service.', 'Simulation instant associated with the service observation.')],
          ['arrival', t('Échéance d’arrivée du service, si disponible.', 'Service arrival deadline, when available.')],
          ['departure', t('Échéance de départ du service, si disponible.', 'Service departure deadline, when available.')],
          ['dispatchRetry', t('Échéance de nouvelle tentative de départ, distincte du départ prévu.', 'Dispatch retry deadline, distinct from scheduled departure.')],
          ['arrivalRemainingSeconds', t('Durée signée jusqu’à l’arrivée ; peut être négative.', 'Signed duration until arrival; may be negative.')],
          ['departureRemainingSeconds', t('Durée avant départ bornée à zéro une fois l’échéance passée.', 'Duration until departure, clamped to zero once the deadline has passed.')],
          ['dispatchRetryRemainingSeconds (Native) / dispatchRemainingSeconds (JVM)', t('Durée avant nouvelle tentative de départ, bornée à zéro.', 'Duration until the dispatch retry, clamped to zero.')],
        ]),
        text(t('GameInstant conserve les secondes UTC et la microseconde. Sa conversion dateTime produit un calendrier à la seconde ; gardez GameInstant pour la précision fine. Les durées ne sont pas des dates et l’horloge réelle capturedAtMillis ne doit pas servir à soustraire une échéance simulée.', 'GameInstant retains UTC seconds and the microsecond. Its dateTime conversion produces a calendar value to the second; keep GameInstant for finer precision. Durations are not dates, and the real-world capturedAtMillis clock must not be subtracted from a simulation deadline.')),
      ]},
      { id: 'retards', title: t('Utiliser l’estimation de retard pour ce qu’elle mesure', 'Use the delay estimate for what it measures'), blocks: [
        text(t('predictedArrivalDelaySeconds est l’estimation signée fournie par le jeu : positive pour du retard, négative pour de l’avance. Elle provient de predictedArrivalDelayUs, une durée en microsecondes. Ce n’est pas une différence à recalculer entre l’heure réelle et arrival, ni une garantie sur l’arrivée future.', 'predictedArrivalDelaySeconds is the signed estimate supplied by the game: positive when late, negative when early. It comes from predictedArrivalDelayUs, a duration in microseconds. It is not a difference to recompute between real-world time and arrival, nor a guarantee about future arrival.')),
        note(t('Une estimation absente reste inconnue. Ne la remplacez pas par zéro et ne déduisez pas un retard nul d’une échéance de départ bornée à zéro. Pour un tri métier, prévoyez explicitement où placer les valeurs inconnues.', 'A missing estimate remains unknown. Do not replace it with zero or infer zero delay from a departure countdown clamped to zero. For business ordering, explicitly decide where unknown values belong.')),
      ]},
      { id: 'plan', title: t('Lire le plan de ligne sans inventer un passage absolu', 'Read the line plan without inventing an absolute passing time'), blocks: [
        text(t('Native expose context.linePlan(trainId), un LinePlan nullable dans la capture du callback. Demandez d’abord le lot nécessaire et évitez de renouveler le réseau entre les lectures liées. En JVM, selectedTrain ajoute lineStops au lot spécialisé. Un plan absent peut être indisponible ou instable ; un point de passage hors gare peut avoir stationId = null.', 'Native exposes context.linePlan(trainId), a nullable LinePlan in the callback capture. Request the required batch first and avoid refreshing the network between related reads. In JVM, selectedTrain adds lineStops to the specialised batch. A missing plan may be unavailable or unstable; a waypoint outside a station may have stationId = null.')),
        text(t('arrivalOffsetSeconds et departureOffsetSeconds sont relatifs au plan de ligne. plannedDwellSeconds calcule leur différence lorsque les deux existent. Une course partielle, une boucle ou l’affectation du train empêche de transformer ces offsets seuls en date de prochain passage : affichez-les comme des offsets de plan.', 'arrivalOffsetSeconds and departureOffsetSeconds are relative to the line plan. plannedDwellSeconds calculates their difference when both exist. Partial runs, loops or the train assignment prevent these offsets alone from becoming the next passing date: display them as plan offsets.')),
      ]},
      { id: 'exemples', title: t('Préparer une fiche horaire sans valeurs inventées', 'Prepare a timing card without invented values'), blocks: [
        code(nativeTimetables, t('Native : horaire et plan dans le contexte de l’outil', 'Native: timetable and plan in the tool context')),
        code(jvmTimetables, t('JVM : plan du train sélectionné et jointures de la capture', 'JVM: selected train plan and joins within the capture')),
        text(t('readTiming conserve chaque absence, les identités composées et la nature des instants. Affichez séparément le retard prévu, les échéances du service et le plan. Les modèles PlannedStop et TrainTiming peuvent être testés avec des valeurs connues, absentes, anticipées ou déjà passées sans lancer le jeu.', 'readTiming preserves every absence, composite identity and kind of instant. Display predicted delay, service deadlines and the plan separately. PlannedStop and TrainTiming models can be tested with known, missing, early or expired values without running the game.')),
        links({ label: t('Horloge simulée et changement de date', 'Simulation clock and changing the date'), to: '/lire/horloge' }),
      ]},
    ],
  },
  {
    slug: 'lire/materiel', group: 'Lire et agir', status: 'experimental',
    title: t('Lire le matériel, la composition et les voyageurs', 'Read material, composition and passengers'),
    description: t('Comparer les profils configuré et actuel et calculer une occupation uniquement avec des données disponibles.', 'Compare configured and current profiles and calculate occupancy only from available data.'),
    sections: [
      { id: 'profils', title: t('Choisir le profil correspondant à la question', 'Choose the profile that answers the question'), blocks: [
        text(t('Ce parcours suppose une requête de trains par lot. includeCharacteristics demande les caractéristiques, includeComposition la composition et includePassengers les occupants. Activez uniquement ce que votre écran utilise ; ces options répondent à des besoins indépendants.', 'This path assumes a batch train query. includeCharacteristics requests characteristics, includeComposition requests composition and includePassengers requests occupants. Enable only what your screen uses; these options answer independent needs.')),
        table([t('Profil', 'Profile'), t('Usage', 'Use')], [
          ['configured', t('Matériel configuré pour le train. Utile à la fiche prévue ou achetée.', 'Material configured for the train. Useful for the planned or purchased specification.')],
          ['current', t('Matériel actuellement observé. Utile aux capacités et à la capacité voyageurs actuelles.', 'Currently observed material. Useful for current capabilities and passenger capacity.')],
          ['purchasedDynamics / currentDynamics', t('Profils de conduite de la lecture JVM ciblée, indépendants l’un de l’autre.', 'Driving profiles in the targeted JVM read, independent of one another.')],
        ]),
        note(t('Les profils sont indépendants. Si current est absent, configured n’est pas une capacité actuelle de remplacement. Une donnée de matériel est une caractéristique rapportée par le jeu, pas une mesure de performance ni une permission.', 'Profiles are independent. If current is absent, configured is not a substitute for current capability. Material data is a characteristic reported by the game, not a performance measurement or a permission.')),
      ]},
      { id: 'unites', title: t('Conserver les unités du SDK', 'Preserve SDK units'), blocks: [
        table([t('Propriété', 'Property'), t('Unité', 'Unit'), t('Interprétation', 'Interpretation')], [
          ['maximumSpeedMps / maximumSpeedKmh', 'm/s / km/h', t('Vitesse maximale du matériel ; la conversion en km/h est déjà exposée.', 'Material maximum speed; conversion to km/h is already exposed.')],
          ['maximumAccelerationMps2', 'm/s²', t('Accélération maximale du profil, pas une accélération mesurée.', 'Profile maximum acceleration, not measured acceleration.')],
          ['tractiveForceN', 'N', t('Force de traction ; diviser par 1 000 pour les kN.', 'Tractive force; divide by 1,000 for kN.')],
          ['powerW', 'W', t('Puissance ; diviser par 1 000 pour les kW.', 'Power; divide by 1,000 for kW.')],
          ['emptyMassKg', 'kg', t('Masse à vide, sans la confondre avec une masse chargée.', 'Empty mass, not a loaded mass.')],
          ['lengthM', 'm', t('Longueur du profil de train.', 'Train-profile length.')],
          ['passengerCapacity', t('personnes', 'people'), t('Capacité déclarée, distincte du nombre présent.', 'Declared capacity, distinct from current occupants.')],
        ]),
        text(t('Conservez les unités natives dans vos modèles et convertissez à l’affichage. Dans une fiche Native, la vitesse observée est en m/s ; la ligne Train JVM du lot utilise speedKmh. La lecture JVM ciblée revient à speedMps. Son TrainDynamics utilise maxSpeedMps, maxAccelerationMps2 et tractiveEffortN, et expose aussi serviceBrakingMps2 et emergencyBrakingMps2 en m/s². Ces noms appartiennent à ce type ciblé, pas à TrainCharacteristics.', 'Keep native units in your models and convert for display. In a Native card, observed speed is in m/s; the JVM batch Train row uses speedKmh. The targeted JVM read uses speedMps again. Its TrainDynamics uses maxSpeedMps, maxAccelerationMps2 and tractiveEffortN, and also exposes serviceBrakingMps2 and emergencyBrakingMps2 in m/s². Those names belong to the targeted type, not to TrainCharacteristics.')),
      ]},
      { id: 'composition', title: t('Conserver l’ordre et l’identité des véhicules', 'Preserve vehicle order and identity'), blocks: [
        text(t('TrainCharacteristics.composition est une liste nullable de TrainVehicle. Son ordre et les répétitions de modelId décrivent la composition : ne transformez pas cette liste en ensemble. Chaque véhicule porte son model et son modelId. Le lot expose aussi vehicleModels pour présenter les modèles référencés ; les libellés inconnus n’effacent pas l’identité du modèle.', 'TrainCharacteristics.composition is a nullable list of TrainVehicle. Its order and repeated modelId values describe the formation: do not turn it into a set. Each vehicle carries its model and modelId. The batch also exposes vehicleModels for displaying referenced models; unknown labels do not erase model identity.')),
        text(t('VehicleModel expose les informations de modèle disponibles, dont son libellé source. Ce libellé n’est pas une traduction fournie par le SDK. Distinguez le nombre d’éléments de composition du nombre de voitures : ils décrivent des niveaux différents et ne se remplacent pas automatiquement.', 'VehicleModel exposes available model information, including its source label. That label is not an SDK-provided translation. Distinguish composition-item count from car count: they describe different levels and cannot automatically substitute for one another.')),
      ]},
      { id: 'voyageurs', title: t('Calculer un taux sans fabriquer de zéro', 'Calculate occupancy without inventing zero'), blocks: [
        text(t('Un taux d’occupation nécessite un nombre d’occupants connu et la capacité actuelle connue, strictement positive. Une capacité nulle rend le ratio indéfini ; une donnée absente ne devient pas zéro. Le résultat peut être supérieur à 100 % si les valeurs observées l’impliquent : ne le tronquez pas silencieusement.', 'An occupancy percentage requires a known occupant count and known, strictly positive current capacity. Zero capacity makes the ratio undefined; missing data does not become zero. The result may exceed 100% if observed values imply it: do not silently clamp it.')),
      ]},
      { id: 'exemples', title: t('Produire des fiches matériel testables', 'Produce testable material cards'), blocks: [
        code(nativeMaterial, t('Native : profils, capacité et ordre des modèles', 'Native: profiles, capacity and model order')),
        code(jvmMaterial, t('JVM : mêmes questions, jointures explicites du lot', 'JVM: the same questions with explicit batch joins')),
        text(t('Les fonctions renvoient une fiche par train avec les deux profils conservés. occupancyPercent est une fonction pure : testez occupants absents, profil absent, capacité zéro et capacité positive. orderedModelIds conserve les doublons et l’ordre ; un résultat null signifie que la composition n’est pas connue.', 'The functions return a card per train while retaining both profiles. occupancyPercent is pure: test missing occupants, a missing profile, zero capacity and positive capacity. orderedModelIds preserves duplicates and order; a null result means composition is unknown.')),
        links({ label: t('Vitesse ciblée et fraîcheur', 'Targeted speed and freshness'), to: '/lire/trains' }, { label: t('Choisir les groupes de requête', 'Choose query groups'), to: '/lire/trains-observations#groupes' }),
      ]},
    ],
  },
]

// Public identifiers and units are intentionally identical in both languages.
for (const value of [
  'context.trains(query)', 'game.trains.snapshot(query = query)', 'snapshot[trainId]',
  'snapshot.train(trainId)', 'context.linePlan(trainId)',
  'game.trains.snapshot(selectedTrain = trainId, query = query)', 'game.trains.read(trainId)',
  'includeService', 'true', 'includeLocations', 'includeTimetables', 'false', 'includeLines',
  'includeTags', 'includeCharacteristics', 'includeComposition', 'includePassengers',
  'null', 'Unknown', 'Other', 'TrainAlert.None', 'train.service?.line?.lineId',
  'record.service?.line', 'snapshot.line(lineId)', 'line.parentLineId', 'line.parentId',
  'line.isDepot', 'line.type == LineType.Depot', 'parentInformationAvailable = false',
  'Timetable', 'TimetableShiftId', 'orderIndex', 'observedAt', 'arrival', 'departure',
  'dispatchRetry', 'arrivalRemainingSeconds', 'departureRemainingSeconds',
  'dispatchRetryRemainingSeconds (Native) / dispatchRemainingSeconds (JVM)',
  'configured', 'current', 'purchasedDynamics / currentDynamics',
  'maximumSpeedMps / maximumSpeedKmh', 'm/s / km/h', 'maximumAccelerationMps2', 'm/s²',
  'tractiveForceN', 'N', 'powerW', 'W', 'emptyMassKg', 'kg', 'lengthM', 'm', 'passengerCapacity',
]) literal(value)
