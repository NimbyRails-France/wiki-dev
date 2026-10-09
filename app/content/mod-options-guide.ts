import type { Article } from './schema'
import { text, code, note, table, links } from './schema'
import example from './snippets/ModOptions.kt?raw'

export const modOptionsEnglish: Record<string, string> = {}
const t = (fr: string, en: string) => {
  modOptionsEnglish[fr] = en
  return fr
}
const literal = (value: string) => t(value, value)

export const modOptionsGuides: Article[] = [{
  slug: 'mods/options',
  group: 'Créer un mod',
  title: t('Options du mod et raccourcis', 'Mod options and shortcuts'),
  description: t(
    'Déclarer les préférences du joueur, lire leurs valeurs typées et laisser le SDK gérer les raccourcis des fenêtres.',
    'Declare player preferences, read their typed values and let the SDK manage window shortcuts.',
  ),
  status: 'experimental',
  sections: [
    {
      id: 'declarer',
      title: t('Ajouter des options à un mod', 'Add options to a mod'),
      blocks: [
        text(t(
          'Cette API Kotlin/Native appartient à l’édition 0.9 en développement. Un mod enregistre ses objets d’option avec options(...) dans toolMod ou signalMod, y compris la déclaration de plusieurs modèles. Le SDK les présente dans Options → NRF Hub. Un outil qui déclare seulement des fenêtres n’a pas besoin d’ajouter options(...) : ses raccourcis apparaissent automatiquement. Un projet doit utiliser le kit et le SDK d’exécution qui prennent en charge cette API.',
          'This Kotlin/Native API belongs to the 0.9 edition under development. A mod registers its option objects with options(...) inside toolMod or signalMod, including multiple-model declarations. The SDK presents them in Options → NRF Hub. A tool that only declares windows does not need options(...): its shortcuts appear automatically. The project must use a kit and runtime SDK that support this API.',
        )),
        table([t('Rubrique dans Options → NRF Hub', 'Section in Options → NRF Hub'), t('Contenu', 'Content')], [
          [literal('Interface'), t('Préférences déclarées avec options(...) : cases à cocher, valeurs numériques et listes de choix.', 'Preferences declared with options(...): checkboxes, numeric values and choices.')],
          [t('Raccourcis', 'Shortcuts'), t('Raccourcis des fenêtres déclarées avec window(...), à personnaliser ou à désactiver.', 'Shortcuts for windows declared with window(...), which the player can customize or disable.')],
        ]),
        text(t(
          'Seules les rubriques correspondant aux réglages des mods chargés apparaissent. S’il n’y a que des raccourcis, ils s’affichent directement sous le titre Raccourcis ; s’il n’y a que des préférences, elles s’affichent directement sous Interface. Les boutons de navigation apparaissent uniquement lorsque les deux rubriques sont utiles. Chaque rubrique regroupe les réglages par mod et utilise ses libellés ; aucune interface de réglages supplémentaire à créer dans le mod.',
          'Only sections matching the loaded mods’ settings appear. If there are only shortcuts, they appear directly under Shortcuts; if there are only preferences, they appear directly under Interface. Navigation buttons appear only when both sections are needed. Each section groups settings by mod and uses its labels; the mod does not need to create an additional settings interface.',
        )),
        text(t(
          'Dans un projet Kotlin/Native créé avec le kit, remplacez Entry.kt par cet exemple et utilisez le manifeste ci-dessous. Le plugin génère modInfo depuis mod.json : toolMod(modInfo) garde l’identité Kotlin et celle du paquet cohérentes. Le titre de groupe sera Clock tools dans cet exemple ; metadata(name = tr("mod.name")) fournit séparément le nom traduit dans la liste des mods du jeu.',
          'In a Kotlin/Native project created with the kit, replace Entry.kt with this example and use the manifest below. The plugin generates modInfo from mod.json: toolMod(modInfo) keeps the Kotlin and package identities consistent. The group title in this example is Clock tools; metadata(name = tr("mod.name")) separately supplies the translated name in the game’s mod list.',
        )),
        code(JSON.stringify({
          id: 'clock-history', name: 'Clock tools', modId: 'ClockHistory', version: '0.1.0-alpha.1',
          module: 'ClockHistoryMod', language: 'kotlin-native', sdkMin: '0.9.0-alpha.1', sdkMaxExclusive: '0.10.0',
          gameSha256: ['fff49ac21720abfc824c2b4f68b862727630eb0db71cfe1f9ea8f685d0db10ae'],
        }, null, 2), literal('mod.json'), 'json'),
        code(example, literal('src/main/kotlin/Entry.kt')),
        text(t(
          'L’ouverture et le bouton Ajouter une lecture ajoutent une observation de l’horloge. Actualiser l’affichage relit les préférences sans ajouter de lecture. Le joueur choisit le nombre de lignes conservées, leur ordre et le texte affiché. Le mod lit .value pendant le callback, puis limite son historique à vingt lectures maximum. L’historique est effacé lors d’un changement de partie ou de l’arrêt du mod ; les préférences restent enregistrées par le SDK.',
          'Opening the window and the Add a reading button record a clock observation. Refresh display reads the preferences without adding a reading. The player chooses the number of retained rows, their order and the displayed text. The mod reads .value during the callback, then limits its history to at most twenty readings. History is cleared when the game session changes or the mod stops; the SDK keeps the saved preferences.',
        )),
        code(JSON.stringify({ fallback: 'en', languages: {
          en: { 'mod.name': 'Clock tools', 'mod.description': 'Keep a short history of clock readings.', 'window.history': 'Reading history', 'options.showDate': 'Show dates', 'options.historySize': 'Number of readings', 'options.order': 'Reading order', 'options.newest': 'Newest first', 'options.oldest': 'Oldest first', 'history.sample': 'Add a reading', 'history.refresh': 'Refresh display' },
          fr: { 'mod.name': 'Outils d’horloge', 'mod.description': 'Conserver un court historique des lectures de l’horloge.', 'window.history': 'Historique des lectures', 'options.showDate': 'Afficher les dates', 'options.historySize': 'Nombre de lectures', 'options.order': 'Ordre des lectures', 'options.newest': 'Plus récentes en premier', 'options.oldest': 'Plus anciennes en premier', 'history.sample': 'Ajouter une lecture', 'history.refresh': 'Actualiser l’affichage' },
        } }, null, 2), literal('assets/translations.json'), 'json'),
        note(t(
          'Une option appartient au mod entier. Pour une valeur différente sur chaque signal, utilisez les réglages du signal ; pour une saisie temporaire dans un formulaire, utilisez ToolNumberInput. options(...) accepte au maximum 64 options, raccourcis de fenêtres compris.',
          'An option belongs to the entire mod. For a separate value on each signal, use signal settings; for temporary form input, use ToolNumberInput. options(...) supports at most 64 options, including window shortcuts.',
        )),
      ],
    },
    {
      id: 'libelles',
      title: t('Nommer le groupe, la fenêtre et les options', 'Name the group, window and options'),
      blocks: [
        text(t(
          'Le nom du mod et le titre de sa fenêtre ont deux rôles distincts. Dans Raccourcis, le SDK affiche d’abord le groupe du mod, puis le titre de chaque fenêtre et sa combinaison de touches. Voir BB Timechange puis Date et heure décrit donc un groupe et une action, pas deux installations du mod.',
          'The mod name and its window title have distinct roles. In Shortcuts, the SDK first shows the mod group, followed by each window’s title and key combination. Seeing BB Timechange followed by Date and time therefore describes one group and one action, not two installations of the mod.',
        )),
        table([t('Élément affiché', 'Displayed element'), t('Source dans le mod', 'Source in the mod'), t('Exemple', 'Example')], [
          [t('Groupe du mod', 'Mod group'), literal('toolMod(modInfo) → modInfo.title → mod.json.name'), literal('Clock tools')],
          [t('Nom dans la liste des mods du jeu', 'Name in the game’s mod list'), literal('metadata(name = tr("mod.name"))'), t('Outils d’horloge', 'Clock tools')],
          [t('Fenêtre et son raccourci', 'Window and its shortcut'), literal('window(..., title = tr("window.history"))'), t('Historique des lectures', 'Reading history')],
          [t('Préférence', 'Preference'), literal('BooleanOption.label / IntegerOption.label / ChoiceOption.label'), t('Afficher les dates — tr("options.showDate")', 'Show dates — tr("options.showDate")')],
          [t('Valeur d’une liste de choix', 'Choice label'), literal('OptionChoice.label'), t('Plus récentes en premier — tr("options.newest")', 'Newest first — tr("options.newest")')],
        ]),
        text(t(
          'Le groupe utilise GameMod.title : avec toolMod(modInfo) ou signalMod(modInfo), il vient du champ name de mod.json. mod.name et window.history sont ici des clés de traduction choisies par l’auteur pour les autres libellés. Le SDK n’ajoute pas automatiquement le nom du mod au titre de la fenêtre. Donnez au groupe le nom du produit et à chaque fenêtre un titre court qui décrit sa fonction. Si la clé window.history contient déjà le nom du mod, ce nom sera affiché une seconde fois dans sa rubrique.',
          'The group uses GameMod.title: with toolMod(modInfo) or signalMod(modInfo), it comes from the name field in mod.json. mod.name and window.history are translation keys chosen by the author for the other labels in this example. The SDK does not automatically add the mod name to the window title. Give the group the product name and each window a short title describing its purpose. If window.history already contains the mod name, that name will appear again within its section.',
        )),
        text(t(
          'metadata(name = ...) sert aux informations du mod destinées à la liste des mods du jeu ; ce paramètre ne remplace pas le title utilisé pour le groupe dans Options → NRF Hub. Utilisez tr(...) et assets/translations.json pour traduire les noms visibles, en gardant les identifiants inchangés.',
          'metadata(name = ...) supplies mod information for the game’s mod list; it does not replace the title used for the group in Options → NRF Hub. Use tr(...) and assets/translations.json to translate visible names while keeping identifiers unchanged.',
        )),
      ],
    },
    {
      id: 'types',
      title: t('Choisir le bon type', 'Choose the right type'),
      blocks: [
        table([t('Déclaration', 'Declaration'), t('Valeur et validation', 'Value and validation')], [
          [literal('BooleanOption'), t('value est un Boolean. La valeur par défaut est false si elle est omise.', 'value is a Boolean. The default is false when omitted.')],
          [literal('IntegerOption'), t('value est un Int compris entre minimum et maximum inclus. La valeur par défaut doit respecter ces bornes.', 'value is an Int between minimum and maximum, inclusive. The default must satisfy these bounds.')],
          [literal('ChoiceOption'), t('Deux à seize OptionChoice distincts. value renvoie l’identifiant stable du choix, jamais son libellé traduit. defaultValue doit désigner un choix existant.', 'Two to sixteen distinct OptionChoice entries. value returns the stable choice ID, never its translated label. defaultValue must name an existing choice.')],
          [literal('window(..., shortcut = ...)'), t('Chaque fenêtre possède automatiquement son raccourci configurable. Une chaîne vide le désactive ; le SDK ouvre la fenêtre et appelle son handler.', 'Each window automatically has its configurable shortcut. An empty string disables it; the SDK opens the window and calls its handler.')],
        ]),
        text(t(
          'L’id d’une option ou d’un OptionChoice doit commencer par une lettre ASCII, puis utiliser uniquement des lettres ASCII, chiffres, _, . ou -, sur 128 caractères maximum. Les identifiants d’options sont uniques dans le mod ; les identifiants de choix sont uniques dans leur liste. Le préfixe window. est réservé au SDK pour les options de raccourci. Les libellés acceptent tr et sont limités à 256 octets UTF-8 ; description est facultative, accepte tr et permet 1024 octets.',
          'An option or OptionChoice id must start with an ASCII letter and then use only ASCII letters, digits, _, . or -, up to 128 characters. Option IDs are unique within the mod; choice IDs are unique within their list. The SDK reserves the window. prefix for shortcut options. Labels accept tr and are limited to 256 UTF-8 bytes; description is optional, accepts tr and allows 1024 bytes.',
        )),
        note(t(
          'Une déclaration invalide échoue avec IllegalArgumentException : identifiant ou libellé invalide, doublon, bornes incohérentes, valeur par défaut hors limites ou choix absent. Corrigez la déclaration avant de distribuer le mod. Il s’agit d’une erreur d’auteur, distincte du refus d’une affectation en conflit choisie par le joueur : ce dernier conserve son ancien réglage et reçoit un message dans le jeu.',
          'An invalid declaration fails with IllegalArgumentException: invalid ID or label, duplicate, inconsistent bounds, out-of-range default or missing choice. Fix the declaration before distributing the mod. This is an authoring error, distinct from rejecting a conflicting assignment chosen by the player: the player keeps the previous setting and receives an in-game message.',
        )),
        text(t(
          'Conservez les mêmes objets d’option que ceux enregistrés avec options(...). .value est en lecture seule, sans lecture du réseau ni du disque. Le SDK actualise les valeurs entre les callbacks ; une modification invalide ne remplace pas les valeurs déjà acceptées. Lire .value dans une règle de signal est possible sans ToolContext.',
          'Keep the same option objects that you registered with options(...). .value is read-only and reads neither the network nor disk. The SDK updates values between callbacks; an invalid change does not replace previously accepted values. A signal rule can read .value without ToolContext.',
        )),
        text(t(
          'À la création de l’objet, .value vaut defaultValue. Les préférences enregistrées sont ensuite appliquées par le SDK. Lisez .value au moment de traiter une action ou de calculer une règle : une copie faite à l’initialisation du fichier Kotlin conserverait seulement cette ancienne valeur. Déclarer deux objets avec le même id ne les lie pas entre eux et leur enregistrement en double est refusé.',
          'When an object is created, .value equals defaultValue. The SDK subsequently applies saved preferences. Read .value when handling an action or calculating a rule: a copy made during Kotlin file initialization would retain that earlier value. Declaring two objects with the same id does not link them, and registering duplicate IDs is rejected.',
        )),
        note(t(
          'Cette API ne déclare pas de callback onChange. Une modification des préférences ne redessine pas automatiquement le formulaire de votre outil. Dans l’exemple, le prochain clic ou la prochaine ouverture lit les valeurs courantes et renvoie le formulaire avec showWindow. Une règle de signal les lit lors de son prochain calcul.',
          'This API does not declare an onChange callback. Changing preferences does not automatically redraw your tool’s form. In the example, the next click or opening reads current values and returns the form with showWindow. A signal rule reads them during its next calculation.',
        )),
      ],
    },
    {
      id: 'raccourcis',
      title: t('Confier les raccourcis au SDK', 'Let the SDK manage shortcuts'),
      blocks: [
        text(t(
          'Chaque window(id, title, shortcut, handler) ajoute automatiquement une option de raccourci ; aucune option supplémentaire à déclarer. shortcut est sa valeur par défaut ; le joueur peut la modifier ou la désactiver dans Options → NRF Hub, rubrique Raccourcis, sous le nom du mod. Un identifiant de fenêtre stable conserve la préférence lorsque vous réorganisez les déclarations. Cette version propose les raccourcis d’ouverture des fenêtres, sans callback de touche général.',
          'Each window(id, title, shortcut, handler) automatically adds a shortcut option; no additional option declaration is needed. shortcut is its default; the player can change or disable it under the mod’s name in the Shortcuts section of Options → NRF Hub. A stable window ID preserves the preference when you reorder declarations. This version provides window-opening shortcuts without a general key callback.',
        )),
        code('window("history", tr("window.history"), shortcut = "F9") { event ->\n    showWindow(event, clock().dateTime().toString(), emptyList())\n}', t('Valeur initiale d’un raccourci de fenêtre', 'Initial value of a window shortcut')),
        text(t(
          'L’identifiant history reste indépendant du titre traduit. Pour cet identifiant, le SDK crée l’option réservée window.history ; vous ne la déclarez pas et n’écrivez pas son fichier de préférences. Gardez l’id passé à window stable pour conserver l’affectation, même si le titre ou l’ordre des fenêtres change. Un mod peut déclarer huit fenêtres au maximum ; leurs identifiants sont uniques, de 1 à 128 caractères ASCII parmi lettres, chiffres, _, . et -. Deux fenêtres du même mod ne peuvent pas déclarer le même raccourci initial non vide ; plusieurs raccourcis vides sont permis.',
          'The history identifier is independent of the translated title. For this ID, the SDK creates the reserved window.history option; you neither declare it nor write its preferences file. Keep the id passed to window stable to preserve the assignment even when its title or window order changes. A mod can declare at most eight windows; their IDs are unique, with 1 to 128 ASCII letters, digits, _, . or -. Two windows in the same mod cannot declare the same nonempty initial shortcut; multiple empty shortcuts are allowed.',
        )),
        text(t(
          'Format : Ctrl+, Alt+, Shift+ dans cet ordre, chacun facultatif, puis une touche. Touches disponibles : A–Z, 0–9, F1–F24, Backspace, Tab, Enter, Escape, Space, Left, Right, Up, Down, Home, End, PageUp, PageDown, Insert et Delete. Exemples : F8, Ctrl+T, Alt+F12, Ctrl+Alt+Shift+F24. Une chaîne vide désactive le raccourci.',
          'Format: Ctrl+, Alt+, Shift+ in that order, each optional, followed by a key. Supported keys: A–Z, 0–9, F1–F24, Backspace, Tab, Enter, Escape, Space, Left, Right, Up, Down, Home, End, PageUp, PageDown, Insert and Delete. Examples: F8, Ctrl+T, Alt+F12, Ctrl+Alt+Shift+F24. An empty string disables the shortcut.',
        )),
        text(t(
          'Le SDK vérifie les raccourcis du jeu et ceux des mods chargés. Une affectation en conflit est refusée et l’ancienne valeur est conservée. Un conflit déjà présent désactive le déclenchement concerné jusqu’à sa résolution. Si les raccourcis du jeu ne peuvent pas être vérifiés, leur utilisation reste suspendue. Les raccourcis ne doivent pas ouvrir d’outil pendant la saisie de texte, la capture d’un raccourci ou lorsque le jeu est en arrière-plan.',
          'The SDK checks the game bindings and those of loaded mods. A conflicting assignment is rejected and the previous value is retained. An existing conflict disables the affected trigger until resolved. If game bindings cannot be verified, shortcut use remains suspended. Shortcuts must not open a tool during text entry, shortcut capture or while the game is in the background.',
        )),
        text(t(
          'Une combinaison valide n’est pas nécessairement libre : F9 est une valeur d’exemple, pas une touche réservée à votre mod. Les vérifications tiennent compte des affectations actuelles du joueur. Certaines actions natives réservent aussi les variantes avec Ctrl, Alt ou Maj ; ajouter un modificateur ne garantit donc pas l’absence de conflit. Le message Déjà utilisé par indique l’action concernée.',
          'A valid combination is not necessarily available: F9 is an example default, not a key reserved for your mod. Checks account for the player’s current assignments. Some native actions also reserve Ctrl, Alt or Shift variants, so adding a modifier does not guarantee an unused combination. The Already used by message identifies the conflicting action.',
        )),
        text(t(
          'Pour modifier une affectation, le joueur clique sur le raccourci actuel ou Attribuer un raccourci, puis appuie sur la combinaison souhaitée. Échap annule la capture ; Retour arrière ou Effacer le raccourci désactive l’affectation. Ces deux touches servent au dialogue de capture et ne s’y attribuent pas comme un raccourci ordinaire. La fermeture du panneau ou la sortie de Raccourcis annule la capture. Un appui maintenu ne répète pas l’ouverture de la fenêtre.',
          'To change an assignment, the player clicks the current shortcut or Assign a shortcut, then presses the desired combination. Escape cancels capture; Backspace or Clear shortcut disables the assignment. Those two keys control the capture dialogue and are not assigned there as ordinary shortcuts. Closing the panel or leaving Shortcuts cancels capture. Holding a key does not repeatedly open the window.',
        )),
      ],
    },
    {
      id: 'conservation',
      title: t('Conserver les choix du joueur', 'Preserve player choices'),
      blocks: [
        text(t(
          'Les préférences sont propres à l’utilisateur et au mod, communes à ses parties. Le SDK prend en charge leur enregistrement et leur chargement. L’identité du mod est GameMod.id, donc modInfo.id issu du champ id de mod.json quand vous utilisez toolMod(modInfo) ou signalMod(modInfo). Le champ modId du manifeste est une autre identité, destinée à la distribution. Gardez stables id, les identifiants d’options et ceux des choix ; traduire un libellé ne change pas l’identité. defaultValue s’applique lorsqu’aucune valeur compatible n’est enregistrée et lors d’une réinitialisation.',
          'Preferences belong to the user and mod and are shared across that user’s games. The SDK handles saving and loading. The mod identity is GameMod.id, hence modInfo.id from the id field in mod.json when using toolMod(modInfo) or signalMod(modInfo). The manifest’s modId field is a separate distribution identity. Keep id, option IDs and choice IDs stable; translating a label does not change identity. defaultValue applies when no compatible value is saved and when resetting an option.',
        )),
        text(t(
          'Changer defaultValue ou shortcut dans une nouvelle version ne remplace pas un choix enregistré encore valide. Si une valeur sort des nouvelles bornes numériques ou si son identifiant de choix n’existe plus, le SDK utilise la valeur par défaut de cette option. Rétablir les valeurs par défaut de ce mod concerne toutes ses préférences et tous ses raccourcis, y compris ceux de l’autre rubrique. Si un raccourci par défaut entre en conflit, la réinitialisation est refusée sans appliquer partiellement les autres valeurs.',
          'Changing defaultValue or shortcut in a new version does not replace a saved choice that remains valid. If a value falls outside new numeric bounds or its choice ID no longer exists, the SDK uses that option’s default. Restore this mod’s defaults covers all its preferences and shortcuts, including those in the other section. If a default shortcut conflicts, the reset is rejected without partially applying the other values.',
        )),
        text(t(
          'Avant de distribuer le mod, vérifiez les valeurs initiales, leur conservation après redémarrage, les bornes numériques, le changement de langue, un raccourci désactivé et un conflit volontaire. Vérifiez aussi qu’un changement de partie ne rejoue pas une demande d’ouverture ancienne.',
          'Before distributing the mod, check initial values, persistence after restart, numeric bounds, language changes, a disabled shortcut and an intentional conflict. Also verify that changing game sessions does not replay an old opening request.',
        )),
        links({ label: t('Référence des options', 'Options reference'), to: '/reference/native/nimby/modoptions' }, { label: t('Fenêtres et horloge', 'Windows and clock'), to: '/mods/horloge' }, { label: t('Réglages par signal', 'Per-signal settings'), to: '/mods/reglages' }),
      ],
    },
  ],
}]
