import snapshot from './generated/api.json'
import { reviewedApiContracts } from './api-contracts'
import { callableShape, type CallableShape } from './api-callable-shape'

type Translation = readonly [string, string]
type Arguments = Record<string, Translation>
interface CallableContract {
  shape: CallableShape
  arguments: Arguments
  result: Translation
  failures?: Translation
}
export const reviewedCallableContracts: Record<string, CallableContract> = {}
const n = 'native:nimby:'
const j = 'jvm:fr.nimby.sdk:'
const symbols = snapshot.files.flatMap((file) => file.symbols)
const pair = (fr: string, en: string): Translation => [fr, en]
const unit = pair(
  'Aucune valeur à conserver (Unit). Les effets et refus de l’appel sont décrits ci-dessus.',
  'No value to retain (Unit). The call’s effects and refusals are described above.',
)
const copied = pair(
  'Copie utilisable après le callback ou la fermeture de la connexion ; aucune mise à jour automatique.',
  'Copy usable after the callback or connection closes; it does not update automatically.',
)
const localNullable = pair(
  'Valeur trouvée dans cette copie, ou null selon les cas indiqués ci-dessus. Ce résultat ne déclenche aucune lecture du jeu.',
  'Value found in this copy, or null in the cases described above. This result triggers no game read.',
)
const opaque = pair(
  'Identifiant observé de l’objet indiqué, dans cette même partie. Conserver sa valeur entière ; ne pas fabriquer un numéro ni réutiliser un identifiant d’une autre partie.',
  'Observed identity of the named object in the same game. Preserve the complete value; do not invent a number or reuse an identity from another game.',
)
const signal = pair(
  'Identifiant du signal observé dans cette partie ; distinct de l’identifiant du modèle et de celui de sa voie.',
  'Observed signal identity in this game; distinct from its model identity and its track identity.',
)
const train = pair(
  'Identifiant du train observé dans cette partie. Utiliser l’objet TrainId lorsque cette surcharge le demande.',
  'Observed train identity in this game. Use a TrainId object when this overload requires it.',
)
const query = pair(
  'Groupes de données à demander pour tous les trains. Le défaut demande service et localisation ; les autres groupes sont désactivés. Une option false n’efface pas les données d’une copie couvrant déjà davantage de groupes.',
  'Data groups to request for all trains. The default requests service and location; other groups are disabled. A false option does not erase data from a copy already covering more groups.',
)
const selected = pair(
  'Train dont le plan de ligne est aussi demandé ; une capture réseau complète demande également son chemin. null omet ces lectures ciblées ; ce choix ne filtre pas la liste de trains.',
  'Train whose line plan is also requested; a full network capture also requests its path. null omits these targeted reads; this choice does not filter the train list.',
)
const ticket = pair(
  'Ticket non nul obtenu par prepareConstruction/prepare dans la même session. Conserver le même ticket pour suivre Pending ; ne jamais répéter la création après une réponse incertaine.',
  'Nonzero ticket obtained from prepareConstruction/prepare in the same session. Keep that ticket to follow Pending; never repeat creation after an uncertain response.',
)
const constructionPositions = pair(
  'De 1 à 64 positions distinctes par couple (voie, fraction). Chaque voie provient de la capture ; fraction finie strictement entre 0 et 1, direction native -1 ou +1. Confirmer un plan vérifié sur une nouvelle capture avant l’appel.',
  '1 to 64 positions distinct by (track, fraction). Each track comes from the snapshot; finite fraction strictly between 0 and 1, native direction -1 or +1. Confirm a plan checked against a fresh snapshot before calling.',
)
const request = pair(
  'Événement fourni par le SDK pour cette partie et cette génération. Conserver les identifiants et jetons d’origine ; ne pas inventer ni recycler une requête d’une autre session.',
  'Event supplied by the SDK for this game and generation. Preserve its original identities and tokens; do not fabricate or recycle a request from another session.',
)
const context = pair(
  'Contexte du callback courant, fourni par le SDK. Lire ou agir pendant ce callback seulement ; conserver les copies et tickets, jamais le contexte pour plus tard.',
  'Current callback context supplied by the SDK. Read or act only during this callback; retain copies and tickets, never the context for later use.',
)
const callback = pair(
  'Fonction déclarée par le mod et appelée par le SDK selon le contrat ci-dessus. Ses arguments et son retour figurent dans le type Kotlin ; ne pas bloquer ni accéder au jeu pendant la déclaration du mod.',
  'Function declared by the mod and invoked by the SDK according to the contract above. Its arguments and result are in the Kotlin type; do not block or access the game while declaring the mod.',
)
const declaration = pair(
  'Bloc de configuration exécuté pour assembler les déclarations. Il ne reçoit pas de partie ouverte : aucun accès au jeu, ni écriture de fichier pendant l’assemblage.',
  'Configuration block executed to assemble declarations. It receives no open game: no game access or file writes while assembling.',
)
const metadata = {
  author: pair(
    'Nom de l’auteur, métadonnée affichée ; ce n’est pas un identifiant de mod.',
    'Displayed author name; this metadata is not a mod identifier.',
  ),
  description: pair(
    'Présentation du mod affichée en jeu ; accepte tr(...). Ne modifie pas les métadonnées de distribution du Hub ou de Steam.',
    'Mod description displayed in-game; accepts tr(...). Does not change Hub or Steam distribution metadata.',
  ),
  name: pair(
    'Nom affiché facultatif ; null conserve le nom du paquet. Accepte tr(...) sans changer son identifiant ni sa version.',
    'Optional display name; null keeps the package name. Accepts tr(...) without changing identity or version.',
  ),
}
const option = pair(
  'Objet de réglage déclaré pour ce modèle. Garder cette même instance ; ne pas remplacer son identifiant stable par son libellé traduit.',
  'Setting object declared for this model. Retain that same instance; do not replace its stable identity with its translated label.',
)
const model = pair(
  'Modèle déclaré avec ses propres enums d’aspect et de raison. Une conversion d’un autre modèle renvoie null ; aucun numéro d’aspect commun n’est supposé.',
  'Declared model with its own aspect and reason enums. Converting a different model returns null; no shared aspect number is assumed.',
)
const settings = pair(
  'Réglages effectifs ou enregistrés fournis pour ce signal, selon le callback. Respecter leurs noms stables et les défauts déclarés ; ne pas modifier la map reçue en place.',
  'Effective or saved settings supplied for this signal, according to the callback. Respect stable names and declared defaults; do not mutate the received map in place.',
)
const observedSignal = pair(
  'Signal et observation copiés pour ce calcul, avec ses réglages effectifs. Ne pas relire la carte ni modifier l’identité ou la topologie dans cette fonction.',
  'Signal and observation copied for this calculation with effective settings. Do not reread the map or change identity or topology inside this function.',
)
const decision = pair(
  'Décision d’aspect et de raison produite par ce mod ; ses codes appartiennent à ce modèle, pas à une table universelle.',
  'Aspect and reason decision produced by this mod; its codes belong to this model, not a universal table.',
)
const type = pair(
  'Identifiant stable du SignalType déclaré dans ce mod ; distinct de son titre affiché et de l’identité d’un signal construit.',
  'Stable identity of a SignalType declared in this mod; distinct from its display title and from a built signal identity.',
)
const speed = pair(
  'Vitesse en mètres par seconde, finie et positive ou nulle. Pour convertir des km/h, diviser par 3,6 ; les conditions supplémentaires de cet appel restent applicables.',
  'Finite nonnegative speed in metres per second. Divide km/h by 3.6 to convert; this call’s additional conditions still apply.',
)
const recalculation = pair(
  'false décale les dates en conservant les positions ; true demande le recalcul natif, qui peut déplacer des trains et coûte davantage. Ne pas rejouer la commande après une réponse incertaine.',
  'false shifts dates while preserving positions; true requests native recalculation, which may move trains and costs more. Do not replay the command after an uncertain response.',
)
const lease = pair(
  'Durée du bail en millisecondes, de 1000 à 60000 inclus. Aucun renouvellement automatique : renouveler explicitement avant expiration et fermer la session après usage.',
  'Lease duration in milliseconds, from 1000 to 60000 inclusive. No automatic renewal: renew explicitly before expiry and close the session after use.',
)
const controlResult = pair(
  'État et compteurs du bail après la requête. Un forçage demandé ne prouve pas qu’une décision a déjà été évaluée ou affichée ; lire l’état et les observations pour le vérifier.',
  'Lease state and counts after the request. A requested override does not prove a decision has already been evaluated or displayed; read state and observations to verify it.',
)
const constructionResult = pair(
  'État du ticket, identifiants créés et possibilité d’annulation. Rejected/Partial/Pending restent des résultats : inspecter state, reason et canUndo, et suivre le même ticket.',
  'Ticket state, created identities and undo availability. Rejected/Partial/Pending remain results: inspect state, reason and canUndo, and follow the same ticket.',
)
function methods(scope: string, names: string[], args: Arguments, result?: Translation) {
  for (const name of names) {
    const matches = symbols.filter(
      (symbol) => symbol.kind === 'fun' && symbol.id.startsWith(scope + 'fun:' + name + '('),
    )
    if (!matches.length) throw new Error(`Reviewed callable no longer exists: ${scope}${name}`)
    for (const symbol of matches) {
      const shape = callableShape(symbol)!
      const own: Arguments = {}
      for (const parameter of shape.parameters) {
        const description = args[parameter.name]
        if (!description)
          throw new Error(`Public parameter needs review: ${symbol.id} / ${parameter.name}`)
        own[parameter.name] = description
      }
      if (reviewedCallableContracts[symbol.id])
        throw new Error(`Duplicate callable review: ${symbol.id}`)
      reviewedCallableContracts[symbol.id] = {
        shape,
        arguments: own,
        result: result || (shape.returnType === 'Unit' ? unit : reviewedApiContracts[symbol.id]!),
      }
    }
  }
}

// Function groups are listed explicitly. A newly exposed function cannot silently
// inherit a description based on its parameter name or runtime alone.
methods(
  n,
  ['AutomaticDriving.clear', 'AutomaticDriving.stop'],
  {},
  pair(
    'Consigne de conduite à retourner depuis driving/drivingRule. La création de cet objet ne change ni un signal ni un train à elle seule.',
    'Driving rule to return from driving/drivingRule. Creating this object alone changes neither a signal nor a train.',
  ),
)
methods(n, ['AutomaticDriving.announceStop'], {
  signalsAhead: pair(
    'Cible à 1 ou 2 signaux en aval. Ce nombre ne mesure ni des mètres ni une distance de freinage.',
    'Target 1 or 2 signals ahead. This count measures neither metres nor braking distance.',
  ),
  passageSpeedMps: speed,
  passableHere: pair(
    'Autorisation de franchir le signal courant, distincte de la permission de la cible annoncée.',
    'Permission to pass the current signal, separate from permission at the announced target.',
  ),
  followTargetSpeed: pair(
    'true autorise le suivi de la vitesse numérique visible de la cible ; false conserve la politique déclarée sans ce suivi.',
    'true permits following the target’s visible numeric speed; false keeps the declared policy without that tracking.',
  ),
  cancelAtNextClear: pair(
    'Annulation au prochain Clear choisi par le mod ; true exige followTargetSpeed=true et signalsAhead=2.',
    'Cancellation at the next Clear as chosen by the mod; true requires followTargetSpeed=true and signalsAhead=2.',
  ),
})
methods(n, ['AutomaticDriving.limitAtSignal', 'AutomaticDriving.limitUntilClearThenRear'], {
  speedMps: speed,
  signalsAhead: pair(
    '0 : signal courant ; 1 ou 2 : cible en aval. La restriction est conservée jusqu’au dégagement par la queue d’un Clear franchi.',
    '0: current signal; 1 or 2: target ahead. The restriction is retained until the rear clears a passed Clear signal.',
  ),
  passableHere: pair(
    'Permission de franchir le signal courant. Ne libère pas les autres restrictions ; exige une vitesse strictement positive.',
    'Permission to pass the current signal. Does not release other restrictions; requires a strictly positive speed.',
  ),
})
methods(n, ['AutomaticDriving.restrictedUntilNextSignal'], {
  entrySpeedMps: pair(
    'Vitesse d’entrée en m/s, finie, entre 0 et maximumSpeedMps. Doit être 0 lorsque stopFirst=true.',
    'Finite entry speed in m/s, between 0 and maximumSpeedMps. Must be 0 when stopFirst=true.',
  ),
  maximumSpeedMps: pair(
    'Plafond de marche en m/s, fini et strictement positif, choisi explicitement par le mod.',
    'Finite strictly positive movement ceiling in m/s, explicitly chosen by the mod.',
  ),
  stopFirst: pair(
    'true exige une preuve d’arrêt avant l’entrée ; false n’ajoute pas cette condition. Les obstacles et conflits natifs restent contrôlés.',
    'true requires proof of a stop before entry; false does not add that condition. Native obstacles and conflicts remain checked.',
  ),
})
methods(n, ['readTextFile'], {
  path: pair(
    'Chemin du fichier local, résolu depuis le répertoire de travail. Le helper ne résout pas automatiquement un chemin de ressource du paquet.',
    'Local file path resolved from the working directory. This helper does not automatically resolve a package resource path.',
  ),
})
methods(
  n,
  [
    'GameDateTime.toUtcSeconds',
    'GameDateTime.toString',
    'ToolClock.dateTime',
    'GameInstant.dateTime',
  ],
  {},
)
methods(n, ['GameDateTime.Companion.fromUtcSeconds'], {
  seconds: pair(
    'Secondes signées depuis le 1er janvier 1970 UTC, pour une date comprise entre les années 1 et 9999. Ne pas passer des ticks ou des microsecondes.',
    'Signed seconds since 1 January 1970 UTC, for a date between years 1 and 9999. Do not pass ticks or microseconds.',
  ),
})
methods(n, ['signalMod', 'toolMod', 'signalModel'], {
  id: pair(
    'Identifiant technique stable du mod ou du modèle déclaré. Pour le mod complet, préférer modInfo généré depuis mod.json.',
    'Stable technical identity of the declared mod or model. For a complete mod, prefer modInfo generated from mod.json.',
  ),
  title: pair(
    'Nom affiché de ce mod ou modèle ; accepte tr(...). Le titre ne remplace pas son identifiant stable.',
    'Display name of this mod or model; accepts tr(...). The title does not replace its stable identity.',
  ),
  info: pair(
    'Identité du paquet générée sous nimby.mod.modInfo depuis mod.json. Évite de recopier son id et son nom.',
    'Package identity generated as nimby.mod.modInfo from mod.json. Avoids copying its id and name.',
  ),
  textures: pair(
    'Identifiant du jeu de textures déclaré pour ce modèle, utilisé par la génération du catalogue. Les chemins retournés par les images doivent appartenir à son catalogue.',
    'Texture-set identity declared for this model and used to generate its catalogue. Paths returned by image functions must belong to that catalogue.',
  ),
  type: pair(
    'SignalType complet à associer à ce modèle ; conserve son identifiant et ses réglages déclarés.',
    'Complete SignalType to associate with this model; retains its identity and declared settings.',
  ),
  fallback: pair(
    'Indication explicite pour une observation ou un calcul indisponible. Choisir un aspect prudent propre au modèle ; aucune couleur sûre n’est inventée par le SDK.',
    'Explicit indication for an unavailable observation or calculation. Choose a conservative aspect belonging to the model; the SDK invents no safe colour.',
  ),
  invalidNetwork: pair(
    'Indication appliquée lorsque le réseau fourni est invalide. Si omise, utilise fallback ; ce n’est pas une observation de voie libre.',
    'Indication used when the supplied network is invalid. Uses fallback when omitted; it is not an observation of clear track.',
  ),
  block: declaration,
})
methods(
  n,
  [
    'GameMod.onWindowEvent',
    'GameMod.onSignalAction',
    'GameMod.onTick',
    'ToolMod.onWindowEvent',
    'ToolMod.onSignalAction',
    'ToolMod.onTick',
  ],
  { request, context },
)
methods(n, ['GameMod.onStop', 'ToolMod.onStop'], {})
methods(n, ['ToolModBuilder.options', 'SignalModBuilder.options', 'SignalModelsBuilder.options'], {
  values: pair(
    'Une ou plusieurs instances de ModOption, avec identifiants distincts. Jusqu’à 64 au total, raccourcis de fenêtres inclus ; plusieurs appels ajoutent des options.',
    'One or more ModOption instances with distinct identities. Up to 64 total including window shortcuts; multiple calls append options.',
  ),
})
methods(n, ['ToolModBuilder.trainEditor'], { block: declaration })
methods(n, ['ToolModBuilder.metadata', 'SignalModelsBuilder.metadata'], metadata)
methods(n, ['ToolModBuilder.window'], {
  id: pair(
    'Identifiant stable de fenêtre, unique dans le mod ; le SDK en déduit la préférence window.<id>.',
    'Stable window identity unique within the mod; the SDK derives the window.<id> preference from it.',
  ),
  title: pair(
    'Titre de fenêtre affiché au joueur, accepte tr(...).',
    'Window title displayed to the player; accepts tr(...).',
  ),
  shortcut: pair(
    'Raccourci proposé par défaut, par exemple F8 ou Ctrl+F8. Le joueur peut le changer dans Options → NRF Hub ; le SDK signale les conflits reconnus.',
    'Suggested default shortcut, for example F8 or Ctrl+F8. The player can change it in Options → NRF Hub; the SDK reports recognised conflicts.',
  ),
  handler: callback,
})
methods(n, ['ToolModBuilder.service'], {
  id: pair(
    'Nom stable du service, identique à la valeur service de l’action qui l’appelle.',
    'Stable service name, identical to the service value of the action calling it.',
  ),
  handler: callback,
})
methods(n, ['ToolModBuilder.onTick', 'ToolModBuilder.onStop'], { block: callback })
methods(n, ['NumberSetting.read', 'NumberSetting.withValue'], {
  settings,
  value: pair(
    'Nouvel entier dans 0..maximum inclus. Retourne une map distincte ; ne modifie pas les réglages d’un signal en jeu à elle seule.',
    'New integer in 0..maximum inclusive. Returns a separate map; by itself it does not change a signal’s in-game settings.',
  ),
})
methods(n, ['SignalAnimation.frameAt'], {
  simulationMs: pair(
    'Temps simulé en millisecondes. Utiliser l’horloge du jeu, pas l’heure de l’ordinateur, pour que pause et accélération suivent la partie.',
    'Simulation time in milliseconds. Use the game clock rather than computer time so pause and speed changes follow the game.',
  ),
})
methods(n, ['steady', 'blink'], {
  path: pair(
    'Chemin relatif d’une image déclarée dans le catalogue de ce modèle.',
    'Relative path of an image declared in this model’s catalogue.',
  ),
  on: pair(
    'Image de la première demi-période, déclarée dans le catalogue.',
    'Image for the first half-period, declared in the catalogue.',
  ),
  off: pair(
    'Image de la seconde demi-période, déclarée dans le même catalogue.',
    'Image for the second half-period, declared in the same catalogue.',
  ),
  everyMs: pair(
    'Durée d’une demi-période entre 100 et 10000 millisecondes simulées inclus. Un cycle complet dure deux fois cette valeur ; 500 donne 500 ms pour chaque image.',
    'Half-period between 100 and 10000 simulation milliseconds inclusive. A full cycle lasts twice this value; 500 gives 500 ms for each image.',
  ),
})
methods(n, ['SignalIndication.of', 'SignalNeighbour.of'], { model }, localNullable)
methods(n, ['SignalContext.enabled', 'SignalRuleContext.enabled', 'SignalModelBuilder.number'], {
  option,
})
methods(n, ['SignalDefinition.observeApproach', 'SignalModelBuilder.observeApproach'], {
  blocks: pair(
    'Nombre de cantons en amont à observer : de 1 à 16 inclus. Ce n’est pas une distance en mètres ni un nombre de signaux à placer.',
    'Number of upstream blocks to observe: 1 through 16 inclusive. This is neither a distance in metres nor a number of signals to place.',
  ),
})
for (const name of ['checkbox', 'action'])
  methods(
    n,
    ['SignalDefinition.' + name, 'SignalModelBuilder.' + name],
    name === 'checkbox'
      ? {
          name: pair(
            'Nom stable du réglage, distinct du libellé traduit et des autres réglages du modèle.',
            'Stable setting name, separate from its translated label and the model’s other settings.',
          ),
          label: pair(
            'Texte visible du réglage, accepte tr(...).',
            'Setting display text; accepts tr(...).',
          ),
          description: pair(
            'Aide visible du réglage ; chaîne vide pour aucune aide, accepte tr(...).',
            'Setting help text; empty string for no help, accepts tr(...).',
          ),
          defaultValue: pair(
            'Valeur à utiliser sans choix enregistré compatible. Le calcul doit lire les réglages effectifs du signal.',
            'Value used when no compatible choice is saved. Calculations must read the signal’s effective settings.',
          ),
          onlyWhenEnabled: pair(
            'true masque cette option dans la présentation lorsqu’elle est désactivée ; ce n’est pas une dépendance entre réglages.',
            'true hides this option in the presentation when disabled; it is not a dependency between settings.',
          ),
        }
      : {
          id: pair(
            'Identifiant stable de l’action, transmis au service dans request.action.',
            'Stable action identity passed to the service as request.action.',
          ),
          label: pair('Texte du bouton, accepte tr(...).', 'Button text; accepts tr(...).'),
          whenMod: pair(
            'Identifiant technique du mod fournissant le service ; l’action est proposée lorsque ce mod est disponible.',
            'Technical identity of the mod providing the service; the action is offered when that mod is available.',
          ),
          service: pair(
            'Nom exact du service enregistré dans le mod cible avec service(...).',
            'Exact name of the service registered through service(...) in the target mod.',
          ),
        },
  )
const signalCallbacks: Arguments = {
  rules: pair(
    'Règle appelée avec SignalRuleContext/SignalContext en receiver. Retourner une indication de ce modèle ; null demande de résoudre le signal suivant avant un nouvel appel. Un lien absent ou cyclique utilise le repli invalidNetwork. Consulter les observations copiées sans accès direct au jeu.',
    'Rule called with SignalRuleContext/SignalContext as receiver. Return an indication of this model; null requests resolution of the next signal before another call. An absent or cyclic link uses invalidNetwork. Inspect copied observations without direct game access.',
  ),
  evaluate: pair(
    'Calcul isolé de diagnostic recevant les réglages et l’Observation. La surcharge à trois arguments reçoit aussi Observation.next décodé comme ordinal valide des aspects de ce modèle. Retourner une Indication non nulle ; en réseau utiliser rules et son voisin typé.',
    'Isolated diagnostic calculation receiving settings and Observation. The three-argument overload also receives Observation.next decoded as a valid ordinal of this model’s aspects. Return a nonnull Indication; in a network use rules and its typed neighbour.',
  ),
  migrateSettings: pair(
    'Transformation des anciens réglages enregistrés vers les noms et valeurs actuels. Retourner une nouvelle map compatible ; conserver les choix encore valides du joueur.',
    'Transform old saved settings into current names and values. Return a compatible map; preserve the player’s still-valid choices.',
  ),
  prepareObservation: pair(
    'Transformation du Signal copié avant le calcul. Retourner son observation préparée en conservant son identité, son type et sa topologie ; aucune mutation directe du jeu.',
    'Transform the copied Signal before calculation. Return its prepared observation while retaining identity, type and topology; no direct game mutation.',
  ),
  allowForcedAspect: pair(
    'Fonction recevant un aspect de ce modèle demandé par la recette. Retourner l’indication acceptée, ou null pour refuser le forçage ; le mod choisit sa raison.',
    'Function receiving an aspect of this model requested by test control. Return the accepted indication, or null to reject the override; the mod chooses its reason.',
  ),
  images: pair(
    'Fonction recevant l’Indication et renvoyant le chemin d’une image fixe déclarée dans construction(states). Aucun aspect logique ne se déduit de ce chemin.',
    'Function receiving Indication and returning a steady image path declared in construction(states). No logical aspect is inferred from this path.',
  ),
  animatedImages: pair(
    'Fonction recevant l’Indication, le temps simulé en millisecondes puis la demi-période en millisecondes. Retourner le chemin déclaré de l’image à cet instant ; préférer appearance avec steady/blink pour de nouvelles animations.',
    'Function receiving Indication, simulation time in milliseconds, then half-period in milliseconds. Return the declared image path at that time; prefer appearance with steady/blink for new animations.',
  ),
  appearance: pair(
    'Fonction recevant l’Indication et retournant steady(path) ou blink(on,off,everyMs). Déclarer toutes les images dans construction(states) ; le SDK suit le temps simulé.',
    'Function receiving Indication and returning steady(path) or blink(on,off,everyMs). Declare every image in construction(states); the SDK follows simulation time.',
  ),
  driving: pair(
    'Fonction recevant l’Indication et retournant une DrivingRule, ou null pour aucune consigne supplémentaire de ce mod. Utiliser AutomaticDriving et des vitesses explicites en m/s.',
    'Function receiving Indication and returning a DrivingRule, or null for no additional rule from this mod. Use AutomaticDriving with explicit speeds in m/s.',
  ),
  faults: pair(
    'Fonction recevant l’Indication et retournant true pour une défaillance propre au modèle. Ce booléen décrit une décision, pas un diagnostic complet de l’état du SDK.',
    'Function receiving Indication and returning true for a model-specific fault. This Boolean describes a decision, not a complete SDK health diagnostic.',
  ),
  activeWhen: pair(
    'Fonction recevant l’Indication et indiquant si le modèle est actif pour cette décision. false ne décharge pas le mod et ne désactive pas les autres modèles.',
    'Function receiving Indication and indicating whether the model is active for this decision. false does not unload the mod or disable other models.',
  ),
  aspectNames: pair(
    'Fonction recevant un enum d’aspect et retournant son nom lisible, éventuellement tr(...). Conserver les identités et enums indépendants du libellé.',
    'Function receiving an aspect enum and returning its readable name, optionally tr(...). Keep identities and enums independent of display text.',
  ),
  reasonNames: pair(
    'Fonction recevant un enum de raison et retournant son explication lisible, éventuellement tr(...). La raison explique le choix d’aspect du mod.',
    'Function receiving a reason enum and returning its readable explanation, optionally tr(...). The reason explains the mod’s aspect choice.',
  ),
  drivingPlan: pair(
    'Calcul recevant Vehicle, DrivingSettings, DrivingInput et List<Constraint>. Distances en mètres, vitesses en m/s, masses en kg ; retourner DrivingPlan avec available=false si les preuves nécessaires manquent.',
    'Calculation receiving Vehicle, DrivingSettings, DrivingInput and List<Constraint>. Distances in metres, speeds in m/s, masses in kg; return DrivingPlan with available=false when required evidence is missing.',
  ),
}
for (const owner of ['SignalDefinition', 'SignalModelBuilder', 'SignalModBuilder']) {
  for (const [name, description] of Object.entries(signalCallbacks)) {
    if (symbols.some((symbol) => symbol.id.startsWith(n + 'fun:' + owner + '.' + name + '(')))
      methods(n, [owner + '.' + name], { block: description })
  }
}
methods(n, ['SignalModBuilder.signal'], {
  id: type,
  title: pair(
    'Nom affiché du type de signal, accepte tr(...).',
    'Signal type display name; accepts tr(...).',
  ),
  textures: pair(
    'Identifiant du jeu de textures déclaré pour ce type.',
    'Texture-set identity declared for this type.',
  ),
  type: pair(
    'Déclaration complète du SignalType, avec ses réglages et ressources.',
    'Complete SignalType declaration with settings and resources.',
  ),
  block: declaration,
})
methods(n, ['SignalModelsBuilder.signal'], {
  model: pair(
    'Modèle complet à enregistrer. Son identifiant doit être unique dans le mod ; chaque modèle conserve ses propres enums.',
    'Complete model to register. Its identity must be unique within the mod; each model retains its own enums.',
  ),
})
methods(n, ['SignalModelsBuilder.prepareNetwork', 'SignalModelsBuilder.drivingPlan'], {
  block: callback,
})
methods(
  n,
  ['SignalModelBuilder.construction'],
  Object.fromEntries(
    ['states', 'name', 'kind', 'catalogueName', 'nameKey', 'catalogueNameKey', 'size', 'left'].map(
      (name) => [name, reviewedApiContracts[n + 'val:SignalConstruction.' + name]!],
    ),
  ) as Arguments,
)
methods(n, ['validateSignalTypes'], {
  types: pair(
    'Déclarations des types du mod à vérifier : identifiants, réglages, actions et ressources. Une collection invalide lève une exception ; aucune modification du jeu.',
    'Mod type declarations to validate: identities, settings, actions and resources. An invalid collection throws; no game change occurs.',
  ),
})
methods(
  n,
  [
    'SignallingMod.prepareNetwork',
    'SignallingMod.prepareObservedNetwork',
    'SignallingMod.evaluateNetwork',
  ],
  {
    signals: pair(
      'Liste copiée des signaux du réseau, jusqu’à 4096. Conserver le nombre, l’ordre, les identités, la topologie et les observations ; seules les valeurs effectives de réglages peuvent être préparées.',
      'Copied network signal list, up to 4096. Preserve count, order, identities, topology and observations; only effective setting values may be prepared.',
    ),
    input: pair(
      'Réseau observé à valider avant préparation/évaluation. Les décisions restent dans le même ordre que les signaux.',
      'Observed network to validate before preparation/evaluation. Decisions remain in the same order as signals.',
    ),
  },
)
methods(n, ['SignallingMod.migrateSettings'], { type, saved: settings })
methods(n, ['SignallingMod.unknownDecision', 'SignallingMod.invalidNetworkDecision'], { type })
methods(n, ['SignallingMod.evaluate'], {
  type,
  settings,
  observation: pair(
    'Observation copiée de ce signal ; Unknown et fresh=false ne prouvent pas une voie libre.',
    'Copied observation of this signal; Unknown and fresh=false do not prove clear track.',
  ),
})
methods(n, ['SignallingMod.decide'], {
  signal: observedSignal,
  next: pair(
    'Décision connue du signal suivant, ou null si indisponible. null n’équivaut pas à un aspect libre.',
    'Known next-signal decision, or null when unavailable. null is not equivalent to a clear aspect.',
  ),
})
methods(n, ['SignallingMod.fromLive'], { signal: observedSignal })
methods(
  n,
  [
    'SignallingMod.indication',
    'SignallingMod.animation',
    'SignallingMod.drivingRule',
    'SignallingMod.isFault',
    'SignallingMod.isActive',
  ],
  { decision },
)
methods(n, ['SignallingMod.texture'], {
  decision,
  simulationMs: pair(
    'Temps simulé en millisecondes fourni au calcul d’image ; ne pas substituer l’horloge murale.',
    'Simulation time in milliseconds supplied to image calculation; do not substitute wall-clock time.',
  ),
  halfPeriodMs: pair(
    'Demi-période d’animation en millisecondes simulées fournie à cette fonction.',
    'Animation half-period in simulation milliseconds supplied to this function.',
  ),
})
methods(
  n,
  ['SignallingMod.forcedDecision', 'SignallingMod.aspectName', 'SignallingMod.reasonName'],
  {
    type,
    aspect: pair(
      'Code d’aspect propre au mod ; vérifier qu’il appartient au modèle demandé. Un code non reconnu ne devient pas un aspect libre.',
      'Mod-specific aspect code; check that it belongs to the requested model. An unrecognised code does not become a clear aspect.',
    ),
    reason: pair(
      'Code de raison propre à ce mod, à convertir en texte selon son catalogue de raisons.',
      'Mod-specific reason code to convert into text according to its reason catalogue.',
    ),
  },
)
methods(n, ['SignallingMod.plan'], {
  vehicle: pair(
    'Profil de conduite du matériel en unités SI, distinct de TrainVehicle. Utiliser les mesures disponibles, pas des zéros pour des données inconnues.',
    'Material driving profile in SI units, separate from TrainVehicle. Use available measurements, not zeros for unknown data.',
  ),
  settings: pair(
    'Réglages du calcul : utilisation du frein, temps de réponse en secondes et marge en mètres.',
    'Calculation settings: brake usage, response time in seconds and margin in metres.',
  ),
  input: pair(
    'Position de tête en mètres, vitesses en m/s et preuves de fraîcheur/itinéraire/espace libre du calcul courant.',
    'Head position in metres, speeds in m/s and freshness/route/clear-space evidence for the current calculation.',
  ),
  constraints: pair(
    'Contraintes de distance en mètres et de vitesse en m/s à combiner pour ce calcul ; releaseByRear distingue le dégagement par la queue.',
    'Distance constraints in metres and speed constraints in m/s to combine for this calculation; releaseByRear distinguishes rear clearance.',
  ),
})
methods(n, ['ToolSignal.placementAt'], {
  trackId: opaque,
  fraction: pair(
    'Fraction finie strictement entre 0 et 1 sur la voie cible. 0 et 1 sont refusés pour une pose.',
    'Finite fraction strictly between 0 and 1 on the target track. 0 and 1 are rejected for placement.',
  ),
  travelDirection: pair(
    'Sens de déplacement normalisé : +1 de A vers B, -1 de B vers A. Par défaut, sens du signal source ; le SDK convertit vers le sens natif du modèle.',
    'Normalised travel direction: +1 from A to B, -1 from B to A. Defaults to the source signal’s direction; the SDK converts to the model’s native direction.',
  ),
})
methods(n, ['ToolContext.log'], {
  message: pair(
    'Message de diagnostic lisible, de 1 à 4096 octets UTF-8, sans caractère nul. Donner identités, valeurs et motif utiles ; ne pas utiliser tr(...) dans un journal.',
    'Readable diagnostic message, 1 to 4096 UTF-8 bytes, without NUL. Include relevant identities, values and reason; do not use tr(...) in logs.',
  ),
  level: pair(
    'Niveau Info, Warning ou Error selon la gravité de l’événement. Ne change pas le comportement du jeu.',
    'Info, Warning or Error level according to event severity. Does not change game behaviour.',
  ),
})
methods(n, ['ToolContext.clock', 'ToolContext.network'], {}, copied)
methods(n, ['ToolContext.trains'], { query }, copied)
methods(
  n,
  ['ToolContext.linePlan'],
  { trainId: train, train },
  pair(
    'Plan copié de la ligne du train, ou null si absent ou instable. Ses heures sont des offsets relatifs, pas des départs absolus du train.',
    'Copied plan of the train’s line, or null if absent or unstable. Its times are relative offsets, not the train’s absolute departures.',
  ),
)
methods(n, ['ToolContext.changeTime'], {
  utcSeconds: pair(
    'Date UTC en secondes signées depuis 1970, correspondant aux années 1..9999 ; ni ticks, ni millisecondes, ni microsecondes.',
    'UTC date in signed seconds since 1970 corresponding to years 1..9999; not ticks, milliseconds or microseconds.',
  ),
  date: pair(
    'Date UTC civile valide, années 1..9999. Le SDK la convertit en secondes ; la phase fractionnaire de simulation reste conservée.',
    'Valid UTC calendar date, years 1..9999. The SDK converts it to seconds; fractional simulation phase is preserved.',
  ),
  recalculateTrains: recalculation,
})
methods(n, ['ToolContext.showWindow', 'ToolContext.showPanel'], {
  request,
  message: pair(
    'Message d’interface, accepte tr(...). Panneau de signal : 256 caractères et 256 octets UTF-8 maximum ; fenêtre : 4096 octets par chaîne, formulaire complet limité à 8192 octets. Aucun caractère nul.',
    'Interface message; accepts tr(...). Signal panel: at most 256 characters and 256 UTF-8 bytes; window: 4096 bytes per string, complete form limited to 8192 bytes. No NUL.',
  ),
  buttons: pair(
    'Jusqu’à 12 boutons avec IDs distincts, également distincts des champs. Un clic fournit l’id dans action ; enabled=false désactive le bouton.',
    'Up to 12 buttons with distinct IDs, also distinct from fields. A click supplies its id in action; enabled=false disables it.',
  ),
  inputs: pair(
    'Champs entiers, IDs distincts : jusqu’à 4 dans un panneau de signal, 8 dans une fenêtre. minimum ≤ value ≤ maximum ; un brouillon invalide bloque les commandes. La fenêtre transmet les valeurs ensemble, le panneau signale chaque modification.',
    'Integer fields with distinct IDs: up to 4 in a signal panel, 8 in a window. minimum ≤ value ≤ maximum; an invalid draft blocks commands. A window sends values together; a panel reports each edit.',
  ),
})
methods(n, ['ToolContext.prepareConstruction'], { sourceSignal: signal }, constructionResult)
methods(
  n,
  ['ToolContext.createSignals'],
  { ticket, sourceSignal: signal, positions: constructionPositions },
  constructionResult,
)
methods(
  n,
  ['ToolContext.undoConstruction', 'ToolContext.pollConstruction'],
  { ticket },
  constructionResult,
)
methods(n, ['ToolContext.showSignalPreview'], {
  request,
  positions: pair(
    'Jusqu’à 64 positions de même modèle ; liste vide retire l’aperçu. Fractions finies strictement dans (0,1), sens natifs ±1 et voies de la capture. Réutiliser les mêmes positions pour le plan confirmé.',
    'Up to 64 positions of the same model; an empty list removes the preview. Finite fractions strictly in (0,1), native directions ±1 and tracks from the snapshot. Reuse the same positions for the confirmed plan.',
  ),
})
methods(n, ['ToolContext.clearSignalPreview'], {})
methods(n, ['ToolRouteTrack.connection'], {
  end: pair(
    'Extrémité A ou B de cette voie. Le résultat décrit le raccordement observé ; il ne choisit pas une branche à votre place.',
    'A or B end of this track. The result describes the observed connection; it does not choose a branch for you.',
  ),
})
methods(
  n,
  [
    'ToolTopology.track',
    'ToolTopology.signal',
    'TrainSnapshot.get',
    'TrainSnapshot.line',
    'TrainSnapshot.tag',
    'TrainSnapshot.tagsForLine',
  ],
  { id: opaque },
  localNullable,
)
methods(n, ['ToolNetwork.topology'], {})
methods(n, ['TrainEditorBuilder.maximumLength'], {
  meters: pair(
    'Même instance d’IntegerOption enregistrée avec options(...). minimum et maximum restent dans 1..10000 mètres ; le mod choisit defaultValue, le SDK suit value.',
    'Same IntegerOption instance registered through options(...). minimum and maximum stay within 1..10000 metres; the mod chooses defaultValue and the SDK follows value.',
  ),
  exceeded: pair(
    'Refus pour une addition dépassant la longueur totale. Texte non vide, fixe ou tr("clé") sans paramètres, limité à 1024 octets UTF-8. Le SDK ajoute séparément les longueurs.',
    'Refusal for an addition exceeding total length. Nonempty fixed text or tr("key") without arguments, limited to 1024 UTF-8 bytes. The SDK adds lengths separately.',
  ),
  lengthUnavailable: pair(
    'Refus lorsque la longueur du véhicule ne peut pas être établie. Même contrat de texte que exceeded ; ne pas accepter une longueur inconnue comme zéro.',
    'Refusal when vehicle length cannot be established. Same text contract as exceeded; do not accept unknown length as zero.',
  ),
  verificationUnavailable: pair(
    'Refus lorsque la composition complète ne peut pas être vérifiée. Même contrat de texte que exceeded ; le refus préserve la composition existante.',
    'Refusal when the complete composition cannot be verified. Same text contract as exceeded; refusal preserves the existing composition.',
  ),
})
methods(
  n,
  ['tr'],
  {
    key: pair(
      'Clé présente dans assets/translations.json : 1..96 caractères ASCII parmi lettres, chiffres, ., _, -. Si absente dans la langue active, repli du catalogue puis clé.',
      'Key in assets/translations.json: 1..96 ASCII characters from letters, digits, ., _, -. If absent from the active language, catalogue fallback then the key.',
    ),
    arguments: pair(
      'Au plus 8 paires nom to valeur, noms distincts au même format que key ; valeur convertie par toString. La référence complète reste limitée à 256 octets UTF-8. Aucun paramètre pour les messages trainEditor.',
      'At most 8 name to value pairs, distinct names following the key format; values converted through toString. The complete reference remains limited to 256 UTF-8 bytes. No arguments for trainEditor messages.',
    ),
  },
  pair(
    'Référence différée String, traduite lors de l’affichage par le SDK. La passer directement à un contrôle, sans concaténation ni écriture dans un journal.',
    'Deferred String reference translated by the SDK when displayed. Pass it directly to a control without concatenation or logging.',
  ),
)

const sdk = pair(
  'Chemin du fichier de bibliothèque SDK, pour connect comme pour open : bin/NimbyRailsFranceSDK.dll sous Windows. Ne pas passer un dossier, le kit Gradle ou le JAR ; utiliser un paquet compatible avec la plateforme, le jeu et le processus.',
  'SDK library file path for both connect and open: bin/NimbyRailsFranceSDK.dll on Windows. Do not pass a directory, the Gradle kit or the JAR; use a package compatible with the platform, game and process.',
)
methods(
  j,
  ['Nimby.runningGames', 'GameProcesses.discover'],
  {},
  pair(
    'Processus de jeu visibles ; liste vide si aucun n’est visible. Découverte seule, sans connexion ni sélection implicite.',
    'Visible game processes; empty list when none is visible. Discovery only, with no connection or implicit selection.',
  ),
)
methods(
  j,
  ['Nimby.connect', 'NimbyClient.Companion.open'],
  {
    sdk,
    libraryPath: sdk,
    processId: pair(
      'PID d’un jeu accessible. Pour connect, null exige exactement un jeu visible ; pour open, fournir le PID explicitement. La connexion n’installe pas un mod.',
      'PID of an accessible game. For connect, null requires exactly one visible game; for open, supply the PID explicitly. Connecting does not install a mod.',
    ),
  },
  pair(
    'Connexion possédée par l’application. La fermer avec use/close ; les observations copiées restent lisibles après fermeture.',
    'Application-owned connection. Close it with use/close; copied observations remain readable after closing.',
  ),
)
methods(
  j,
  [
    'Game.snapshot',
    'NimbyClient.capture',
    'ObservationClient.capture',
    'Game.Trains.snapshot',
    'NimbyClient.captureTrainData',
  ],
  { selectedTrain: selected, selectedTrainId: selected, query },
  copied,
)
methods(j, ['Game.close', 'NimbyClient.close', 'ModControlSession.close'], {})
methods(
  j,
  ['Game.Trains.read', 'NimbyClient.readTrain'],
  { id: train, trainId: train },
  pair(
    'Observation ciblée copiée, ou null si le train est absent ou instable. Les autres échecs lèvent une exception ; null n’est pas une vitesse nulle.',
    'Copied targeted observation, or null if the train is absent or unstable. Other failures throw; null is not zero speed.',
  ),
)
methods(
  j,
  ['Game.Clock.read', 'NimbyClient.readSimulationClock'],
  {},
  pair(
    'Horloge copiée, ou null si indisponible ; aucun relevé de la carte entière. Interpréter ticks en centièmes depuis epochSeconds.',
    'Copied clock, or null when unavailable; does not capture the entire map. Interpret ticks as hundredths from epochSeconds.',
  ),
)
methods(
  j,
  ['Game.Clock.set', 'NimbyClient.setSimulationDateTime'],
  {
    utc: pair(
      'Instant UTC avec nano=0, dans les années 1..9999. Demande une date à la seconde ; la phase fractionnaire du jeu reste conservée dans le résultat.',
      'UTC Instant with nano=0, within years 1..9999. Requests a whole-second date; the game’s fractional phase remains preserved in the result.',
    ),
    recalculateTrains: recalculation,
  },
  pair(
    'Horloge obtenue et nombre d’interventions natives ; ce compteur n’est pas le nombre de trains lus. Après une erreur, relire l’horloge avant toute nouvelle décision.',
    'Resulting clock and native intervention count; that count is not the number of trains read. After an error, reread the clock before deciding on a new action.',
  ),
)
const textureArgs = {
  id: signal,
  signal,
  catalogue: pair(
    'Identifiant exact du catalogue de textures auquel appartient l’image.',
    'Exact identity of the texture catalogue containing the image.',
  ),
  image: pair(
    'Chemin relatif d’une image de ce catalogue, pas un fichier arbitraire du disque.',
    'Relative image path in that catalogue, not an arbitrary disk file.',
  ),
  path: pair(
    'Chemin relatif d’une image de ce catalogue, pas un fichier arbitraire du disque.',
    'Relative image path in that catalogue, not an arbitrary disk file.',
  ),
  durationMillis: pair(
    'Durée de l’essai visuel en millisecondes, 1000..60000 inclus. Ne modifie ni l’aspect logique ni les permissions de conduite.',
    'Visual test duration in milliseconds, 1000..60000 inclusive. Changes neither logical aspect nor driving permissions.',
  ),
}
methods(j, ['Game.Signals.showTexture', 'NimbyClient.showSignalTextureFor'], textureArgs)
methods(j, ['Game.Signals.restoreTexture', 'NimbyClient.restoreSignalTexture'], {
  id: signal,
  signal,
})
const modId = pair(
  'Identifiant technique du mod chargé qui expose le contrôle de recette, identique au paquet ; pas son nom affiché.',
  'Technical identity of the loaded mod exposing test control, identical to the package; not its display name.',
)
methods(
  j,
  [
    'Game.Mods.status',
    'Game.Mods.control',
    'NimbyClient.acquireModControl',
    'NimbyClient.modControl',
  ],
  {
    id: modId,
    modId,
    leaseMillis: lease,
    request: pair(
      'Requête typée avec les valeurs adaptées à son operation. Pour les usages courants, préférer ModControlSession : elle conserve owner et generation du bail.',
      'Typed request with values appropriate to its operation. For common uses, prefer ModControlSession: it retains the lease owner and generation.',
    ),
  },
)
methods(
  j,
  ['Game.Construction.prepare', 'NimbyClient.prepareConstruction'],
  { sourceSignal: signal },
  constructionResult,
)
methods(
  j,
  ['Game.Construction.create', 'NimbyClient.createSignals'],
  { token: ticket, sourceSignal: signal, positions: constructionPositions },
  constructionResult,
)
methods(
  j,
  [
    'Game.Construction.poll',
    'Game.Construction.undo',
    'NimbyClient.pollConstruction',
    'NimbyClient.undoConstruction',
  ],
  { token: ticket },
  constructionResult,
)
methods(j, ['ModControlSession.renew'], { leaseMillis: lease }, controlResult)
methods(
  j,
  [
    'ModControlSession.forceSignal',
    'ModControlSession.restoreSignal',
    'ModControlSession.setSetting',
    'ModControlSession.restoreSetting',
    'ModControlSession.readSignal',
  ],
  {
    signal,
    aspect: pair(
      'Code d’aspect accepté par le mod contrôlé. Il n’existe pas de code universel vert/rouge entre les mods.',
      'Aspect code accepted by the controlled mod. There is no universal green/red code across mods.',
    ),
    index: pair(
      'Indice du réglage booléen dans le catalogue du mod, pas le nom ni le texte traduit du réglage.',
      'Boolean setting index in the mod catalogue, not its name or translated display text.',
    ),
    value: pair(
      'Valeur booléenne temporaire de recette. Ne persiste pas un choix du joueur dans la sauvegarde.',
      'Temporary Boolean test value. Does not persist a player choice in the save.',
    ),
  },
  controlResult,
)
methods(
  j,
  [
    'ModControlSession.constrainTrain',
    'ModControlSession.restoreTrain',
    'ModControlSession.readTrain',
  ],
  {
    train,
    speedMps: pair(
      'Vitesse finie en m/s : exactement 0 pour le mode Stop, strictement positive pour SpeedLimit et PhysicalClearance. Ne pas passer des km/h.',
      'Finite speed in m/s: exactly 0 for Stop mode, strictly positive for SpeedLimit and PhysicalClearance. Do not pass km/h.',
    ),
    mode: pair(
      'Mode de recette : plafond de vitesse, espace physiquement libre ou arrêt. Respecter les conditions du mod et du moteur ; ce n’est pas une garantie universelle de circulation.',
      'Test mode: speed ceiling, physically clear space or stop. Respect mod and engine conditions; this is not a universal movement guarantee.',
    ),
    exitSignal: pair(
      'Signal de sortie observé pour terminer la consigne ; 0 lorsqu’aucune sortie n’est fournie.',
      'Observed exit signal for ending the rule; 0 when no exit is supplied.',
    ),
    releaseByRear: pair(
      'true attend le dégagement de la sortie par la queue ; false utilise le passage de la tête.',
      'true waits for the rear to clear the exit; false uses the head passing it.',
    ),
  },
  controlResult,
)
methods(j, ['ModControlSession.clear'], {}, controlResult)
methods(j, ['SimulationClock.toInstant'], {})
methods(
  j,
  [
    'Observation.train',
    'Observation.service',
    'Observation.details',
    'Observation.station',
    'Observation.track',
    'Observation.platform',
    'Observation.line',
    'Observation.tag',
    'Observation.metadata',
    'Observation.tagsForLine',
  ],
  { id: opaque, trainId: train, trackId: opaque },
  localNullable,
)
methods(
  j,
  [
    'TrackMetric.offsetM',
    'TrackMetric.fraction',
    'TrackMetric.distanceM',
    'TrackMetric.positionAtMetres',
  ],
  {
    fraction: pair(
      'Fraction finie dans [0,1] inclus, mesurée depuis l’origine de cette voie.',
      'Finite fraction in inclusive [0,1], measured from this track’s origin.',
    ),
    offsetM: pair(
      'Distance finie en mètres dans [0,lengthM] inclus, mesurée depuis l’origine de cette voie.',
      'Finite distance in metres in inclusive [0,lengthM], measured from this track’s origin.',
    ),
    fromFraction: pair(
      'Première fraction finie dans [0,1] inclus sur cette même voie.',
      'First finite fraction in inclusive [0,1] on this same track.',
    ),
    toFraction: pair(
      'Seconde fraction finie dans [0,1] inclus ; la distance retournée est absolue.',
      'Second finite fraction in inclusive [0,1]; the returned distance is absolute.',
    ),
    direction: pair(
      'Sens choisi : Forward (+1) ou Backward (-1). Ne change pas l’origine depuis laquelle offsetM est mesuré.',
      'Chosen direction: Forward (+1) or Backward (-1). Does not change the origin from which offsetM is measured.',
    ),
  },
)
methods(j, ['DiagnosticLog.Companion.defaultRoot'], {})
methods(j, ['DiagnosticLog.Companion.forComponent'], {
  name: pair(
    'Nom court et stable du composant du journal ; réutiliser le même nom partage le regroupement des répétitions.',
    'Short stable log component name; reusing the same name shares repeated-event coalescing.',
  ),
})
methods(j, ['DiagnosticLog.write'], {
  message: pair(
    'Message lisible décrivant un événement utile. Éviter une écriture pour chaque lecture réussie.',
    'Readable message describing a useful event. Avoid writing for every successful read.',
  ),
  failure: pair(
    'Exception à joindre à l’événement ; null n’ajoute aucune trace d’exception.',
    'Exception to attach to the event; null adds no exception trace.',
  ),
  level: pair(
    'Niveau textuel du journal ; défaut INFO sans failure et ERROR avec failure.',
    'Text log level; defaults to INFO without failure and ERROR with failure.',
  ),
})
methods(j, ['DiagnosticLog.startApplication'], {
  version: pair(
    'Version de votre application à joindre au diagnostic de démarrage, pas la date du jeu.',
    'Your application version to include in startup diagnostics, not the game date.',
  ),
})

// Constructor arguments that back public properties use the *same* reviewed
// property contract. Private transport constructors never appear in the catalogue.
const constructorExtras: Record<string, Arguments> = {
  [j + 'class:DiagnosticLog']: {
    root: pair(
      'Dossier des journaux ; défaut DiagnosticLog.defaultRoot(). Aucun accès aux observations de la partie.',
      'Log directory; defaults to DiagnosticLog.defaultRoot(). No game observation access.',
    ),
    maximumBytes: pair(
      'Seuil du fichier en octets déclenchant la rotation ; défaut 2 Mio. Une écriture isolée peut dépasser ce seuil : ce n’est pas une taille maximale de message. Choisir une valeur positive adaptée à l’application.',
      'File threshold in bytes triggering rotation; defaults to 2 MiB. A single write may exceed this threshold: it is not a maximum message size. Choose a positive value suitable for the application.',
    ),
  },
  [n + 'class:ToolOperationException']: {
    message: pair(
      'Explication de l’opération refusée, conservée avec status pour le diagnostic. Une exception après mutation ne prouve pas l’absence d’effet.',
      'Explanation of the refused operation, retained with status for diagnostics. An exception after a mutation does not prove there were no effects.',
    ),
  },
  [j + 'class:SdkException']: {
    operation: pair(
      'Nom de l’opération ayant échoué, ajouté au message avec status pour le diagnostic. Cette exception ne prouve pas qu’une mutation n’a eu aucun effet.',
      'Name of the failed operation, added to the message with status for diagnostics. This exception does not prove a mutation had no effect.',
    ),
  },
}
for (const symbol of symbols.filter((entry) => entry.kind === 'class')) {
  const shape = callableShape(symbol)
  if (!shape) continue
  const scope = symbol.id.slice(0, symbol.id.indexOf('class:'))
  const args: Arguments = {}
  for (const parameter of shape.parameters) {
    const owner = symbol.owner ? symbol.owner + '.' + symbol.name : symbol.name
    const own =
      reviewedApiContracts[scope + 'val:' + owner + '.' + parameter.name] ||
      reviewedApiContracts[scope + 'var:' + owner + '.' + parameter.name]
    const inherited = ['BooleanOption', 'IntegerOption', 'ChoiceOption'].includes(symbol.name)
      ? reviewedApiContracts[n + 'val:ModOption.' + parameter.name]
      : undefined
    const description = constructorExtras[symbol.id]?.[parameter.name] || own || inherited
    if (!description)
      throw new Error(`Constructor parameter needs review: ${symbol.id} / ${parameter.name}`)
    args[parameter.name] = description
  }
  reviewedCallableContracts[symbol.id] = {
    shape,
    arguments: args,
    result: pair(
      'Nouvel objet du type indiqué, contenant les valeurs fournies. Sa création ne lit pas ni ne modifie une partie à elle seule ; respecter les validations décrites ci-dessus.',
      'New object of the indicated type containing the supplied values. Creating it alone neither reads nor changes a game; respect the validations described above.',
    ),
  }
}
for (const symbol of symbols.filter((entry) => entry.kind === 'fun')) {
  if (!reviewedCallableContracts[symbol.id])
    throw new Error(`Public callable needs parameter review: ${symbol.id}`)
}

// Error families are attached only to the operations reviewed below. In
// particular, local nullable lookups are not advertised as native calls.
function failures(scope: string, names: string[], description: Translation) {
  for (const name of names) {
    for (const [id, contract] of Object.entries(reviewedCallableContracts)) {
      if (id.startsWith(scope + 'fun:' + name + '(')) contract.failures = description
    }
  }
}
const invalid = pair(
  'Un argument ne respectant pas les bornes ou conditions indiquées est refusé avec IllegalArgumentException. Cet appel ne relit pas le jeu pour corriger vos données automatiquement.',
  'An argument outside the stated bounds or conditions is rejected with IllegalArgumentException. This call does not reread the game to correct your data automatically.',
)
failures(
  n,
  [
    'AutomaticDriving.announceStop',
    'AutomaticDriving.limitAtSignal',
    'AutomaticDriving.limitUntilClearThenRear',
    'AutomaticDriving.restrictedUntilNextSignal',
    'GameDateTime.Companion.fromUtcSeconds',
    'NumberSetting.withValue',
    'SignalAnimation.frameAt',
    'steady',
    'blink',
    'ToolSignal.placementAt',
    'ToolNetwork.topology',
    'SignalContext.enabled',
    'SignalRuleContext.enabled',
  ],
  invalid,
)
failures(
  j,
  [
    'TrackMetric.offsetM',
    'TrackMetric.fraction',
    'TrackMetric.distanceM',
    'TrackMetric.positionAtMetres',
  ],
  invalid,
)
failures(
  n,
  [
    'ToolContext.log',
    'ToolContext.clock',
    'ToolContext.trains',
    'ToolContext.linePlan',
    'ToolContext.changeTime',
    'ToolContext.showWindow',
    'ToolContext.network',
    'ToolContext.prepareConstruction',
    'ToolContext.showSignalPreview',
    'ToolContext.clearSignalPreview',
    'ToolContext.createSignals',
    'ToolContext.undoConstruction',
    'ToolContext.pollConstruction',
    'ToolContext.showPanel',
  ],
  pair(
    'Une entrée invalide peut lever IllegalArgumentException ; utiliser le contexte après son callback lève IllegalStateException. Un refus de l’opération lève ToolOperationException avec status. isBusy autorise seulement une lecture ou présentation ultérieure : ne jamais rejouer une construction, une annulation ou un changement d’heure après une réponse incertaine.',
    'Invalid input may throw IllegalArgumentException; using the context after its callback throws IllegalStateException. An operation refusal throws ToolOperationException with status. isBusy only permits a later read or presentation: never replay construction, undo or a time change after an uncertain response.',
  ),
)
failures(
  n,
  ['tr'],
  pair(
    'Catalogue de traductions absent : IllegalStateException. Clé, paramètres ou taille de référence invalides : IllegalArgumentException. Une traduction manquante dans une langue utilise le repli ; ce cas n’est pas un échec de lecture du jeu.',
    'Missing translation catalogue: IllegalStateException. Invalid key, arguments or reference size: IllegalArgumentException. A translation missing in one language uses fallback; this is not a game-read failure.',
  ),
)
failures(
  j,
  ['Nimby.connect', 'NimbyClient.Companion.open'],
  pair(
    'PID, sélection implicite ou version incompatibles peuvent être refusés avec IllegalArgumentException. Une bibliothèque absente ou incompatible peut échouer au chargement ; un refus SDK conserve status dans SdkException. Une liste de processus visible ne garantit pas une connexion réussie.',
    'An invalid PID, implicit selection or incompatible version may be rejected with IllegalArgumentException. A missing or incompatible library may fail to load; an SDK refusal retains status in SdkException. A visible process list does not guarantee a successful connection.',
  ),
)
failures(
  j,
  [
    'Game.snapshot',
    'Game.Trains.read',
    'Game.Trains.snapshot',
    'Game.Clock.read',
    'Game.Clock.set',
    'Game.Signals.showTexture',
    'Game.Signals.restoreTexture',
    'Game.Mods.status',
    'Game.Mods.control',
    'Game.Construction.prepare',
    'Game.Construction.create',
    'Game.Construction.poll',
    'Game.Construction.undo',
    'NimbyClient.readTrain',
    'NimbyClient.prepareConstruction',
    'NimbyClient.createSignals',
    'NimbyClient.undoConstruction',
    'NimbyClient.pollConstruction',
    'NimbyClient.readSimulationClock',
    'NimbyClient.capture',
    'NimbyClient.captureTrainData',
    'NimbyClient.setSimulationDateTime',
    'NimbyClient.showSignalTextureFor',
    'NimbyClient.restoreSignalTexture',
    'NimbyClient.modControl',
    'NimbyClient.acquireModControl',
    'ModControlSession.renew',
    'ModControlSession.forceSignal',
    'ModControlSession.restoreSignal',
    'ModControlSession.setSetting',
    'ModControlSession.restoreSetting',
    'ModControlSession.constrainTrain',
    'ModControlSession.restoreTrain',
    'ModControlSession.readSignal',
    'ModControlSession.readTrain',
    'ModControlSession.clear',
  ],
  pair(
    'Arguments hors contrat : refus possible avec IllegalArgumentException. Connexion ou bail fermé : IllegalStateException ; refus SDK : SdkException avec status. Une valeur null explicitement prévue est un résultat normal, distinct d’une exception. Après un échec de mutation, vérifier les observations ou le ticket avant de décider d’une nouvelle action ; aucune reprise automatique.',
    'Out-of-contract arguments may be rejected with IllegalArgumentException. Closed connection or lease: IllegalStateException; SDK refusal: SdkException with status. An explicitly allowed null is a normal result, distinct from an exception. After a mutation failure, inspect observations or the ticket before deciding on a new action; no automatic retry.',
  ),
)
