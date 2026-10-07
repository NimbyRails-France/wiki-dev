import type { Article } from './schema'
import { text, code, note, list, table, links } from './schema'
import connection from './snippets/jvm/Connection.kt?raw'
import targetedTrain from './snippets/jvm/TargetedTrain.kt?raw'
import trackPositions from './snippets/jvm/TrackPositions.kt?raw'
import controlRecipe from './snippets/jvm/ControlRecipe.kt?raw'
import constructionTickets from './snippets/jvm/ConstructionTickets.kt?raw'

export const observationGuidesEnglish: Record<string, string> = {}
const t = (fr: string, en: string) => {
  observationGuidesEnglish[fr] = en
  return fr
}
const literal = (value: string) => t(value, value)

export const observationGuides: Article[] = [
  {
    slug: 'lire/connexion', group: 'Lire et agir',
    title: t('Connecter une application Kotlin/JVM', 'Connect a Kotlin/JVM application'),
    description: t('Choisir une partie, ouvrir une connexion et lire des copies dont votre application maîtrise la durée de vie.', 'Choose a running game, open a connection and read copies whose lifetime your application controls.'),
    sections: [
      { id: 'simple', title: t('Choisir le bon environnement', 'Choose the right environment'), blocks: [
        text(t('Ce parcours s’adresse aux applications Kotlin/JVM externes : tableaux de bord, diagnostics et recettes de test. Il faut le client JVM du SDK, sa bibliothèque compatible et une partie NIMBY Rails en cours. Un mod chargé dans le jeu utilise les callbacks nimby et leur ToolContext ; il n’ouvre pas cette connexion.', 'This path is for external Kotlin/JVM applications: dashboards, diagnostics and test recipes. You need the SDK JVM client, its compatible library and a running NIMBY Rails game. A mod loaded inside the game uses nimby callbacks and their ToolContext; it does not open this connection.')),
        table([t('Objet', 'Object'), t('Responsabilité', 'Responsibility')], [
          ['Nimby', t('Découvrir les parties et ouvrir celle choisie.', 'Discover running games and open the chosen one.')],
          ['Game', t('Conserver une connexion et regrouper trains, horloge, signaux, mods et construction.', 'Own one connection and group trains, clock, signals, mods and construction.')],
          ['Observation / DrivingObservation', t('Conserver des valeurs copiées pour les calculer, les comparer ou les afficher.', 'Own copied values for calculation, comparison or display.')],
        ]),
      ]},
      { id: 'ouvrir', title: t('Sélectionner et fermer explicitement', 'Select and close explicitly'), blocks: [
        text(t('Nimby.runningGames() renvoie des GameProcess avec leur pid et leur nom d’exécutable. S’il y en a plusieurs, présentez le choix à l’utilisateur puis passez le PID à Nimby.connect. Sans PID, connect exige exactement une partie découverte ; il ne choisit pas la première. La découverte ne garantit pas que l’ouverture réussira encore quelques instants plus tard.', 'Nimby.runningGames() returns GameProcess values containing a pid and executable name. If several games exist, let the user choose and pass that PID to Nimby.connect. Without a PID, connect requires exactly one discovered game; it does not pick the first. Discovery does not guarantee that opening will still succeed a moment later.')),
        text(t('Gardez Game ouvert pendant la durée d’utilisation de votre écran ou service. use ferme une utilisation ponctuelle, y compris en cas d’exception. Une application longue ferme sa connexion à son arrêt ou lors d’un changement de partie. Game.advanced expose les opérations détaillées sur la même connexion : ne le fermez pas séparément.', 'Keep Game open for the lifetime of your screen or service. use closes a one-off connection even when an exception occurs. A long-running application closes its connection on shutdown or when switching games. Game.advanced exposes detailed operations on that same connection: do not close it separately.')),
        note(t('L’ouverture peut échouer si la partie a quitté ou si la bibliothèque choisie est incompatible. Affichez l’erreur et laissez l’utilisateur choisir de nouveau. Une erreur de lecture n’est pas la preuve qu’un train, un mod ou une ligne n’existe pas.', 'Opening can fail if the game has exited or the selected library is incompatible. Display the error and let the user select again. A read error is not proof that a train, mod or line does not exist.')),
      ]},
      { id: 'capture', title: t('Première lecture complète', 'First complete reading example'), blocks: [
        code(connection, t('Fonction JVM : chemin du SDK et PID fournis par l’application', 'JVM function: SDK path and PID supplied by the application')),
        text(t('Appelez printTrainSpeeds avec le chemin de la bibliothèque du SDK et le PID choisi. La fonction affiche un nom et une vitesse par train, ou « inconnue » si le jeu n’a pas fourni une mesure fiable. L’horloge est une lecture distincte ; si vous avez besoin de l’heure associée au lot, utilisez snapshot.clock.', 'Call printTrainSpeeds with the SDK library path and chosen PID. The function prints a name and speed for each train, or “unknown” when the game did not provide a reliable measurement. The clock is read separately; use snapshot.clock when you need the time associated with the batch.')),
        links({ label: t('Choisir une lecture ciblée ou un lot', 'Choose a targeted read or a batch'), to: '/lire/trains' }, { label: t('Sélectionner les données des trains', 'Select train data'), to: '/lire/trains-observations' }),
      ]},
    ],
  },
  {
    slug: 'lire/trains', group: 'Lire et agir',
    title: t('Lire un train sans parcourir la carte', 'Read one train without scanning the map'),
    description: t('Construire un indicateur de vitesse ciblé et comprendre les limites temporelles de sa mesure.', 'Build a targeted speed indicator and understand the timing limits of its measurement.'),
    sections: [
      { id: 'cible', title: t('Partir de la question à afficher', 'Start with the question to display'), blocks: [
        text(t('Une application JVM déjà connectée peut lire la conduite d’un train avec game.trains.read(TrainId). Cette lecture convient à un compteur de vitesse, une position ou une comparaison avec les capacités du matériel. L’identifiant vient d’une observation de la partie choisie ; un nom de train ne suffit pas à identifier un objet.', 'An already connected JVM application can read one train’s driving data with game.trains.read(TrainId). This suits a speed indicator, position display or comparison with material capabilities. Obtain the identity from an observation of the selected game; a train name does not uniquely identify an object.')),
        table([t('Besoin', 'Need'), t('Appel', 'Call'), t('Résultat', 'Result')], [
          [t('Mesure de conduite d’un train', 'One train’s driving measurement'), 'game.trains.read(id)', 'DrivingObservation?'],
          [t('Services, tags ou matériel de plusieurs trains', 'Services, tags or material for several trains'), 'game.trains.snapshot(query = ...)', 'Observation'],
          [t('Topologie, occupations et autres tables de carte', 'Topology, occupation and other map tables'), 'game.snapshot(selectedTrain = ...)', 'Observation'],
        ]),
        code(targetedTrain, t('Fonction JVM : une mesure, deux vitesses de nature différente', 'JVM function: one reading, two different kinds of speed')),
        text(t('readSpeed retourne null si le train n’est pas disponible. Dans une fiche obtenue, speedKmh peut encore être inconnue. currentMaximumKmh est la capacité actuelle du matériel ; ce n’est ni la vitesse mesurée, ni la vitesse autorisée au prochain signal. La multiplication par 3,6 convertit ici les mètres par seconde en kilomètres par heure.', 'readSpeed returns null when the train is unavailable. Within a returned card, speedKmh may still be unknown. currentMaximumKmh is the current material capability; it is neither measured speed nor permission to pass the next signal. Multiplying by 3.6 here converts metres per second to kilometres per hour.')),
      ]},
      { id: 'contrat', title: t('Afficher une donnée datée, pas une certitude permanente', 'Display a dated observation, not a permanent certainty'), blocks: [
        list(
          t('null indique une observation absente ou instable. Ne le transformez pas en train arrêté ou supprimé.', 'null indicates an absent or unstable observation. Do not turn it into a stopped or deleted train.'),
          t('speedDefaulted indique qu’une vitesse de remplacement a été utilisée. Conservez l’inconnue au lieu d’afficher un zéro certain.', 'speedDefaulted indicates that a fallback speed was used. Preserve the unknown instead of displaying a definite zero.'),
          t('elapsedBeginMillis et elapsedEndMillis encadrent la lecture en temps simulé. Le résultat n’est pas une photographie atomique d’un seul tick.', 'elapsedBeginMillis and elapsedEndMillis bound the read in simulation time. The result is not an atomic photograph of a single tick.'),
          t('capturedAtMillis date la lecture selon l’horloge de l’ordinateur. Il ne mesure ni le retard du train, ni l’heure de la partie.', 'capturedAtMillis dates the read using the computer clock. It measures neither train delay nor game time.'),
          t('sessionGeneration appartient à la connexion. Effacez les valeurs dérivées à chaque reconnexion et à chaque changement de génération ; comparer seulement le nombre entre deux connexions ne suffit pas.', 'sessionGeneration belongs to the connection. Clear derived values on every reconnect and generation change; comparing the number across connections is insufficient.'),
        ),
        text(t('Rafraîchissez à la fréquence utile à votre écran, avec au plus une lecture en cours par flux. Réutilisez la valeur copiée pour tous ses widgets. Les appels concurrents sur un même Game ne constituent pas une garantie de lecture parallèle ; calculez et formatez les copies hors du chemin de lecture.', 'Refresh at the frequency useful to your screen, with at most one read in flight per stream. Reuse the copied value across its widgets. Concurrent calls on one Game do not guarantee parallel reads; calculate and format copied data outside the reading path.')),
        links({ label: t('Observer services et états par lot', 'Observe services and states in batches'), to: '/lire/trains-observations' }, { label: t('Lire le matériel et la composition', 'Read material and composition'), to: '/lire/materiel' }),
      ]},
    ],
  },
  {
    slug: 'lire/voies', group: 'Lire et agir',
    title: t('Comprendre les positions et la topologie', 'Understand positions and topology'),
    description: t('Relier une position à sa voie, convertir les distances et traiter les réseaux partiels sans inventer de chemin.', 'Join a position to its track, convert distances and handle partial networks without inventing a route.'),
    sections: [
      { id: 'position', title: t('Une voie, une fraction et un sens', 'A track, a fraction and a direction'), blocks: [
        text(t('Après game.snapshot(), utilisez observation.track(id) et platform(id) pour les jointures déjà indexées. Pour consulter souvent les nœuds ou métriques de voie, construisez une fois vos index depuis nodes et trackMetrics du même lot. Une Position porte trackId, fraction et direction. La fraction va de 0 à 1 depuis l’origine de la voie ; le sens +1 ou −1 indique comment on la parcourt et ne change pas cette origine.', 'After game.snapshot(), use observation.track(id) and platform(id) for already indexed joins. To frequently look up nodes or track metrics, build your indexes once from nodes and trackMetrics in that same batch. A Position contains trackId, fraction and direction. The fraction runs from 0 to 1 from the track origin; direction +1 or −1 describes traversal and does not change that origin.')),
        code(trackPositions, t('Classe JVM : indexer les métriques une fois par capture', 'JVM class: index metrics once per capture')),
        text(t('Créez TrackPositions avec l’Observation obtenue, puis appelez atMetres pour les voies souhaitées. Cette fonction d’exemple retourne null si la métrique manque ou si la distance dépasse la voie ; elle évite une recherche linéaire à chaque position. Renouvelez cet index lorsque vous adoptez une nouvelle capture.', 'Create TrackPositions with the returned Observation, then call atMetres for the required tracks. This example function returns null when the metric is missing or the distance lies outside the track; it avoids a linear search for every position. Replace the index when adopting a new snapshot.')),
        table([t('Conversion', 'Conversion'), t('Contrat', 'Contract')], [
          ['metric.offsetM(fraction)', t('Distance depuis l’origine, avec fraction finie dans [0, 1].', 'Distance from the origin, with a finite fraction in [0, 1].')],
          ['metric.fraction(offsetM)', t('Distance finie comprise entre 0 et lengthM ; aucune extrapolation.', 'Finite distance between 0 and lengthM; no extrapolation.')],
          ['metric.distanceM(a, b)', t('Distance positive sur cette même voie, sans choix d’itinéraire.', 'Positive distance on this same track, with no route selection.')],
          ['metric.positionAtMetres(m, direction)', t('Position calculée localement ; ce résultat n’autorise pas une construction.', 'Locally calculated position; this result does not authorise construction.')],
        ]),
        note(t('La géométrie dessinée des TrackNode n’est pas une mesure longitudinale de voie ni un couple latitude/longitude. Si TrackMetric est absente, la longueur reste inconnue. Ne la reconstituez pas avec une distance droite entre deux nœuds.', 'Drawn TrackNode geometry is neither longitudinal track length nor a latitude/longitude pair. If TrackMetric is absent, length remains unknown. Do not reconstruct it from the straight-line distance between two nodes.')),
      ]},
      { id: 'disponibilite', title: t('Traiter les relations manquantes', 'Handle missing relationships'), blocks: [
        text(t('Une capture peut ne pas fournir toutes les relations. Un lien de nœud absent ne prouve pas la présence d’un butoir. Un aiguillage décrit des connexions et des directions, pas un itinéraire réservé pour un train. Les parcours doivent détecter cycles, branches et références absentes, avec une limite de distance ou de nombre de segments.', 'A capture may not supply every relationship. A missing node link does not prove there is a buffer stop. A junction describes connections and directions, not a train’s reserved route. Traversals must detect cycles, branches and missing references, with a distance or segment-count limit.')),
        table([t('Donnée', 'Data'), t('Interprétation', 'Interpretation')], [
          ['TrackUsage', t('Intervalle sur une voie associé à un train. Plusieurs intervalles peuvent se chevaucher ; leur ordre ne constitue pas un chemin.', 'An interval on a track associated with a train. Intervals may overlap; their order does not form a path.')],
          ['reservations / occupations', t('null : table indisponible. Une table obtenue décrit réservations et présence physique séparément.', 'null: table unavailable. A supplied table describes reservations and physical occupation separately.')],
          ['selectedPath', t('Chemin observé du train sélectionné dans la capture complète ; ne pas le déduire des réservations triées.', 'Observed path for the selected train in a full capture; do not infer it from sorted reservations.')],
          ['Platform', t('Relie une voie de quai à une gare ; toutes les voies ne sont pas des quais.', 'Connects a platform track to a station; not every track is a platform.')],
        ]),
        text(t('La capture spécialisée game.trains.snapshot ne demande pas le réseau complet. Ses tables de voies ou d’occupations ne servent donc pas à conclure que la carte est vide. Dans un outil Native, partez de context.network() et des fonctions de topologie de l’API d’outil pour éviter de réimplémenter ces parcours.', 'The specialised game.trains.snapshot does not request the full network. Its track or occupation tables therefore cannot establish that the map is empty. In a Native tool, start from context.network() and the tool API topology helpers to avoid reimplementing those traversals.')),
        links({ label: t('Développer un outil dans le jeu', 'Develop an in-game tool'), to: '/mods/outils-optionnels' }, { label: t('Créer des signaux avec un ticket', 'Create signals with a ticket'), to: '/lire/construction' }),
      ]},
    ],
  },
  {
    slug: 'lire/horloge', group: 'Lire et agir',
    title: t('Lire et changer l’heure simulée', 'Read and change simulation time'),
    description: t('Distinguer heure de la partie, durée écoulée et horloge réelle, puis appliquer un changement explicite.', 'Distinguish game time, elapsed duration and real-world time, then apply an explicit change.'),
    sections: [
      { id: 'lire', title: t('Lire l’heure utile au calcul', 'Read the time relevant to the calculation'), blocks: [
        text(t('Dans une application JVM connectée, game.clock.read() fournit une SimulationClock nullable sans demander la carte complète. Utilisez clock.toInstant() pour la date UTC. Si un lot est déjà disponible, snapshot.clock évite une lecture supplémentaire et conserve l’heure associée à ce lot.', 'In a connected JVM application, game.clock.read() returns a nullable SimulationClock without requesting the whole map. Use clock.toInstant() for its UTC date. If a batch is already available, snapshot.clock avoids another read and retains the time associated with that batch.')),
        table([t('Temps', 'Time'), t('Usage', 'Use')], [
          ['SimulationClock.toInstant()', t('Date simulée ; l’origine peut être antérieure à 1970.', 'Simulation date; its origin may precede 1970.')],
          ['SimulationClock.ticks', t('Durée simulée depuis l’origine, en centièmes de seconde.', 'Simulation duration since the origin, in hundredths of a second.')],
          ['capturedAtMillis', t('Date réelle de capture selon l’ordinateur, en millisecondes UTC.', 'Real capture timestamp from the computer, in UTC milliseconds.')],
          [t('Délai d’actualisation de l’interface', 'Interface refresh delay'), t('Cadence réelle choisie par votre application ; indépendante de la vitesse de jeu.', 'Real-world cadence chosen by your application; independent of game speed.')],
        ]),
        text(t('Une pause immobilise le temps simulé sans immobiliser le temps réel. L’accélération change leur rapport. Pour les animations et décisions de mod, employez le temps simulé approprié au callback ; pour limiter la fréquence d’un écran externe, employez une durée réelle monotone.', 'Pausing freezes simulation time without freezing real-world time. Acceleration changes their ratio. For mod animations and decisions, use the simulation time appropriate to the callback; to limit an external screen’s refresh rate, use a monotonic real-world duration.')),
      ]},
      { id: 'changer', title: t('Choisir les effets avant de confirmer', 'Choose the effects before confirming'), blocks: [
        table([t('Mode', 'Mode'), t('Effet', 'Effect')], [
          ['recalculateTrains = false', t('Translate la date en conservant positions et délais relatifs.', 'Shifts the date while preserving positions and relative delays.')],
          ['recalculateTrains = true', t('Demande aussi le recalcul du jeu ; des déplacements et des coûts peuvent en résulter.', 'Also requests game recalculation; movements and costs may result.')],
        ]),
        code('val chosenUtc = Instant.parse("2030-05-12T14:30:00Z")\nval result = game.clock.set(chosenUtc, recalculateTrains = false)\nprintln(result.clock.toInstant())\nprintln(result.interventions)', t('Fragment JVM : à exécuter après confirmation de la date et du mode', 'JVM fragment: execute after the date and mode have been confirmed')),
        text(t('La date demandée est un Instant UTC en secondes entières : nano doit valoir zéro. La fraction de seconde de la simulation est conservée ; l’heure retournée n’est donc pas nécessairement pile sur la seconde demandée. interventions indique le nombre d’interventions du recalcul, pas un nombre de trains lus.', 'The requested date is a UTC Instant in whole seconds: nano must be zero. The simulation’s subsecond phase is preserved, so the returned time need not fall exactly on the requested second. interventions reports recalculation interventions, not a count of trains read.')),
        note(t('Une exception peut survenir après le début du changement. Relisez l’horloge et l’état de la partie avant toute autre décision ; ne relancez jamais cette écriture automatiquement. Dans un outil Native, context.changeTime applique la même distinction de modes.', 'An exception can occur after the change has begun. Reread the clock and game state before deciding what to do next; never automatically retry this write. In a Native tool, context.changeTime applies the same distinction between modes.')),
        links({ label: t('Lire les échéances et le retard', 'Read deadlines and delay'), to: '/lire/horaires-trains' }),
      ]},
    ],
  },
  {
    slug: 'lire/recettes', group: 'Lire et agir',
    title: t('Tester un mod avec des forçages temporaires', 'Test a mod with temporary overrides'),
    description: t('Ouvrir une session de recette, observer les décisions et libérer les forçages de manière explicite.', 'Open a test session, observe decisions and release overrides explicitly.'),
    sections: [
      { id: 'session', title: t('Un scénario lié au contrat du mod', 'A scenario tied to the mod contract'), blocks: [
        text(t('Ce parcours suppose une application JVM connectée et un mod qui accepte les opérations de recette. Commencez par game.mods.status(modId). Les codes d’aspect et indices de réglages appartiennent au mod testé : prenez-les dans ses déclarations, sans attribuer une signification universelle à un entier.', 'This path assumes a connected JVM application and a mod that accepts test operations. Start with game.mods.status(modId). Aspect codes and setting indices belong to the mod being tested: obtain them from its declarations rather than assigning universal meaning to an integer.')),
        code(controlRecipe, t('Fonction JVM : acquisition, action et libération par use', 'JVM function: acquisition, action and release through use')),
        text(t('La fonction observe fournie par votre application organise les lectures de recette pendant le bail. forceSignal accepte une demande ; sa réponse seule ne prouve pas que le prochain calcul du mod a déjà affiché cet aspect. Utilisez recipe.readSignal(signalId), puis les observations du jeu, pour vérifier le résultat attendu.', 'The observe function supplied by your application schedules test readings during the lease. forceSignal accepts a request; its response alone does not prove that the mod’s next evaluation has already displayed that aspect. Use recipe.readSignal(signalId), then game observations, to check the expected outcome.')),
        table([t('Lecture', 'Reading'), t('Sens de active', 'Meaning of active')], [
          ['readSignal', t('0 : aucun forçage ; 1 : forçage demandé ; 2 : dernière décision observée conforme au forçage.', '0: no override; 1: override requested; 2: last observed decision matches the override.')],
          ['readTrain', t('État TrainControlState : Absent, AwaitingExit, Active, Completed ou Cancelled. Il ne constitue pas une permission de mouvement.', 'A TrainControlState: Absent, AwaitingExit, Active, Completed or Cancelled. It does not grant movement permission.')],
        ]),
        text(t('constrainTrain exprime une vitesse en m/s, un mode et éventuellement un signal de sortie. releaseByRear choisit une libération par l’arrière du train ; false correspond à la tête. setSetting modifie temporairement un réglage booléen ; ce n’est pas une écriture de configuration sauvegardée. Les compteurs décrivent les forçages demandés, pas le nombre de décisions déjà exécutées.', 'constrainTrain expresses a speed in m/s, a mode and optionally an exit signal. releaseByRear selects release by the rear of the train; false uses the head. setSetting temporarily overrides a boolean setting; it does not write saved configuration. Counts describe requested overrides, not how many decisions have already executed.')),
      ]},
      { id: 'expiration', title: t('Limiter la durée et gérer une réponse incertaine', 'Bound the duration and handle an uncertain response'), blocks: [
        list(
          t('Le bail dure de 1 000 à 60 000 ms. Aucun renouvellement en arrière-plan : renew est un choix explicite de la recette.', 'A lease lasts 1,000 to 60,000 ms. There is no background renewal: renew is an explicit decision by the test.'),
          t('restoreSignal, restoreTrain et restoreSetting libèrent une cible ; clear libère les forçages de la session. close libère le bail et use appelle close.', 'restoreSignal, restoreTrain and restoreSetting release one target; clear releases the session’s overrides. close releases the lease and use calls close.'),
          t('Si le programme disparaît ou ne peut plus libérer le bail, son expiration retire les forçages temporaires.', 'If the program disappears or cannot release its lease, expiration removes temporary overrides.'),
          t('Après une erreur, inspectez status et les observations avant une nouvelle écriture. Une absence de réponse ne prouve pas que la demande a été ignorée.', 'After an error, inspect status and observations before another write. A missing response does not prove that the request was ignored.'),
        ),
      ]},
      { id: 'texture', title: t('Tester l’apparence séparément', 'Test appearance separately'), blocks: [
        text(t('game.signals.showTexture(id, catalogue, image, durationMillis) remplace temporairement l’image pour 1 à 60 secondes ; restoreTexture retire ce remplacement. Le catalogue et l’image doivent désigner des ressources valides. Cette opération concerne l’affichage uniquement : elle ne force ni aspect logique, ni permission, ni freinage.', 'game.signals.showTexture(id, catalogue, image, durationMillis) temporarily replaces the image for 1 to 60 seconds; restoreTexture removes that replacement. Catalogue and image must identify valid resources. This affects display only: it forces neither logical aspect, permission nor braking.')),
        links({ label: t('Définir l’apparence des signaux', 'Define signal appearance'), to: '/mods/images' }, { label: t('Règles de conduite', 'Driving rules'), to: '/mods/conduite' }),
      ]},
    ],
  },
  {
    slug: 'lire/construction', group: 'Lire et agir', status: 'experimental',
    title: t('Créer des signaux avec un ticket de construction', 'Create signals with a construction ticket'),
    description: t('Préparer une action confirmée, conserver son ticket et inspecter un résultat en cours ou partiel.', 'Prepare a confirmed action, keep its ticket and inspect pending or partial results.'),
    sections: [
      { id: 'cycle', title: t('Préparer, soumettre une fois, puis inspecter', 'Prepare, submit once, then inspect'), blocks: [
        text(t('La construction JVM est expérimentale et nécessite la fonctionnalité de construction du SDK. Votre application calcule son plan, le présente puis reçoit une confirmation explicite avant de créer. Contrairement à l’API d’outil Native, Game.Construction ne fournit pas de méthode de prévisualisation : elle expose prepare, create, poll et undo.', 'JVM construction is experimental and requires the SDK construction feature. Your application calculates and displays its plan, then receives explicit confirmation before creating anything. Unlike the Native tool API, Game.Construction does not provide a preview method: it exposes prepare, create, poll and undo.')),
        list(
          t('Obtenez le signal source et les voies dans la partie courante. Après un changement de partie ou de plan, abandonnez le ticket et faites confirmer un nouveau plan.', 'Obtain the source signal and tracks from the current game. After a game or plan change, abandon the ticket and have a new plan confirmed.'),
          t('Le lot contient de 1 à 64 positions distinctes. Chaque fraction est finie et strictement entre 0 et 1 ; chaque sens vaut +1 ou −1.', 'A batch contains 1 to 64 distinct positions. Each fraction is finite and strictly between 0 and 1; each direction is +1 or −1.'),
          t('prepare fournit un ticket lié à cette partie et à son éditeur. Conservez tout token non nul avant de soumettre create ; attendez READY.', 'prepare supplies a ticket tied to that game and editor. Retain every nonzero token before submitting create; wait for READY.'),
          t('Après la soumission, poll observe le résultat. Ne rappelez pas create pour attendre la fin.', 'After submission, poll observes the outcome. Do not call create again to wait for completion.'),
        ),
        code(constructionTickets, t('Classe JVM : un plan déjà validé et confirmé, sans boucle d’attente bloquante', 'JVM class: an already validated and confirmed plan, without a blocking wait loop')),
        text(t('Appelez prepare une fois ; votre interface peut ensuite inspecter le ticket à une cadence modérée. Lorsque l’état devient READY, createOnce soumet le lot une seule fois. Le marqueur submitted est posé avant l’écriture : si celle-ci lève une exception, inspect reste disponible et une nouvelle création est refusée localement. L’objet reste attaché au Game qui l’a créé.', 'Call prepare once; your interface may then inspect the ticket at a moderate cadence. Once the state becomes READY, createOnce submits the batch once. The submitted marker is set before writing: if the write throws, inspect remains available and another creation is refused locally. The object remains attached to the Game that created it.')),
        table([t('État', 'State'), t('Décision de l’application', 'Application decision')], [
          ['READY', t('Ticket prêt ; le lot confirmé peut être soumis.', 'Ticket ready; the confirmed batch can be submitted.')],
          ['PENDING', t('Opération en cours. Inspecter si un token non nul est disponible.', 'Operation pending. Inspect when a nonzero token is available.')],
          ['APPLIED', t('Création appliquée ; lire createdIds et canUndo.', 'Creation applied; read createdIds and canUndo.')],
          ['PARTIAL', t('Une partie seulement a été créée. Conserver les IDs et expliquer le résultat avant toute suite.', 'Only part was created. Keep the IDs and explain the result before proceeding.')],
          ['REJECTED', t('Demande refusée ; présenter reason et vérifier l’état avant un nouveau plan.', 'Request rejected; present reason and inspect state before a new plan.')],
          ['UNDONE', t('Annulation terminée pour ce ticket.', 'Undo completed for this ticket.')],
        ]),
        note(t('Une exception de prepare sans ticket connu ne permet pas de poll. Arrêtez ce scénario et inspectez la partie ; ne recommencez pas automatiquement. Une exception après create peut laisser des signaux créés : poll du ticket connu est la voie de vérification.', 'A prepare exception without a known ticket leaves nothing to poll. Stop that scenario and inspect the game; do not restart automatically. An exception after create may leave created signals: poll the known ticket to verify the outcome.')),
      ]},
      { id: 'annuler', title: t('Respecter la disponibilité de l’annulation', 'Respect undo availability'), blocks: [
        text(t('canUndo décrit l’état observé du ticket. Une commande d’édition intervenue ensuite peut invalider l’annulation ; relisez le résultat avant de proposer undo et vérifiez aussi sa réponse. Ne déduisez pas la possibilité d’annuler de la seule présence de createdIds. L’exemple pose undoSubmitted avant l’écriture et refuse un second appel, même après une exception : inspecter le ticket reste possible sans rejouer l’annulation.', 'canUndo describes the ticket’s observed state. A subsequent editor command may invalidate undo; reread the result before offering undo and check its response too. Do not infer undo availability merely from createdIds being present. The example sets undoSubmitted before writing and refuses a second call, even after an exception: the ticket can still be inspected without repeating undo.')),
        links({ label: t('Positions et métriques de voie', 'Positions and track metrics'), to: '/lire/voies' }, { label: t('Créer un outil avec prévisualisation', 'Create a tool with preview'), to: '/mods/outils-optionnels' }),
      ]},
    ],
  },
]

// These table labels are API spellings, not prose requiring a translation.
for (const value of [
  'Nimby', 'Game', 'Observation / DrivingObservation', 'game.trains.read(id)',
  'DrivingObservation?', 'game.trains.snapshot(query = ...)', 'Observation',
  'game.snapshot(selectedTrain = ...)', 'metric.offsetM(fraction)', 'metric.fraction(offsetM)',
  'metric.distanceM(a, b)', 'metric.positionAtMetres(m, direction)', 'TrackUsage',
  'reservations / occupations', 'selectedPath', 'Platform', 'SimulationClock.toInstant()',
  'SimulationClock.ticks', 'capturedAtMillis', 'recalculateTrains = false',
  'recalculateTrains = true', 'readSignal', 'readTrain', 'READY', 'PENDING',
  'APPLIED', 'PARTIAL', 'REJECTED', 'UNDONE',
]) literal(value)
