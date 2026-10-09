/** Reviewed developer-facing wording. Keys are public API identities, not source lines. */
export const apiComments: Record<string, [string, string]> = {
  'native:nimby:class:TrainEditor': [
    'Règles de composition déclarées une fois dans toolMod. Le mod choisit la préférence de longueur et ses messages ; le SDK contrôle les modifications. Aucun onTick ni fenêtre n’est nécessaire.',
    'Composition rules declared once inside toolMod. The mod chooses the length preference and its messages; the SDK checks changes. No onTick or window is required.',
  ],
  'native:nimby:class:TrainEditorBuilder': [
    'Utilisez trainEditor { maximumLength(...) } et enregistrez la même IntegerOption avec options(...). Les messages acceptent tr sans paramètres.',
    'Use trainEditor { maximumLength(...) } and register the same IntegerOption with options(...). Messages accept tr without parameters.',
  ],
  'native:nimby:class:TrainLengthLimit': [
    'Longueur totale en mètres, tous véhicules compris. Le mod choisit le défaut et le joueur peut le modifier dans Options → NRF Hub. Une baisse ne raccourcit pas les trains existants.',
    'Total length in metres, including all vehicles. The mod chooses the default and the player can change it in Options → NRF Hub. Lowering it does not shorten existing trains.',
  ],
  'jvm:fr.nimby.sdk:class:ConstructionResult': [
    'Résultat de construction expérimental. Le ticket appartient à une partie et à une session d’édition ; des commandes intermédiaires peuvent le rendre invalide. Après une réponse incertaine, consulter le ticket sans répéter la construction.',
    'Experimental construction result. A ticket belongs to a game and editing session; intervening commands can invalidate it. After an uncertain response, poll the ticket without repeating construction.',
  ],
  'jvm:fr.nimby.sdk:class:DiagnosticLog': [
    'Journal distinct des observations et sauvegardes. Ne pas journaliser chaque lecture réussie. Les erreurs répétées sont regroupées, puis comptées lors de la reprise, d’un changement ou après 30 secondes. Chaque écriture ferme le fichier.',
    'Log separate from observations and saves. Do not log every successful read. Repeated errors are coalesced and counted on recovery, change or after 30 seconds. Each write closes the file.',
  ],
  'jvm:fr.nimby.sdk:fun:DiagnosticLog.startApplication(String)': [
    'Installer une seule fois au point d’entrée de l’application, jamais depuis une bibliothèque. Le journal d’exceptions ne constitue pas un rapport complet de crash.',
    'Install once at the application entry point, never from a library. An exception log is not a complete crash report.',
  ],
  'jvm:fr.nimby.sdk:class:TrainDynamics': [
    'Paramètres du matériel rapportés par le jeu, en unités SI ; ce ne sont pas des performances mesurées.',
    'Material parameters reported by the game, in SI units; these are not measured performance.',
  ],
  'jvm:fr.nimby.sdk:class:DrivingObservation': [
    'Résultat copié d’une lecture ciblée. null signifie indisponible ; les profils acheté et actuel sont indépendants. sessionGeneration appartient à la connexion, pas à une sauvegarde universellement identifiée. Réinitialiser l’état dérivé après reconnexion ou changement de génération. elapsedBeginMillis et elapsedEndMillis encadrent la lecture en temps simulé ; capturedAtMillis est l’heure de l’ordinateur. Ce n’est pas un tick atomique.',
    'Copied result of a targeted read. null means unavailable; purchased and current profiles are independent. sessionGeneration belongs to the connection, not a globally identified save. Reset derived state after reconnecting or a generation change. elapsedBeginMillis and elapsedEndMillis bound the read in simulation time; capturedAtMillis is computer time. This is not an atomic tick.',
  ],
  'jvm:fr.nimby.sdk:class:ControlOperation': [
    'Opérations de recette ; les codes d’aspect et indices de réglage appartiennent au mod.',
    'Test-control operations; aspect codes and setting indices belong to the mod.',
  ],
  'jvm:fr.nimby.sdk:class:ControlResponse': [
    'Les compteurs décrivent les forçages demandés. ReadSignal retourne la dernière décision évaluée ; ReadTrain.active représente TrainControlState, pas une permission de mouvement.',
    'Counts describe requested overrides. ReadSignal returns the last evaluated decision; ReadTrain.active represents TrainControlState, not movement permission.',
  ],
  'jvm:fr.nimby.sdk:class:ModControlSession': [
    'Bail de recette explicite, sans renouvellement de fond ni reprise automatique. L’expiration libère les forçages temporaires. Après une erreur, consulter l’état et les observations avant de choisir une nouvelle mutation. Obtenir cette session avec game.mods.control ou acquireModControl, puis la fermer.',
    'Explicit test-control lease, without background renewal or automatic retries. Expiration relinquishes temporary overrides. After an error, inspect status and observations before choosing another mutation. Obtain this session through game.mods.control or acquireModControl, then close it.',
  ],
  'jvm:fr.nimby.sdk:class:NimbyClient': [
    'Possède une connexion. Les observations retournées sont des copies indépendantes conservables après fermeture. Ouvrir avec NimbyClient.open et fermer avec use.',
    'Owns a connection. Returned observations are independent copies that remain usable after closing. Open with NimbyClient.open and close with use.',
  ],
  'jvm:fr.nimby.sdk:fun:NimbyClient.readTrain(Long)': [
    'Lit uniquement ce train, sans capture du réseau ni écriture dans le jeu. null signifie absent ou instable ; les autres échecs lèvent SdkException. Les opérations d’une connexion sont sérialisées. Le résultat reste utilisable après fermeture.',
    'Reads only this train, without capturing the network or writing to the game. null means absent or unstable; other failures raise SdkException. Operations on one connection are serialized. The result remains usable after closing.',
  ],
  'jvm:fr.nimby.sdk:fun:NimbyClient.prepareConstruction(Long)': [
    'Prépare explicitement la construction expérimentale. Une simple capture ne prépare jamais une mutation.',
    'Explicitly prepares experimental construction. A snapshot alone never prepares a mutation.',
  ],
  'jvm:fr.nimby.sdk:fun:NimbyClient.undoConstruction(Long)': [
    'Refuse si une commande intermédiaire empêche d’attribuer la dernière opération annulable à cette série.',
    'Refuses if an intervening command prevents attributing the latest undoable operation to this series.',
  ],
  'jvm:fr.nimby.sdk:fun:NimbyClient.setSimulationDateTime(java.time.Instant,Boolean)': [
    'Mutation explicite, jamais répétée automatiquement. Un échec peut survenir après un effet partiel : relire avant de décider d’une nouvelle action. L’entrée utilise des secondes UTC entières ; la fraction de seconde est conservée.',
    'Explicit mutation, never automatically repeated. Failure can occur after a partial effect: read again before deciding on another action. Input uses whole UTC seconds; the subsecond fraction is preserved.',
  ],
  'jvm:fr.nimby.sdk:fun:NimbyClient.showSignalTextureFor(Long,String,String,Int)': [
    'Changement visuel uniquement, sans modification des permissions ni des décisions des mods.',
    'Visual change only, without changing permissions or mod decisions.',
  ],
  'jvm:fr.nimby.sdk:fun:NimbyClient.modControl(String,ControlRequest)': [
    'Envoie une seule demande au mod chargé dans la partie explicitement choisie.',
    'Sends one request to the mod loaded in the explicitly selected game.',
  ],
  'jvm:fr.nimby.sdk:class:Train': [
    'Identifiants opaques. Une observation inconnue reste null ; aucun état libre n’est fabriqué.',
    'Opaque identifiers. An unknown observation remains null; no clear state is manufactured.',
  ],
  'jvm:fr.nimby.sdk:fun:SimulationClock.toInstant()': [
    'Convertit les centièmes de seconde en date UTC ; l’origine du calendrier peut précéder 1970.',
    'Converts hundredths of a second to a UTC date; the calendar origin may precede 1970.',
  ],
  'native:nimby:val:Checkbox.onlyWhenEnabled': [
    "Pour un avertissement importé : visible tant qu'il reste à acquitter.",
    'For an imported warning: visible until it is acknowledged.',
  ],
  'native:nimby:val:SignalType.observeApproach': [
    'Demande une observation des trains dirigés vers ce signal dans les cantons précédents. Cette observation ne réserve pas la voie et ne donne aucune permission de mouvement.',
    'Requests observations of trains heading towards this signal in preceding blocks. This observation neither reserves the track nor grants movement permission.',
  ],
  'native:nimby:val:SignalType.approachBlocks': [
    'Portée de 1 à 16 cantons : 1 désigne le canton immédiatement précédent. Le parcours suit la tête du train sans choisir de branche. Le mod décide comment utiliser cette observation.',
    'Range from 1 to 16 blocks: 1 means the immediately preceding block. The traversal follows the train head without choosing a branch. The mod decides how to use the observation.',
  ],
  'native:nimby:val:SignalType.construction': [
    'Ressources et entrée constructible utilisées pour générer mod.txt.',
    'Resources and constructible entry used to generate mod.txt.',
  ],
  'native:nimby:val:Signal.type': [
    'Identifiant du SignalType observé, fourni par le SDK.',
    'Observed SignalType identifier supplied by the SDK.',
  ],
  'native:nimby:enum-entry:DrivingFlag.ApproachPassable': [
    'Autorise le passage à la vitesse mémorisée sans libérer les autres restrictions.',
    'Allows passage at the remembered speed without releasing other restrictions.',
  ],
  'native:nimby:fun:SignallingMod.prepareNetwork(List<Signal>)': [
    'Transforme uniquement les réglages effectifs de ce réseau observé. Ne persiste pas ces valeurs dérivées et ne modifie ni la topologie ni les observations.',
    'Transforms only the effective settings of this observed network. It does not persist derived values or change topology or observations.',
  ],
  'native:nimby:val:maximumSignalNetworkSize': [
    'Nombre maximal de signaux accepté par la préparation validée du réseau : 4096.',
    'Maximum signal count accepted by validated network preparation: 4096.',
  ],
  'native:nimby:val:SignalActionRequest.value': [
    "Nouvelle valeur d'un champ entier ; null pour un clic de bouton.",
    'New integer-field value; null for a button click.',
  ],
  'native:nimby:class:NumberSetting': [
    'Réglage entier persistant et borné dans le panneau du signal. Lire sa valeur avec read dans les règles ; zéro peut représenter uniquement le signal source selon la politique du mod.',
    'Persistent bounded integer setting in the signal panel. Read its value with read in rules; zero may mean the source signal only, depending on mod policy.',
  ],
  'native:nimby:val:ToolSignal.travelDirection': [
    'Sens des trains : +1 de A vers B, -1 de B vers A. Le SDK tient compte du modèle de signal.',
    'Train direction: +1 from A to B, -1 from B to A. The SDK accounts for the signal model.',
  ],
  'native:nimby:fun:ToolSignal.placementAt(Long,Double,Int)': [
    'Prépare un emplacement de copie. travelDirection est le sens des trains sur la voie cible (+1 de A vers B, -1 de B vers A). Utiliser la même position pour l’aperçu et la construction.',
    'Prepares a copy position. travelDirection is the train direction on the target track (+1 from A to B, -1 from B to A). Use the same position for preview and construction.',
  ],
  'native:nimby:fun:ToolContext.trains(TrainQuery)': [
    'Lecture groupée des trains, uniquement sur demande. Les données du callback sont réutilisées si elles couvrent la requête ; les besoins supplémentaires déclenchent une nouvelle lecture groupée. Les copies restent valables après le callback.',
    'Batch train read performed only on request. Callback data is reused when it covers the query; additional requirements trigger a new batch read. Copies remain valid after the callback.',
  ],
  'native:nimby:fun:ToolContext.linePlan(Long)': [
    'Plan complet de la ligne du train dans la capture du callback, ou null s’il est absent ou instable. Les heures sont des offsets relatifs, sans date commerciale déduite. network() renouvelle la capture.',
    'Complete train line plan from the callback snapshot, or null when absent or unstable. Times are relative offsets, with no inferred commercial dates. network() refreshes the snapshot.',
  ],
  'native:nimby:fun:ToolContext.changeTime(GameDateTime,Boolean)': [
    'Change la date UTC choisie dans le formulaire. Les mêmes garanties que changeTime(utcSeconds) s’appliquent : aucune reprise automatique après une réponse incertaine.',
    'Changes the UTC date selected in the form. The changeTime(utcSeconds) guarantees also apply: no automatic retry after an uncertain response.',
  ],
  'native:nimby:fun:ToolContext.showSignalPreview(SignalActionRequest,List<SignalPosition>)': [
    'Affiche jusqu’à 64 positions avec le modèle du signal source, sans construire. Renouveler dans onTick : l’aperçu expire après deux secondes sans publication et disparaît à l’arrêt du mod ou de la partie. Il concerne seulement le signal source en cours d’édition ; une nouvelle saisie masque l’ancien aperçu. La dernière publication remplace la précédente. Le retour ne garantit pas la visibilité de chaque position, qui dépend du cadrage et des couches du jeu. Un refus isBusy ne renouvelle pas l’ancien aperçu : conserver les positions, bloquer la confirmation et retenter la présentation au prochain tick.',
    'Displays up to 64 positions using the source signal model without constructing anything. Renew in onTick: the preview expires after two seconds without publication and disappears when the mod or game stops. It concerns only the source signal currently being edited; new input hides the previous preview. The latest publication replaces the previous one. Returning does not guarantee that every position is visible: framing and game layers still apply. An isBusy refusal does not renew the old preview: retain positions, block confirmation and retry presentation at the next tick.',
  ],
  'native:nimby:fun:ToolContext.clearSignalPreview()': [
    'Retire seulement l’aperçu de ce mod, sans modifier les signaux construits ni l’annulation. isBusy ne confirme pas le retrait : révoquer immédiatement les confirmations locales et retenter ce nettoyage au prochain tick. L’ancien aperçu conserve son expiration.',
    'Removes only this mod’s preview, without changing constructed signals or undo history. isBusy does not confirm removal: immediately revoke local confirmations and retry this cleanup at the next tick. The previous preview retains its expiration.',
  ],
  'native:nimby:fun:ToolContext.showPanel(SignalActionRequest,String,List<ToolButton>,List<ToolNumberInput>)':
    [
      'Remplace l’action à l’origine de request par les contrôles indiqués. Les clics suivants reviennent au même service, avec l’identifiant du bouton dans action. Si isBusy est levée, conserver le modèle du panneau pour le prochain tick et refuser les commandes nécessitant sa publication, même si un ancien clic arrive.',
      'Replaces the action that originated request with the supplied controls. Later clicks return to the same service, with the button identifier in action. If isBusy is raised, retain the panel model for the next tick and reject commands requiring its publication, even if an old click arrives.',
    ],
  'native:nimby:class:ToolOperationException': [
    'Refus conservant le statut SDK. isBusy indique une ressource temporairement indisponible ; il n’autorise jamais à rejouer une construction ou un changement d’heure, qui peut déjà avoir commencé. Les lectures et présentations sans mutation peuvent être retentées lors d’un callback ultérieur.',
    'Refusal retaining the SDK status. isBusy means a temporarily unavailable resource; it never authorizes replaying construction or a time change that may already have started. Reads and presentations without mutation may be retried in a later callback.',
  ],
  'native:nimby:class:ToolTrackEnd': [
    'Extrémités géométriques d’une voie, indépendantes du sens de circulation.',
    'Geometric track ends, independent of travel direction.',
  ],
  'native:nimby:interface:ToolTrackConnection': [
    'Connexion observée sans choix de branche d’aiguille. Unknown n’est jamais une preuve de fin de voie : les données peuvent être incomplètes.',
    'Observed connection without choosing a junction branch. Unknown is never evidence of a track end: data may be incomplete.',
  ],
  'native:nimby:class:ToolRouteTrack': [
    'Voie utilisable pour les distances. Les positions d’aiguilles sont triées et exprimées en mètres depuis A, y compris celles abordées en talon.',
    'Track usable for distance calculations. Junction positions are sorted and measured in metres from A, including trailing junctions.',
  ],
  'native:nimby:class:ToolTopology': [
    'Copie indexée obtenue avec network.topology(). Les voies sans longueur connue sont omises ; leurs connexions restent Unknown. Aucune branche n’est choisie implicitement. Cette copie ne remplace pas une nouvelle capture après préparation d’une pose.',
    'Indexed copy obtained with network.topology(). Tracks without a known length are omitted; connections to them remain Unknown. No branch is chosen implicitly. This copy does not replace a fresh snapshot after preparing construction.',
  ],
  'native:nimby:fun:ToolNetwork.topology()': [
    'Prépare les distances, aiguilles et connexions typées de cette capture pour les outils de parcours.',
    'Prepares typed distances, junctions and connections from this snapshot for route tools.',
  ],
  'native:nimby:class:GameInstant': [
    'Instant du calendrier UTC du jeu, précis à la microseconde ; ce n’est pas l’horloge de l’ordinateur. microsecond est compris entre 0 et 999999.',
    'Microsecond-precision instant in the game’s UTC calendar, not the computer clock. microsecond is between 0 and 999999.',
  ],
  'native:nimby:class:Station': [
    'Gare jointe dans la même capture. Un nom absent ne signifie pas une gare inexistante. Son identifiant reste opaque.',
    'Station joined within the same snapshot. A missing name does not mean the station is absent. Its identifier remains opaque.',
  ],
  'native:nimby:class:TrainPosition': [
    'Sens +1 de A vers B, -1 de B vers A ; null si le sens est inconnu.',
    'Direction +1 from A to B, -1 from B to A; null when unknown.',
  ],
  'native:nimby:class:TrainAssignment': [
    'Affectation observée. Le nom de l’horaire et les heures futures ne sont pas déduits. orderIndex commence à zéro et reste null s’il est indisponible.',
    'Observed assignment. Timetable names and future times are not inferred. orderIndex starts at zero and remains null when unavailable.',
  ],
  'native:nimby:class:TrainServiceTimes': [
    'Échéances actives observées, pas nécessairement des horaires commerciaux. arrivalRemainingSeconds peut être négatif ; les temps restants de départ et de nouvelle tentative sont bornés à zéro. Aucun de ces compteurs n’est un retard prévisionnel. Les valeurs en microsecondes partent de l’origine de simulation, pas de 1970. Sans calendrier disponible, les dates restent null même si un compteur est connu.',
    'Observed active deadlines, not necessarily commercial timetable times. arrivalRemainingSeconds may be negative; departure and retry remaining times are clamped to zero. None of these counters is a predicted delay. Microsecond values start at the simulation origin, not 1970. Without an available calendar, dates remain null even when a counter is known.',
  ],
  'native:nimby:class:TrainService': [
    'Une propriété null est indisponible, pas libre ni égale à zéro. stopIndex est l’index de l’arrêt courant de la ligne, à partir de zéro.',
    'A null property is unavailable, not clear or zero. stopIndex is the zero-based index of the current line stop.',
  ],
  'native:nimby:class:Train': [
    'Vitesse mesurée en m/s ; une valeur de secours n’est pas présentée comme une mesure. passengers compte les occupants, pas la capacité du matériel.',
    'Measured speed in m/s; a fallback value is not presented as a measurement. passengers counts occupants, not material capacity.',
  ],
  'native:nimby:val:Train.predictedArrivalDelaySeconds': [
    'Estimation signée en secondes : une valeur négative indique une arrivée prévue en avance. Ce n’est ni l’âge d’une échéance, ni une priorité.',
    'Signed estimate in seconds: a negative value means arrival is predicted early. It is neither deadline age nor priority.',
  ],
  'native:nimby:class:TrainSnapshot': [
    'Copie conservable après le callback avec recherches indexées, sans nouvelle lecture implicite. capturedAtMillis est l’heure UTC de l’ordinateur ; ageMillis est l’âge monotone mesuré lors de la copie. La capture valide les enregistrements séparément sans arrêter la simulation. Obtenir cette valeur avec ToolContext.trains.',
    'Copy retained after the callback with indexed lookups and no implicit new read. capturedAtMillis is computer UTC time; ageMillis is the monotonic age measured when copying. Records are validated separately without stopping simulation. Obtain this value with ToolContext.trains.',
  ],
  'native:nimby:val:TrainSnapshot.lines': [
    'Toutes les lignes du catalogue, même sans train affecté. null signifie indisponible ou non demandé.',
    'All catalog lines, including those without assigned trains. null means unavailable or not requested.',
  ],
  'native:nimby:fun:TrainSnapshot.tagsForLine(LineId)': [
    'Tags déclarés par la ligne et ses parents. null si un élément est inconnu, si la chaîne boucle ou dépasse ses limites. Aucun choix de priorité n’est effectué.',
    'Tags declared by the line and its parents. null if an element is unknown, the chain cycles or its limits are exceeded. No priority decision is made.',
  ],
  'native:nimby:class:Stop': [
    'Un arrêt peut être un point de passage hors gare. Les offsets validés sont relatifs au plan de ligne ; les courses partielles et les boucles empêchent d’en déduire des dates absolues.',
    'A stop may be a waypoint outside a station. Validated offsets are relative to the line plan; partial runs and loops prevent inferring absolute dates.',
  ],
  'native:nimby:class:LinePlan': [
    'Plan complet de la ligne associée au train dans cette capture. Il peut contenir des arrêts hors de sa course partielle. Aucun horaire futur n’est déduit.',
    'Complete plan of the line associated with the train in this snapshot. It may contain stops outside its partial run. No future timetable is inferred.',
  ],
  'native:nimby:class:TrainQuery': [
    'Lecture groupée par besoins. Par défaut : service et localisation. Caractéristiques, horaires, tags, occupants, lignes et composition sont opt-in. Les horaires impliquent le service ; les tags impliquent le catalogue des lignes.',
    'Batch read by requirements. Defaults: service and locations. Characteristics, timetables, tags, occupants, lines and composition are opt-in. Timetables imply service; tags imply the line catalog.',
  ],
  'native:nimby:class:TrainId': [
    'Identifiants opaques typés pour éviter de confondre train, ligne, gare et voie. Ne pas décomposer leur valeur ni en déduire une catégorie.',
    'Opaque typed identifiers prevent confusing trains, lines, stations and tracks. Do not split their values or infer a category.',
  ],
  'native:nimby:class:TimetableShiftId': [
    'Cette clé n’est unique qu’à l’intérieur de son horaire.',
    'This key is unique only within its timetable.',
  ],
  'native:nimby:class:TagId': [
    'Identifiant du catalogue de tags, distinct d’un identifiant de train.',
    'Tag catalog identifier, distinct from a train identifier.',
  ],
  'native:nimby:class:LineType': [
    'Seule la distinction dépôt est disponible. Other ne signifie ni voyageurs, ni fret, ni autre catégorie commerciale.',
    'Only the depot distinction is available. Other means neither passenger nor freight nor another commercial category.',
  ],
  'native:nimby:class:Timetable': [
    'Horaire identifié par une affectation observée. Son nom n’est pas résolu : null ne signifie pas une chaîne vide. Aucun arrêt futur n’est déduit.',
    'Timetable identified by an observed assignment. Its name is unresolved: null does not mean an empty string. No future stop is inferred.',
  ],
  'native:nimby:class:Tag': [
    'Libellé observé de classement. Un tag ne confère aucune priorité.',
    'Observed classification label. A tag grants no priority.',
  ],
  'native:nimby:class:TrainCharacteristics': [
    'Caractéristiques du matériel, distinctes de la vitesse actuelle et de la limite de voie. Les profils configuré/acheté et actuel sont indépendants. Les valeurs indisponibles restent null, sans remplacement par l’autre profil.',
    'Material characteristics, distinct from current speed and track speed limits. Configured/purchased and current profiles are independent. Unavailable values remain null, without substitution from the other profile.',
  ],
  'native:nimby:class:VehicleModel': [
    'Modèle référencé par une composition observée. nameEnglish est le libellé du catalogue anglais, sans catégorie voyageurs/fret déduite.',
    'Model referenced by an observed composition. nameEnglish is the English catalog label, without an inferred passenger/freight category.',
  ],
  'jvm:fr.nimby.sdk:fun:Game.Trains.snapshot(TrainId?,TrainQuery)': [
    'Lecture groupée selon TrainQuery. Les données sont copiées ; choisir un train demande aussi le plan complet de sa ligne.',
    'Batch read according to TrainQuery. Data is copied; selecting a train also requests its complete line plan.',
  ],
  'jvm:fr.nimby.sdk:fun:Game.Clock.read()': [
    'Lit l’horloge sans parcourir la carte. Réutiliser snapshot.clock si une capture a déjà été réalisée.',
    'Reads the clock without scanning the map. Reuse snapshot.clock when a snapshot has already been captured.',
  ],
  'jvm:fr.nimby.sdk:fun:NimbyClient.readSimulationClock()': [
    'Lit une horloge fraîche sans décoder trains, géométrie ou images de signaux. Un ancien SDK peut utiliser sa capture complète comme repli.',
    'Reads a fresh clock without decoding trains, geometry or signal images. An older SDK may use its full snapshot as a fallback.',
  ],
  'jvm:fr.nimby.sdk:fun:NimbyClient.captureTrainData(Long?,TrainQuery)': [
    'Demande explicite de données de trains et de catalogues. Une capture ordinaire ne demande pas ces tables supplémentaires. Un ancien SDK laisse ces données indisponibles.',
    'Explicit train and catalog query. An ordinary snapshot does not request these additional tables. An older SDK leaves this data unavailable.',
  ],
  'jvm:fr.nimby.sdk:val:Service.state': [
    'null signifie indisponible. Unknown et Other sont des états observés distincts.',
    'null means unavailable. Unknown and Other are distinct observed states.',
  ],
  'jvm:fr.nimby.sdk:val:Service.hidden': [
    'La présence peut être connue indépendamment du service complet.',
    'Presence can be known independently of the complete service.',
  ],
  'jvm:fr.nimby.sdk:val:Service.observedAt': [
    'Date UTC du jeu, pas l’heure de l’ordinateur. Les microsecondes signées sont normalisées, y compris avant l’origine du calendrier.',
    'Game UTC date, not computer time. Signed microseconds are normalized, including before the calendar origin.',
  ],
  'jvm:fr.nimby.sdk:val:Service.dispatchRetry': [
    'Échéance de nouvelle tentative, pas un départ commercial ni un retard prévisionnel.',
    'Retry deadline, not a commercial departure or predicted delay.',
  ],
  'jvm:fr.nimby.sdk:class:LineStop': [
    'Offsets relatifs au plan de ligne. Les courses partielles et les boucles empêchent d’en déduire des dates absolues. Un point de passage hors gare a stationId=null.',
    'Offsets relative to the line plan. Partial runs and loops prevent inferring absolute dates. A waypoint outside a station has stationId=null.',
  ],
  'jvm:fr.nimby.sdk:val:Observation.trackMetrics': [
    'null si la lecture ne fournit pas ces métriques. Une ligne absente reste inconnue.',
    'null when the read does not provide these metrics. A missing row remains unknown.',
  ],
  'jvm:fr.nimby.sdk:val:Observation.lines': [
    'Disponible uniquement sur demande de données de trains. null signifie indisponible ou non demandé.',
    'Available only through an explicit train-data query. null means unavailable or not requested.',
  ],
  'jvm:fr.nimby.sdk:fun:Observation.train(Long)': [
    'Jointures indexées dans cette copie, sans nouvelle capture ni lecture du jeu.',
    'Indexed joins within this copy, without a new snapshot or game read.',
  ],
  'jvm:fr.nimby.sdk:fun:Observation.platform(Long)': [
    'Retrouve le quai observé pour une voie sans parcourir tous les quais.',
    'Finds the observed platform for a track without scanning all platforms.',
  ],
  'jvm:fr.nimby.sdk:fun:Observation.tagsForLine(LineId)': [
    'Inclut les tags déclarés par chaque parent. null si une donnée manque, si la chaîne boucle, dépasse 256 niveaux ou 65536 tags distincts.',
    'Includes tags declared by each parent. null if data is missing, the chain cycles, exceeds 256 levels or 65536 distinct tags.',
  ],
  'jvm:fr.nimby.sdk:class:TrackMetric': [
    'Longueur longitudinale observée, en mètres. Convertit localement entre mètres et fraction (0 au début, 1 à la fin). Une métrique absente ne se déduit pas du dessin et ne suffit pas à autoriser une pose.',
    'Observed longitudinal length in metres. Converts locally between metres and fractions (0 at the start, 1 at the end). Missing metrics cannot be inferred from the drawing and do not authorize construction.',
  ],
  'jvm:fr.nimby.sdk:fun:TrackMetric.offsetM(Double)': [
    'Distance depuis le début de la voie ; fraction doit appartenir à [0,1].',
    'Distance from the start of the track; fraction must lie in [0,1].',
  ],
  'jvm:fr.nimby.sdk:fun:TrackMetric.fraction(Double)': [
    'Fraction correspondant à une distance dans [0,lengthM], sans inversion du sens.',
    'Fraction corresponding to a distance in [0,lengthM], without reversing direction.',
  ],
  'jvm:fr.nimby.sdk:fun:TrackMetric.distanceM(Double,Double)': [
    'Distance positive entre deux positions sur la même voie.',
    'Positive distance between two positions on the same track.',
  ],
  'jvm:fr.nimby.sdk:class:TrainRecord': [
    'Les jointures conservent séparément chaque donnée inconnue. Une gare non résolue ne prouve pas que le train est hors gare : consulter ses identifiants observés.',
    'Joins preserve each unknown field independently. An unresolved station does not prove that a train is outside stations: consult its observed identifiers.',
  ],
  'jvm:fr.nimby.sdk:class:TrainQuery': [
    'Lecture groupée par besoins. Service et localisation sont activés par défaut ; caractéristiques, horaires, tags, occupants, lignes et composition sont opt-in. Les horaires incluent le service et les tags incluent les lignes.',
    'Batch read by requirements. Service and locations are enabled by default; characteristics, timetables, tags, occupants, lines and composition are opt-in. Timetables include service and tags include lines.',
  ],
  'jvm:fr.nimby.sdk:class:TrainId': [
    'Identifiants opaques typés. Aucune catégorie de train ne doit être déduite de leur valeur.',
    'Opaque typed identifiers. No train category may be inferred from their values.',
  ],
  'jvm:fr.nimby.sdk:class:TimetableShiftId': [
    'Clé de service dont l’identité dépend aussi de l’horaire.',
    'Shift key whose identity also depends on its timetable.',
  ],
  'jvm:fr.nimby.sdk:class:Timetable': [
    'Seule l’identité de l’horaire est disponible ; aucun nom ni heure future n’est inventé.',
    'Only timetable identity is available; no name or future time is manufactured.',
  ],
  'jvm:fr.nimby.sdk:val:TrainMetadata.predictedArrivalDelaySeconds': [
    'Estimation signée en secondes, négative si l’arrivée est prévue en avance. Ce n’est pas l’âge d’une échéance.',
    'Signed estimate in seconds, negative when arrival is predicted early. It is not deadline age.',
  ],
  'jvm:fr.nimby.sdk:typealias:Stop': [
    'Les heures d’arrêt restent des offsets relatifs au plan de ligne.',
    'Stop times remain offsets relative to the line plan.',
  ],
  'jvm:fr.nimby.sdk:class:TrainCharacteristics': [
    'Limites du matériel, distinctes de la vitesse actuelle et de la limite de voie. Les profils configuré et actuel restent indépendants, sans remplacement des données manquantes.',
    'Material limits, distinct from current speed and track speed limits. Configured and current profiles remain independent, without filling missing data from one another.',
  ],
  'jvm:fr.nimby.sdk:class:VehicleModel': [
    'Seulement les modèles référencés. Les noms sont les libellés anglais du catalogue ; aucune catégorie voyageurs/fret n’est déduite. Les valeurs absentes restent null.',
    'Only referenced models. Names are English catalog labels; no passenger/freight category is inferred. Missing values remain null.',
  ],
}
