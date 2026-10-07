import type { Article } from './schema'
import { text, code, note, table, links } from './schema'
import topologyExample from './snippets/ToolTopology.kt?raw'
import previewExample from './snippets/PreviewTool.kt?raw'
import constructionExample from './snippets/ConstructionFollower.kt?raw'

export const toolAuthoringEnglish: Record<string, string> = {}
const t = (fr: string, en: string) => {
  toolAuthoringEnglish[fr] = en
  return fr
}
const literal = (value: string) => t(value, value)

export const toolAuthoring: Article[] = [
  {
    slug: 'mods/metadonnees-traduites',
    group: 'Créer un mod',
    title: t('Traduire le nom et la description du mod', 'Translate the mod name and description'),
    description: t(
      'Présenter le mod et ses signaux dans la langue du jeu avec un catalogue de textes commun.',
      'Present the mod and its signals in the game language through a shared text catalogue.',
    ),
    status: 'experimental',
    sections: [
      {
        id: 'declaration',
        title: t('Déclarer les textes une seule fois', 'Declare text once'),
        blocks: [
          text(t(
            'Prérequis : un mod déclaré avec signalMod ou toolMod et un fichier assets/translations.json. Cette page traduit le nom et la description affichés du mod, puis les noms de construction. Elle complète la traduction des boutons et des messages.',
            'Prerequisites: a mod declared with signalMod or toolMod and an assets/translations.json file. This page translates the displayed mod name and description, then construction names. It complements button and message translation.',
          )),
          code(
            'metadata(\n    author = "Your name",\n    name = tr("mod.name"),\n    description = tr("mod.description")\n)',
            t('Dans signalMod ou toolMod', 'Inside signalMod or toolMod'),
          ),
          code(
            JSON.stringify(
              {
                fallback: 'fr',
                languages: {
                  fr: {
                    'mod.name': 'Mes signaux',
                    'mod.description': 'Des signaux pour mon réseau.',
                  },
                  en: { 'mod.name': 'My signals', 'mod.description': 'Signals for my network.' },
                },
              },
              null,
              2,
            ),
            literal('assets/translations.json'),
            'json',
          ),
          text(
            t(
              'Vous pouvez mélanger du texte direct et tr. author reste la signature de l’auteur. Le nom affiché est facultatif ; son absence reprend le nom du mod.json. Les références acceptent aussi les paramètres nommés de tr, résolus à la compilation. Chaque clé doit exister dans la langue fallback.',
              'You can mix plain text and tr. author remains the author’s credit. The display name is optional; omitting it uses the name from mod.json. References also support tr’s named parameters, resolved at build time. Every key must exist in the fallback language.',
            ),
          ),
          note(
            t(
              'Ne traduisez jamais id, modId, module, textureSet, les identifiants de modèle, de service ou de case. Ces valeurs relient les paquets, réglages et sauvegardes ; elles ne sont pas des textes pour les joueurs.',
              'Never translate id, modId, module, textureSet, or model, service and checkbox identifiers. These values connect packages, settings and saves; they are not player-facing text.',
            ),
          ),
        ],
      },
      {
        id: 'affichage',
        title: t('Où les traductions apparaissent', 'Where translations appear'),
        blocks: [
          table(
            [t('Emplacement', 'Location'), t('Comportement', 'Behaviour')],
            [
              [
                literal('mod.txt'),
                t(
                  'Nom et description dans la langue de repli. Ces textes générés restent lisibles lorsque la localisation du SDK est indisponible.',
                  'Name and description in the fallback language. This generated text remains readable when SDK localization is unavailable.',
                ),
              ],
              [
                literal('nrf-metadata.json'),
                t(
                  'Textes résolus pour chaque langue, générés à côté de mod.txt. Aucun second fichier à maintenir manuellement.',
                  'Resolved text for each language, generated alongside mod.txt. No second file needs manual maintenance.',
                ),
              ],
              [
                t('Liste des mods d’une nouvelle partie', 'New-game mod list'),
                t(
                  'Le nom et la fiche suivent la langue active du jeu : langue exacte, langue principale, puis fallback.',
                  'The name and details follow the active game language: exact locale, base language, then fallback.',
                ),
              ],
              [
                t('Gestionnaire de mods pendant une partie', 'In-game mod manager'),
                t(
                  'Le nom de liste, le titre et la description de la fiche sont adaptés au moment de leur affichage. Les métadonnées enregistrées dans la sauvegarde restent intactes.',
                  'The list name, details title and description are adapted as they are displayed. Metadata stored in the save remains intact.',
                ),
              ],
              [
                t('Construction et contenu du mod', 'Construction and mod contents'),
                t(
                  'construction(name = tr(...), catalogueName = tr(...)) génère les noms traduits des signaux et catalogues de textures. Le détail des ressources du gestionnaire utilise aussi ces textes.',
                  'construction(name = tr(...), catalogueName = tr(...)) generates translated signal and texture catalogue names. The manager’s resource details also use this text.',
                ),
              ],
              [
                t('Hub et publication Steam', 'Hub and Steam publishing'),
                t(
                  'Ils conservent les métadonnées de leur propre manifeste. Cette fonctionnalité ne traduit pas la page Steam ni l’interface du Hub.',
                  'They retain the metadata from their own manifest. This feature does not translate the Steam page or Hub interface.',
                ),
              ],
            ],
          ),
          note(
            t(
              'La liste du jeu présente les mods contenant des ressources qu’il peut sélectionner. Un outil sans ressources constructibles peut être absent de cette liste tout en étant actif et utilisable par son raccourci ou son service. Ses contrôles utilisent tr indépendamment de sa présence dans le sélecteur.',
              'The game list presents mods containing selectable resources. A tool without constructible resources may be absent from this list while remaining active and usable through its shortcut or service. Its controls use tr independently of its presence in the picker.',
            ),
          ),
          text(
            t(
              'Une description peut contenir des retours à la ligne ; le nom reste sur une seule ligne. Chaque catalogue appartient à son mod : deux paquets peuvent employer les mêmes clés sans partager leurs textes. Vérifiez les noms longs et les descriptions dans les deux langues.',
              'A description may contain line breaks; the name remains single-line. Each catalogue belongs to its mod: two packages may use the same keys without sharing their text. Check long names and descriptions in both languages.',
            ),
          ),
          note(
            t(
              'La localisation des listes et catalogues reste expérimentale et dépend de la compatibilité SDK/jeu. Si les textes de repli apparaissent, vérifiez le paquet et les diagnostics de chargement. Gardez toujours un repli compréhensible et contrôlez le résultat dans la version du jeu que vous distribuez.',
              'List and catalogue localization remains experimental and depends on SDK/game compatibility. If fallback text appears, check the package and loading diagnostics. Always retain understandable fallback text and check the result in the game version you distribute for.',
            ),
          ),
          links(
            {
              label: t('Traduire les panneaux et boutons', 'Translate panels and buttons'),
              to: '/mods/traductions',
            },
            {
              label: t('Comprendre la génération du paquet', 'Understand package generation'),
              to: '/mods/paquet-genere',
            },
          ),
        ],
      },
      {
        id: 'catalogues',
        title: t('Traduire chaque modèle de signal', 'Translate each signal model'),
        blocks: [
          code(
            'construction(\n    states = listOf("imgs/closed.png", "imgs/open.png"),\n    name = tr("signal.construction"),\n    catalogueName = tr("signal.catalogue")\n)',
            t('Dans la déclaration de votre signalModel', 'Inside your signalModel declaration'),
          ),
          code(
            JSON.stringify(
              {
                fallback: 'fr',
                languages: {
                  fr: { 'signal.construction': 'Mon signal', 'signal.catalogue': 'Mes feux' },
                  en: { 'signal.construction': 'My signal', 'signal.catalogue': 'My lights' },
                },
              },
              null,
              2,
            ),
            t(
              'Clés à ajouter au même assets/translations.json',
              'Keys to add to the same assets/translations.json',
            ),
            'json',
          ),
          text(
            t(
              'name apparaît dans le menu de construction ; catalogueName nomme le jeu de textures. Omettez catalogueName pour reprendre name. Une chaîne directe reste possible. Avec tr, laissez nameKey et catalogueNameKey absents : la génération relie les textes au bon mod et au bon modèle.',
              'name appears in the construction menu; catalogueName names the texture set. Omit catalogueName to reuse name. Plain strings remain supported. With tr, leave nameKey and catalogueNameKey unset: generation associates text with the correct mod and model.',
            ),
          ),
          text(
            t(
              'Le nom de catalogue de repli est en anglais lorsque cette traduction existe, sinon dans la langue fallback. Reconstruisez le paquet après une modification du JSON et vérifiez les deux langues dans le jeu. Une traduction change le texte affiché, jamais les identifiants, les chemins ou l’ordre des textures.',
              'The fallback catalogue name is English when that translation exists, otherwise the fallback language. Rebuild the package after editing JSON and check both languages in the game. A translation changes display text, never identifiers, paths or texture order.',
            ),
          ),
        ],
      },
    ],
  },
  {
    slug: 'mods/horloge',
    group: 'Créer un mod',
    title: t(
      'Créer un outil avec une fenêtre et une horloge',
      'Create a tool with a window and clock',
    ),
    description: t(
      'Un toolMod autonome, sans signal sélectionné : formulaire, événement, confirmation et changement de date.',
      'A standalone toolMod with no selected signal: form, event, confirmation and date change.',
    ),
    status: 'experimental',
    sections: [
      {
        id: 'fenetre',
        title: t('Ouvrir un outil indépendant des signaux', 'Open a tool independently of signals'),
        blocks: [
          code(
            'package nimby.mod\n\nimport nimby.*\n\nfun createMod() = toolMod(modInfo) {\n    metadata(author = "Your name", description = "Read the game clock.")\n    window("clock", "Clock", shortcut = "Ctrl+Shift+T") { event ->\n        showWindow(event, clock().dateTime().toString(),\n            listOf(ToolButton("refresh", "Refresh")))\n    }\n}',
            t('Outil complet en lecture seule', 'Complete read-only tool'),
          ),
          text(
            t(
              'Préparez le projet avec le guide d’installation : mod.json génère modInfo. Cet outil ne déclare ni signal ni texture. Une partie doit être chargée et observée. Le raccourci ouvre une fenêtre Windows possédée par la fenêtre du jeu ; ce n’est pas un bouton dans sa barre d’outils. La croix ferme la fenêtre, pas le mod.',
              'Prepare the project with the installation guide: mod.json generates modInfo. This tool declares no signal or texture. A game must be loaded and observed. The shortcut opens a Windows window owned by the game window; it is not a button on the game’s toolbar. Closing the window does not stop the mod.',
            ),
          ),
          table(
            [t('Déclaration', 'Declaration'), t('Rôle exact', 'Exact purpose')],
            [
              [
                literal('window(id, title, shortcut, handler)'),
                t(
                  'id identifie la fenêtre ; title est son titre visible et accepte tr ; shortcut vaut F8 par défaut. Jusqu’à 8 fenêtres, identifiants et raccourcis distincts.',
                  'id identifies the window; title is its visible caption and accepts tr; shortcut defaults to F8. Up to 8 windows, with distinct IDs and shortcuts.',
                ),
              ],
              [
                literal('Ctrl+Shift+A … Ctrl+Shift+Z · F1 … F12'),
                t(
                  'Raccourcis Windows disponibles. Le SDK ouvre l’outil seulement quand le jeu est au premier plan. Un conflit de raccourci est signalé dans le journal.',
                  'Supported Windows shortcuts. The SDK opens the tool only while the game is in the foreground. Shortcut conflicts are reported in the log.',
                ),
              ],
              [
                literal('ToolWindowEvent'),
                t(
                  'window identifie la fenêtre, action vaut open à l’ouverture puis l’id du bouton, values contient tous les champs entiers. sequence, worldId et generation identifient la demande et la partie.',
                  'window identifies the window; action is open on opening and then the button ID; values contains all integer fields. sequence, worldId and generation identify the request and game session.',
                ),
              ],
              [
                literal('showWindow(event, message, buttons, inputs)'),
                t(
                  'message au-dessus, puis les champs et boutons. 8 champs et 12 boutons maximum. id reste technique, label est visible ; enabled active ou désactive le contrôle. Le formulaire UTF-8 complet est borné à 8192 octets.',
                  'message appears above the fields and buttons. At most 8 fields and 12 buttons. id is internal, label is visible, and enabled enables or disables the control. The complete UTF-8 form is limited to 8192 bytes.',
                ),
              ],
            ],
          ),
          text(
            t(
              'Les champs numériques acceptent la saisie, l’effacement et le collage. Au clic, toutes les valeurs doivent respecter leurs bornes ; un événement unique transmet le formulaire complet. Il n’y a pas d’événement par touche. Le callback doit rendre la main rapidement ; une perte de partie masque les fenêtres et invalide les événements.',
              'Integer fields support typing, deletion and pasting. On a button click, every value must satisfy its bounds; one event carries the complete form. There is no event per keystroke. The callback should return promptly; losing the game session hides windows and invalidates events.',
            ),
          ),
          text(
            t(
              'Le titre, le message, les libellés de champs et les boutons acceptent tr. Une fenêtre déjà ouverte suit le changement de langue du jeu sans nouvel événement open : la saisie en cours, même vide, la sélection du texte et une demande en attente sont conservées. Seul un nouveau showWindow remplace le formulaire par les valeurs que votre mod fournit.',
              'The title, message, field labels and buttons accept tr. An already open window follows game language changes without another open event: current input, even when empty, text selection and a pending request are preserved. Only a new showWindow replaces the form with the values supplied by your mod.',
            ),
          ),
        ],
      },
      {
        id: 'calendrier',
        title: t('Lire et modifier le calendrier', 'Read and change the calendar'),
        blocks: [
          table(
            [t('Fonction ou type', 'Function or type'), t('Contrat', 'Contract')],
            [
              [
                literal('clock(): ToolClock'),
                t(
                  'Observation fraîche de la partie courante : utcSeconds est une date Unix en secondes ; elapsedMillis est le temps simulé écoulé en millisecondes. Cette lecture ne capture pas tout le réseau.',
                  'Fresh observation of the current session: utcSeconds is a Unix date in seconds; elapsedMillis is elapsed simulation time in milliseconds. This operation does not capture the entire network.',
                ),
              ],
              [
                literal('GameDateTime · ToolClock.dateTime()'),
                t(
                  'Calendrier grégorien UTC, années 1 à 9999, mois 1 à 12. Les jours impossibles sont refusés. Aucun fuseau Windows ni décalage visuel du jeu n’est ajouté. toUtcSeconds et fromUtcSeconds convertissent sans écrire dans le jeu.',
                  'UTC Gregorian calendar, years 1 to 9999 and months 1 to 12. Impossible dates are rejected. No Windows timezone or game display offset is added. toUtcSeconds and fromUtcSeconds convert without writing to the game.',
                ),
              ],
              [
                literal('changeTime(date: GameDateTime, recalculateTrains = false)'),
                t(
                  'Applique la date choisie. Sans recalcul, conserve les positions et translate les échéances relatives. Cela ne simule pas les journées sautées. Les fractions de seconde sont conservées ; la surcharge en secondes UTC reste disponible.',
                  'Applies the selected date. Without recalculation, it preserves positions and shifts relative deadlines. Skipped days are not simulated. Fractions of a second are preserved; the UTC-seconds overload remains available.',
                ),
              ],
              [
                literal('recalculateTrains = true'),
                t(
                  'Demande en plus les interventions natives sur les trains. Elles peuvent déplacer les trains et coûter de l’argent. Ce choix doit être explicite dans votre interface.',
                  'Also requests native interventions on trains. They may move trains and cost money. This choice must be explicit in your interface.',
                ),
              ],
              [
                literal('ToolTimeChange(clock, interventions)'),
                t(
                  'Horloge retournée après application et nombre d’interventions natives. Une erreur ou un délai dépassé n’est pas une preuve qu’aucun effet n’a eu lieu.',
                  'Clock returned after application and count of native interventions. An error or timeout does not prove that no effect occurred.',
                ),
              ],
            ],
          ),
          code(
            'val target = GameDateTime(2026, 9, 28, 12, 0, 0)\n// Call only after your own confirmation step.\nval result = changeTime(target, recalculateTrains = false)\nlog("Applied UTC=${result.clock.dateTime()}; interventions=${result.interventions}")',
            t('Dans le callback de confirmation', 'Inside the confirmation callback'),
          ),
          text(
            t(
              'BB Timechange propose un seul mode : le changement avec interventions natives sur les trains, qui peuvent les déplacer et entraîner des coûts. Son flux est : lire, saisir six champs, afficher les effets, confirmer une seule fois, relire. Le SDK conserve aussi le mode sans intervention pour les autres outils. Le mod consomme la commande avant l’appel natif pour ne jamais la rejouer après une réponse incertaine. Conservez les données et la session de la confirmation, jamais le ToolContext. Remettez les confirmations à zéro à l’arrêt et au changement de partie.',
              'BB Timechange offers one mode: changing time with native train interventions, which may move trains and incur costs. Its flow is: read, fill six fields, display the effects, confirm once, read again. The SDK also retains the mode without interventions for other tools. The mod consumes the command before the native call so it never replays it after an uncertain response. Keep confirmation data and session identity, never the ToolContext. Reset confirmations on stop and session changes.',
            ),
          ),
          note(
            t(
              'Testez les dates impossibles, la confirmation consommée une seule fois, les événements périmés et une réponse incertaine. Relisez l’horloge après application ; le calendrier ne remet pas à zéro le temps simulé écoulé. Revenir à une ancienne heure n’annule ni les interventions ni les coûts et ne restaure pas une sauvegarde.',
              'Test impossible dates, a confirmation consumed exactly once, stale events and an uncertain response. Read the clock after applying; the calendar does not reset elapsed simulation time. Returning to an earlier hour undoes neither interventions nor costs and does not restore a save.',
            ),
          ),
          links(
            {
              label: t('Préparer le projet', 'Prepare the project'),
              to: '/commencer/installation',
            },
            {
              label: t('Tous les contrôles et leurs textes', 'All controls and their text'),
              to: '/mods/interface',
            },
          ),
        ],
      },
    ],
  },
]

toolAuthoring.push(
  {
    slug: 'mods/parcours-voies',
    group: 'Créer un mod',
    status: 'experimental',
    title: t('Parcourir les voies avec ToolTopology', 'Traverse tracks with ToolTopology'),
    description: t(
      'Distances, raccordements, aiguilles et sens de circulation sans interpréter le moteur du jeu.',
      'Distances, connections, junctions and travel direction without interpreting the game engine.',
    ),
    sections: [
      {
        id: 'copie',
        title: t('Préparer une copie de travail', 'Prepare a working copy'),
        blocks: [
          text(
            t(
              'Prérequis : un service d’outil et un signal source connu. L’objectif est de trouver une position à une distance donnée devant ce signal, ou de refuser lorsque les données ne permettent pas de conclure. Dans le callback, lisez network() puis appelez topology() une fois. Réutilisez cette copie pendant le calcul et les renouvellements d’aperçu ; elle ne garantit pas que la partie reste inchangée.',
              'Prerequisites: a tool service and a known source signal. The goal is to find a position a given distance ahead of that signal, or refuse when data cannot support a result. In the callback, read network(), then call topology() once. Reuse this copy during calculation and preview renewals; it does not guarantee the game remains unchanged.',
            ),
          ),
          table(
            [t('Élément public', 'Public element'), t('Interprétation', 'Meaning')],
            [
              [
                literal('ToolRouteTrack.lengthM'),
                t(
                  'Longueur observée en mètres. Une voie sans longueur fiable est omise de ToolTopology, ainsi que ses signaux.',
                  'Observed length in metres. ToolTopology omits a track without a reliable length, together with its signals.',
                ),
              ],
              [
                literal('ToolTrackEnd.A / B'),
                t(
                  'Extrémités géométriques de la voie, indépendantes du sens du train.',
                  'Geometric ends of the track, independent of train direction.',
                ),
              ],
              [
                literal('ToolTrackConnection.Join(trackId, entry)'),
                t(
                  'Raccord réciproque vers une voie connue ; entry indique par quelle extrémité elle est abordée. En entrant par A, le parcours continue vers B, et inversement.',
                  'A reciprocal connection to a known track; entry identifies the end used to enter it. Entering through A continues toward B, and vice versa.',
                ),
              ],
              [
                literal('ToolTrackConnection.Junction / Unknown'),
                t(
                  'Une aiguille demande une politique de route explicite. Unknown ne prouve pas une fin de voie : arrêtez le calcul sans inventer de continuation.',
                  'A junction requires an explicit routing policy. Unknown does not prove a dead end: stop the calculation without inventing a continuation.',
                ),
              ],
              [
                literal('junctionOffsetsM'),
                t(
                  'Positions des aiguilles depuis A, en mètres, triées. Contrôlez aussi celles qui se trouvent à l’intérieur de la voie, pas seulement les raccords aux extrémités.',
                  'Sorted junction positions in metres from A. Also check junctions inside the track, not only endpoint connections.',
                ),
              ],
              [
                literal('ToolSignal.travelDirection / placementAt(...)'),
                t(
                  'Le sens normalisé vaut +1 de A vers B et −1 de B vers A. placementAt convertit ce sens pour le modèle source et produit une position utilisable par l’aperçu et la pose. Ne testez pas kind pour retourner vous-même la direction.',
                  'Normalized direction is +1 from A to B and −1 from B to A. placementAt converts that direction for the source model and returns a position usable for both preview and placement. Do not inspect kind to reverse directions yourself.',
                ),
              ],
            ],
          ),
        ],
      },
      {
        id: 'exemple',
        title: t('Un parcours volontairement borné', 'A deliberately bounded traversal'),
        blocks: [
          code(
            topologyExample,
            t('ToolTopology.kt — fonction pure', 'ToolTopology.kt — pure function'),
          ),
          text(
            t(
              'L’exemple cherche une position à une distance donnée devant la source. Il suit seulement les raccords simples, refuse les extrémités exactes, s’arrête à toute aiguille ou donnée inconnue et limite le nombre de voies visitées. Il retourne null si cette politique ne permet pas de conclure. Il ne vérifie ni occupation, ni espacement avec d’autres signaux, ni validité d’une commande de construction ; ajoutez ces règles à votre planificateur.',
              'The example finds a position a given distance ahead of the source. It follows only simple connections, rejects exact endpoints, stops at every junction or unknown value, and bounds the number of visited tracks. It returns null when this policy cannot determine a position. It checks neither occupancy nor spacing from other signals nor construction-command validity; add those rules to your planner.',
            ),
          ),
          note(
            t(
              'Avant une pose : prepareConstruction, puis nouvelle capture, puis nouveau calcul et comparaison avec le plan approuvé. Si les positions, la source ou la session ont changé, montrez le nouveau plan et demandez une nouvelle confirmation. Un plan conservé en mémoire ne remplace jamais cette validation.',
              'Before building: prepareConstruction, then a fresh capture, then recalculate and compare against the approved plan. If positions, source or session have changed, show the new plan and request another confirmation. A stored plan never replaces this validation.',
            ),
          ),
          links(
            {
              label: t('Cycle complet de l’outil', 'Complete tool lifecycle'),
              to: '/mods/cycle-outils',
            },
            {
              label: t('Référence ToolTopology', 'ToolTopology reference'),
              to: '/reference/native/nimby/tooltopology',
            },
          ),
        ],
      },
    ],
  },
  {
    slug: 'mods/cycle-outils',
    group: 'Créer un mod',
    status: 'experimental',
    title: t(
      'Aperçu, confirmation et suivi d’une opération',
      'Preview, confirmation and operation tracking',
    ),
    description: t(
      'Construire une interface réactive qui attend sans perdre le plan et ne rejoue jamais une commande incertaine.',
      'Build a responsive interface that waits without losing the plan and never replays an uncertain command.',
    ),
    sections: [
      {
        id: 'etats',
        title: t(
          'Séparer le calcul, l’affichage et la commande',
          'Separate calculation, presentation and commands',
        ),
        blocks: [
          text(
            t(
              'Prérequis : un service qui reçoit une SignalActionRequest et un calcul de positions borné. Ce guide construit un cycle dans lequel le joueur voit un plan, le confirme, puis reçoit le résultat réel de la commande. Vérifiez la source, worldId, generation et l’état local du panneau. Une saisie, une source ou une session différente invalide immédiatement la confirmation précédente.',
              'Prerequisites: a service receiving a SignalActionRequest and a bounded position calculation. This guide builds a lifecycle in which the player sees a plan, confirms it, then receives the actual command outcome. Check the source, worldId, generation and local panel state. Different input, source or session immediately invalidates earlier confirmation.',
            ),
          ),
          text(t(
            'Une requête déjà reçue ne doit pas appliquer un nouveau plan sans confirmation. Les copies de réseau, positions et tickets peuvent rester dans votre état local ; ToolContext et les objets qui le capturent ne doivent pas survivre au callback. Utilisez le nouveau contexte du prochain événement ou onTick pour poursuivre.',
            'An already received request must not apply a new plan without confirmation. Network copies, positions and tickets may remain in local state; ToolContext and objects capturing it must not outlive the callback. Use the next event or onTick’s new context to continue.',
          )),
          table(
            [t('État de l’outil', 'Tool state'), t('Action autorisée', 'Allowed action')],
            [
              [
                t('Calcul demandé', 'Calculation requested'),
                t(
                  'Lire une fois le réseau, construire un plan borné, garder les valeurs copiées. Aucun ticket n’est une obligation de construire.',
                  'Read the network once, compute a bounded plan and retain copied values. A ticket never obliges the tool to build.',
                ),
              ],
              [
                t('Présentation en attente', 'Presentation pending'),
                t(
                  'Réessayer la lecture ou la présentation au prochain onTick. Garder Appliquer désactivé et ne pas lancer une commande à la place du clic.',
                  'Retry the read or presentation on a later onTick. Keep Apply disabled and never submit a command in place of a click.',
                ),
              ],
              [
                t('Aperçu publié', 'Preview published'),
                t(
                  'Renouveler les mêmes positions sans capturer tout le réseau à chaque tick. Avant le clic de pose, préparer puis relire et comparer.',
                  'Renew the same positions without capturing the whole network each tick. Before a build command, prepare, read again and compare.',
                ),
              ],
              [
                t('Commande envoyée', 'Command submitted'),
                t(
                  'Conserver le ticket et interdire toute seconde soumission. Tant que le résultat est incertain, seuls les appels de suivi sont renouvelés.',
                  'Retain the ticket and prevent a second submission. While the outcome is uncertain, repeat only status polling.',
                ),
              ],
              [
                t('Panneau fermé', 'Panel closed'),
                t(
                  'Révoquer l’aperçu et les clics locaux ; continuer à suivre une commande déjà envoyée. Fermer n’annule pas une pose.',
                  'Revoke the preview and local clicks; keep tracking an already submitted command. Closing does not cancel construction.',
                ),
              ],
            ],
          ),
        ],
      },
      {
        id: 'busy',
        title: t('Traiter une indisponibilité temporaire', 'Handle a temporary refusal'),
        blocks: [
          text(
            t(
              'ToolOperationException.isBusy indique que l’opération ne peut pas être servie maintenant. Ce n’est pas un défaut permanent du modèle. Une lecture, showSignalPreview, clearSignalPreview ou showPanel peut être retentée lors d’un prochain callback, au plus une tentative par tick. Conservez un drapeau de travail restant et rendez la main ; n’ajoutez ni boucle d’attente, ni temporisation bloquante, ni file de tentatives illimitée.',
              'ToolOperationException.isBusy means the operation cannot be served right now. It is not a permanent model defect. A read, showSignalPreview, clearSignalPreview or showPanel can be retried in a later callback, at most once per tick. Keep a flag for remaining work and return; do not add a waiting loop, blocking delay or unbounded retry queue.',
            ),
          ),
          text(
            t(
              'Un refus de publication ne renouvelle pas l’ancien aperçu. Un refus de clear ne confirme pas son retrait : révoquez d’abord l’autorisation locale de poser et gardez le nettoyage à faire. Un refus de panneau n’autorise pas un clic resté dans l’ancien panneau. Les autres erreurs demandent un diagnostic et l’abandon du plan périmé ; ne classez pas toutes les exceptions comme Busy. Même log peut échouer temporairement : un diagnostic ne doit pas modifier l’état de votre opération ni provoquer une nouvelle boucle de diagnostics.',
              'A refused publication does not renew the old preview. A refused clear does not confirm removal: first revoke local permission to build and retain pending cleanup. A refused panel does not authorize a click from the old panel. Other errors require diagnosis and abandoning the stale plan; do not classify every exception as Busy. Even log can fail temporarily: diagnostics must not alter operation state or trigger another diagnostic loop.',
            ),
          ),
          note(
            t(
              'Une écriture est différente. Après createSignals, undoConstruction ou changeTime, une réponse perdue ou refusée ne démontre pas l’absence d’effet. Ne rejouez jamais automatiquement la commande, y compris quand l’exception porte isBusy.',
              'A write is different. After createSignals, undoConstruction or changeTime, a lost or refused response does not prove the absence of effects. Never replay the command automatically, including when the exception has isBusy.',
            ),
          ),
        ],
      },
      {
        id: 'apercu',
        title: t('Un exemple sans construction', 'An example without construction'),
        blocks: [
          code(
            previewExample,
            t(
              'PreviewTool.kt — aperçu et reprise de présentation',
              'PreviewTool.kt — preview and presentation recovery',
            ),
          ),
          text(
            t(
              'Cet outil de démonstration répartit des marqueurs sur la voie source. Il n’offre aucun bouton de pose. Après Busy sur lecture, effacement, aperçu ou panneau, il garde seulement le travail de présentation et reprend au tick suivant. Une fois les positions calculées, leur renouvellement ne relit pas le réseau. Le changement de génération détruit le plan local et onStop libère l’état.',
              'This demonstration tool distributes markers along the source track. It offers no build button. After Busy on read, clear, preview or panel, it keeps only presentation work and resumes on the next tick. Once positions are calculated, renewing them does not reread the network. A generation change discards the local plan and onStop releases state.',
            ),
          ),
          text(
            t(
              'Le bail graphique expire après deux secondes sans renouvellement. Le SDK retire aussi les présentations de l’ancien monde ou d’un mod arrêté. Le retour de showSignalPreview confirme une publication, pas la visibilité de chaque marqueur : cadrage, couches et édition du signal source continuent de s’appliquer.',
              'The graphical lease expires after two seconds without renewal. The SDK also retires presentations from an old world or stopped mod. Returning from showSignalPreview confirms publication, not visibility of every marker: framing, layers and editing of the source signal still apply.',
            ),
          ),
        ],
      },
      {
        id: 'ticket',
        title: t(
          'Soumettre une fois, puis suivre le ticket',
          'Submit once, then track the ticket',
        ),
        blocks: [
          code(
            constructionExample,
            t(
              'ConstructionFollower.kt — état séparé de l’interface',
              'ConstructionFollower.kt — state separate from the interface',
            ),
          ),
          text(
            t(
              'Le helper est volontairement incomplet du côté interface : le bouton de votre outil doit vérifier le panneau, l’aperçu, la session et la comparaison fraîche du plan avant confirmCreate. Il marque pending avant l’appel et conserve le ticket même si cet appel lève une exception. Le callback peut afficher « résultat en cours de vérification » puis utiliser tick avec le nouveau contexte. Aucune fermeture, réouverture ou récupération de panneau ne rappelle create ou undo.',
              'This helper deliberately leaves UI policy to the caller: your tool button must check the panel, preview, session and fresh plan comparison before confirmCreate. It marks pending before calling and keeps the ticket even if the call throws. The callback may display “checking outcome” and then call tick with the new context. Closing, reopening or recovering a panel never calls create or undo again.',
            ),
          ),
          table(
            [literal('ConstructionState'), t('Traitement', 'Handling')],
            [
              [
                literal('Ready'),
                t(
                  'Préparation seulement. Un autre outil peut reprendre une préparation inactive à son échéance ; préparez et validez au moment de confirmer.',
                  'Preparation only. Another tool may take over an idle preparation after its deadline; prepare and validate when confirming.',
                ),
              ],
              [
                literal('Pending'),
                t(
                  'Interroger le ticket original avec pollConstruction. Ne pas soumettre une nouvelle pose pour obtenir une réponse.',
                  'Poll the original ticket with pollConstruction. Do not submit another placement to obtain a response.',
                ),
              ],
              [
                literal('Applied / Partial'),
                t(
                  'Examiner createdIds, reason et canUndo. Partial n’est pas un succès complet. Un clic Annuler explicite porte sur ce ticket exact.',
                  'Inspect createdIds, reason and canUndo. Partial is not complete success. An explicit Undo click applies to that exact ticket.',
                ),
              ],
              [
                literal('Undone / Rejected'),
                t(
                  'Afficher le résultat réel et lever l’attente. Ne pas transformer Rejected en confirmation de pose.',
                  'Display the actual result and clear the pending state. Do not treat Rejected as successful placement.',
                ),
              ],
            ],
          ),
          note(
            t(
              'Le suivi doit rester actif même avec le panneau fermé. Le résultat partagé non encore lu est protégé pendant deux secondes après achèvement ; ensuite un autre outil peut le remplacer. Un ticket devenu indisponible n’est jamais une preuve que rien n’a été construit. Inspectez la partie avant une nouvelle action explicite. Une nouvelle préparation peut aussi rendre indisponible l’annulation SDK du précédent outil ; canUndo est une condition nécessaire, et l’appel peut encore refuser si l’historique a changé.',
              'Keep polling even with the panel closed. An unread shared result is protected for two seconds after completion; another tool may replace it afterwards. An unavailable ticket never proves nothing was built. Inspect the game before a new explicit action. A new preparation may also invalidate the previous tool’s SDK undo; canUndo is necessary, and the call may still reject if history has changed.',
            ),
          ),
          links(
            { label: t('Préparer la géométrie', 'Prepare geometry'), to: '/mods/parcours-voies' },
            {
              label: t('Cycle de vie et coût des callbacks', 'Callback lifecycle and cost'),
              to: '/maintenance/performances',
            },
            { label: t('Changer le calendrier', 'Change the calendar'), to: '/mods/horloge' },
          ),
        ],
      },
    ],
  },
)
