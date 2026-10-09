import type { Article } from './schema'
import { text, code, note, table, links } from './schema'

// Keep the meaning and its English translation together for these contracts.
export const authoringEnglish: Record<string, string> = {}
const t = (fr: string, en: string) => {
  authoringEnglish[fr] = en
  return fr
}
const literal = (value: string) => t(value, value)

export const authoring: Article[] = [
  {
    slug: 'mods/paquet-genere',
    group: 'Créer un mod',
    title: t('Générer le paquet depuis Kotlin', 'Generate the package from Kotlin'),
    description: t(
      'Transformer un projet Kotlin en paquet contenant son identité, ses modèles et toutes ses images.',
      'Turn a Kotlin project into a package containing its identity, models and every image.',
    ),
    sections: [
      {
        id: 'sources',
        title: t('Ce que vous écrivez, ce qui est généré', 'What you write and what is generated'),
        blocks: [
          text(
            t(
              'Prérequis : un projet configuré et au moins un signalModel à assembler, ou un toolMod qui déclare un service, une fenêtre ou une règle trainEditor. Une règle de composition seule suffit : aucun signal ni bouton fictif n’est nécessaire. Le plugin appelle createMod pour lire vos déclarations et générer le catalogue. Gardez createMod et les initialiseurs sans accès à une partie ni écriture de fichiers.',
              'Prerequisites: a configured project and at least one signalModel to assemble, or a toolMod declaring a service, window or trainEditor rule. A composition rule alone is sufficient: no fictitious signal or button is needed. The plugin calls createMod to read declarations and generate the catalogue. Keep createMod and initializers free of game access or file writes.',
            ),
          ),
          table(
            [t('Source', 'Source'), t('Rôle et destination', 'Purpose and destination')],
            [
              [
                literal('mod.json'),
                t(
                  'Identifiant, nom, version, module et compatibilité. Le Hub le lit avant compilation. Le plugin génère nimby.mod.modInfo : utilisez cette identité dans signalMod(modInfo) ou toolMod(modInfo).',
                  'Identity, name, version, module and compatibility. The Hub reads it before compilation. The plugin generates nimby.mod.modInfo: use that identity in signalMod(modInfo) or toolMod(modInfo).',
                ),
              ],
              [
                literal('metadata(author, description, name)'),
                t(
                  'Auteur et description obligatoires pour générer le paquet ; le nom affiché est facultatif. name et description acceptent tr ; sans name, le nom provient de modInfo. La version complète, suffixe alpha compris, vient de mod.json.',
                  'Author and description are required to generate the package; the display name is optional. name and description accept tr; without name, the name comes from modInfo. The complete version, including its alpha suffix, comes from mod.json.',
                ),
              ],
              [
                literal('construction(states, name, kind, catalogueName)'),
                t(
                  'Catalogue de textures et entrée du menu de construction. Une déclaration par modèle de signal.',
                  'Texture catalogue and construction-menu entry. One declaration per signal model.',
                ),
              ],
              [
                literal('assets/ · imgs/ · config/'),
                t(
                  'Fichiers copiés dans le paquet. assets/closed.svg se déclare closed.svg ; imgs/signals/closed.svg conserve ce chemin.',
                  'Files copied into the package. Declare assets/closed.svg as closed.svg; imgs/signals/closed.svg keeps its path.',
                ),
              ],
              [
                literal('mod.txt · nrf-metadata.json · nrf-mod.ini · project.json'),
                t(
                  'Catalogue du jeu, traductions des métadonnées, manifeste du chargeur et manifeste du Hub. Fichiers générés : ne les éditez pas, la compilation suivante les remplacera.',
                  'Game catalogue, metadata translations, loader manifest and Hub manifest. These are generated files: do not edit them, as the next build replaces them.',
                ),
              ],
            ],
          ),
          code(
            'package nimby.mod\n\nimport nimby.*\n\n// firstSignal est le modèle du premier tutoriel, déclaré dans ce package.\nfun createMod() = signalMod(modInfo) {\n    // modInfo reprend id et name de mod.json ; ne le recréez pas ici.\n    metadata(author = "Votre nom", description = "Mes signaux personnalisés.")\n    signal(firstSignal)\n}',
            t('Assembler le mod', 'Assemble the mod'),
          ),
          note(
            t(
              'firstSignal représente une déclaration signalModel créée dans votre projet. Un outil utilise la même identité et metadata, avec toolMod(modInfo), sans déclarer de signal fictif. Le manifeste mod.json et la version de SDK sélectionnée doivent correspondre à la configuration du projet.',
              'firstSignal represents a signalModel declaration created in your project. A tool uses the same identity and metadata through toolMod(modInfo), without a fictitious signal. The mod.json manifest and selected SDK version must match the project configuration.',
            ),
          ),
        ],
      },
      {
        id: 'construction',
        title: t('Paramètres du catalogue', 'Catalogue parameters'),
        blocks: [
          code(
            'construction(\n    states = listOf("closed.svg", "open.svg"),\n    name = "Mon signal",\n    kind = "path"\n)',
            t('Dans le bloc signalModel', 'Inside the signalModel block'),
          ),
          table(
            [t('Paramètre', 'Parameter'), t('Utilisation précise', 'Exact use')],
            [
              [
                literal('states: List<String>'),
                t(
                  'De 1 à 256 images dans leur ordre définitif. Le SDK ne devine pas les chemins retournés par images ou appearance. Déclarez aussi les deux images de chaque clignotement.',
                  'Between 1 and 256 images in their permanent order. The SDK does not guess paths returned by images or appearance. Also declare both images of each blinking animation.',
                ),
              ],
              [
                literal('name: String'),
                t(
                  'Nom dans le menu de construction. Par défaut, le titre du modèle. Accepte un texte ou tr : la génération résout l’anglais puis la langue de repli du JSON.',
                  'Name in the construction menu. Defaults to the model title. Accepts plain text or tr: generation resolves English, then the JSON fallback language.',
                ),
              ],
              [
                literal('kind: String = "path"'),
                t(
                  'Type natif du signal, écrit dans SignalTemplate. path est utilisé pour nos signaux. Ce champ ne décide ni indication ni vitesse ; un autre type exige de vérifier sa prise en charge dans le jeu.',
                  'Native signal kind, written into SignalTemplate. Our signals use path. This field decides neither indication nor speed; another kind requires checking game support.',
                ),
              ],
              [
                literal('catalogueName: String = name'),
                t(
                  'Nom du jeu de textures dans les choix natifs du jeu ; peut différer du nom du signal constructible.',
                  'Texture-set name in the game’s native selectors; it may differ from the constructible signal name.',
                ),
              ],
              [
                literal('size: Int = 0 · left: Boolean = false'),
                t(
                  'Valeurs initiales proposées à la construction : taille de 0 à 4 et côté gauche si left=true. Pour un modèle de taille 4 à gauche, déclarez ces deux valeurs explicitement. Ce sont des valeurs de catalogue, pas une modification des signaux déjà posés.',
                  'Initial construction choices: size from 0 to 4, and left side when left=true. For a size-4 model on the left, declare both values explicitly. These are catalogue defaults, not changes to existing placed signals.',
                ),
              ],
              [
                literal('nameKey / catalogueNameKey: String?'),
                t(
                  'Clés du système de localisation du jeu pour un catalogue existant. Avec tr(...) dans name ou catalogueName, laissez la clé correspondante à null : les deux mécanismes ne se combinent pas pour le même nom.',
                  'Game localization keys for an existing catalogue. With tr(...) in name or catalogueName, leave its corresponding key null: the two mechanisms cannot be combined for the same name.',
                ),
              ],
            ],
          ),
          note(
            t(
              'Utilisez tr(...) pour les noms constructibles, catalogues, titres et descriptions. Le plugin conserve un texte de repli lisible dans le paquet et prépare les traductions pour la langue du jeu. Le même JSON fournit les textes du mod et de ses contrôles ; les identifiants restent fixes.',
              'Use tr(...) for construction names, catalogues, titles and descriptions. The plugin retains readable fallback text in the package and prepares translations for the game language. The same JSON supplies mod and control text; identifiers remain fixed.',
            ),
          ),
          text(
            t(
              'Conservez textureSet et l’ordre des states d’un catalogue publié, y compris les anciennes images encore référencées par une sauvegarde. Un changement de fichier à un indice existant change l’apparence correspondante ; réordonner les indices peut attribuer la mauvaise image aux signaux déjà posés.',
              'Keep textureSet and the states order of a published catalogue, including old images still referenced by saves. Changing a file at an existing index changes that appearance; reordering indices can assign the wrong image to existing signals.',
            ),
          ),
          table([t('À vérifier', 'Check'), t('Résultat attendu', 'Expected result')], [
            [t('Chaque image retournée par le modèle', 'Every image returned by the model'), t('Son chemin figure dans states et désigne un fichier inclus dans le paquet.', 'Its path appears in states and identifies a file included in the package.')],
            [t('Les deux phases d’un clignotement', 'Both blinking phases'), t('Deux chemins déclarés, même si une seule phase est visible au moment du test.', 'Two declared paths, even when only one phase is visible during the test.')],
            [t('Un ancien catalogue dans une sauvegarde', 'An existing catalogue in a save'), t('Les mêmes identifiants et les mêmes indices désignent toujours les mêmes indications.', 'The same identities and indices still identify the same indications.')],
          ]),
        ],
      },
      {
        id: 'verifier',
        title: t('Compiler et vérifier le résultat', 'Build and inspect the result'),
        blocks: [
          code(
            '.\\gradlew.bat generateDebugGameManifest\n.\\gradlew.bat windowsTest packageMod',
            t('Commandes du projet', 'Project commands'),
            'powershell',
          ),
          text(
            t(
              'Le fichier généré se trouve dans build/gradle/generated/game/debug/mod.txt ou release/mod.txt. Le paquet assemblé contient son mod.txt à la racine. Les tests natifs reçoivent aussi le catalogue généré. Un fichier manquant, un chemin hors du paquet, une ressource ambiguë, un catalogue dupliqué ou un ancien assets/mod.txt bloque la compilation.',
              'The generated file is in build/gradle/generated/game/debug/mod.txt or release/mod.txt. The assembled package contains mod.txt at its root. Native tests also receive the generated catalogue. A missing file, an out-of-package path, an ambiguous resource, a duplicate catalogue or an old assets/mod.txt blocks the build.',
            ),
          ),
          text(
            t(
              'Avant activation, ouvrez le paquet et contrôlez les chemins d’images, le nom du mod, les modèles et leurs valeurs initiales de côté et de taille. Testez chaque indication, y compris les replis et les deux phases d’un clignotement. Les fichiers générés se reconstruisent depuis Kotlin ; ne les corrigez pas manuellement.',
              'Before activation, open the package and check image paths, the mod name, models and their initial side and size choices. Test every indication, including fallbacks and both phases of blinking. Generated files are rebuilt from Kotlin; do not fix them manually.',
            ),
          ),
          links(
            {
              label: t('Construire son premier mod', 'Build your first mod'),
              to: '/commencer/premier-mod',
            },
            {
              label: t('Référence ModResources', 'ModResources reference'),
              to: '/reference/modresources',
            },
          ),
        ],
      },
    ],
  },
  {
    slug: 'mods/interface',
    group: 'Créer un mod',
    title: t('Où apparaissent les textes et les contrôles ?', 'Where do text and controls appear?'),
    description: t(
      'Cases, titres, boutons, champs et messages : leur emplacement, leur durée de vie et leurs événements.',
      'Checkboxes, titles, buttons, fields and messages: location, lifetime and events.',
    ),
    sections: [
      {
        id: 'signal',
        title: t('Panneau du signal sélectionné', 'Selected signal panel'),
        blocks: [
          text(
            t(
              'Prérequis : un modèle déclaré avec signalModel. Ses réglages apparaissent sous les propriétés du signal sélectionné, dans un groupe défilant. Les commandes d’outils sont séparées des réglages persistants. Les longs libellés peuvent défiler horizontalement et les aides reviennent à la ligne. L’ordre des cases suit leur déclaration Kotlin.',
              'Prerequisite: a model declared with signalModel. Its settings appear below the selected signal’s properties in a scrolling group. Tool commands are separate from persistent settings. Long labels can scroll horizontally and help text wraps. Checkbox order follows their Kotlin declaration.',
            ),
          ),
          code(
            'val automatic = checkbox(\n    name = "automatic",\n    label = tr("automatic.label"),\n    description = tr("automatic.help"),\n    defaultValue = true\n)\nrules {\n    if (!enabled(automatic)) Indication(Aspect.Closed, Reason.Disabled)\n    else /* votre décision à partir des observations */ null\n}',
          ),
          table(
            [t('Champ', 'Field'), t('Emplacement et effet', 'Location and effect')],
            [
              [
                literal('SignalType.title'),
                t(
                  'Titre au-dessus des cases de ce modèle. Accepte tr. Ce n’est pas automatiquement le nom du menu de construction : celui-ci vient de construction.name.',
                  'Heading above this model’s checkboxes. Accepts tr. It is not automatically the construction-menu name, which comes from construction.name.',
                ),
              ],
              [
                literal('Checkbox.name'),
                t(
                  'Clé technique enregistrée pour chaque signal posé. Invisible pour le joueur. Ne la renommez pas selon la langue.',
                  'Technical key saved for each placed signal. Invisible to the player. Do not rename it according to the language.',
                ),
              ],
              [
                literal('Checkbox.label'),
                t('Texte à côté de la case. Accepte tr.', 'Text next to the checkbox. Accepts tr.'),
              ],
              [
                literal('Checkbox.description'),
                t(
                  'Texte d’aide sous la case, avec retour à la ligne. Accepte tr. Une chaîne vide ne crée aucune ligne. Il est visible directement, sans survol.',
                  'Help text below the checkbox, with word wrapping. Accepts tr. An empty string creates no row. It is directly visible, without hovering.',
                ),
              ],
              [
                literal('Checkbox.defaultValue'),
                t(
                  'Valeur utilisée avant tout réglage enregistré pour ce signal. Elle ne remplace pas une valeur déjà sauvegardée.',
                  'Value used before any setting has been saved for this signal. It does not replace an existing saved value.',
                ),
              ],
              [
                literal('Checkbox.onlyWhenEnabled'),
                t(
                  'Si true, la case est présentée uniquement tant que sa valeur est vraie. Utile pour un acquittement ; une fois décochée, elle disparaît. Laisser false pour un réglage ordinaire.',
                  'If true, the checkbox is shown only while its value is true. Useful for acknowledgement; once unchecked, it disappears. Leave false for a normal setting.',
                ),
              ],
              [
                literal('enabled(option) / settingsStatus'),
                t(
                  'Vos règles consultent la case ; le SDK ne choisit aucune conséquence. Un signal connu sans valeurs enregistrées reçoit ses défauts et peut être Present. Absent désigne une absence dans le catalogue observé ; Unavailable indique que la lecture ne permet pas de décider et rend l’observation non fraîche.',
                  'Your rules read the checkbox; the SDK chooses no consequence. A known signal without saved values receives its defaults and can be Present. Absent means missing from the observed catalogue; Unavailable means the read cannot support a decision and makes the observation stale.',
                ),
              ],
            ],
          ),
        ],
      },
      {
        id: 'nombres',
        title: t('Valeur persistante ou champ de formulaire ?', 'Persistent value or form input?'),
        blocks: [
          table(
            [t('Besoin', 'Need'), t('API et durée de vie', 'API and lifetime')],
            [
              [
                literal('NumberSetting'),
                t(
                  'Option entière enregistrée pour chaque signal, comme une portée de travaux. Déclarez number(option) dans le modèle et utilisez option.read(settings) dans la règle. Le panneau du signal assure la saisie et la persistance.',
                  'An integer option saved for each signal, such as a work-zone range. Declare number(option) in the model and use option.read(settings) in the rule. The signal panel handles input and persistence.',
                ),
              ],
              [
                literal('ToolNumberInput'),
                t(
                  'Champ temporaire du formulaire de votre outil, comme un espacement avant pose. L’événement transmet la valeur ; votre outil garde son brouillon. Ce champ ne crée pas de réglage persistant dans les signaux.',
                  'A temporary tool-form field, such as spacing before placement. The event carries the value; your tool owns its draft. This field creates no persistent signal setting.',
                ),
              ],
            ],
          ),
          code(
            '// workBlocks est une identité stable ; visibleWhen nomme une case du même modèle.\nval range = NumberSetting("workBlocks", "Following blocks",\n    maximum = 64, defaultValue = 0, visibleWhen = "work")\n\n// Déclarer number(range) dans signalModel, immédiatement après la case work.\n// Lire range.read(settings) dans rules : un Int dans les bornes, pas une distance.\nval proposedSettings = range.withValue(emptyMap(), 2)',
            t('Déclaration et données copiées', 'Declaration and copied data'),
          ),
          text(
            t(
              'NumberSetting accepte de 0 à maximum ; maximum va de 1 à 65535 et le défaut doit être dans cette plage. visibleWhen nomme une case du même modèle : le champ apparaît juste sous cette case lorsqu’elle est cochée. Masquer le champ ne supprime pas sa valeur. Une clé vide affiche le champ sans condition. withValue renvoie une nouvelle carte ; ce n’est pas une écriture dans la partie.',
              'NumberSetting accepts values from zero to maximum; maximum ranges from 1 to 65535 and the default must fit this range. visibleWhen names a checkbox in the same model: the field appears immediately below it when checked. Hiding it does not delete its value. An empty key displays the field unconditionally. withValue returns a new map; it does not write to the game.',
            ),
          ),
          links({
            label: t(
              'Exemple complet de réglage et préparation',
              'Complete settings and preparation example',
            ),
            to: '/mods/preparer-reseau',
          }),
        ],
      },
      {
        id: 'outils',
        title: t('Actions et panneaux d’outils', 'Actions and tool panels'),
        blocks: [
          table(
            [
              t('Déclaration', 'Declaration'),
              t('Comportement visible et événement', 'Visible behaviour and event'),
            ],
            [
              [
                literal('SignalAction(id, label, whenMod, service)'),
                t(
                  'Bouton sous les réglages du signal, visible si le mod fournisseur et son service sont disponibles dans la même partie. label est affiché ; id, whenMod et service restent techniques. Aucune dépendance obligatoire entre mods.',
                  'Button below the signal settings, visible when the provider mod and service are available in the same game session. label is displayed; id, whenMod and service remain technical. No mandatory mod dependency.',
                ),
              ],
              [
                literal('showPanel(request, message, buttons, inputs)'),
                t(
                  'Remplace le bouton d’origine par un panneau temporaire. message apparaît au-dessus des champs et boutons, avec retour à la ligne. Chaque republication remplace ces contrôles, sans modifier les cases persistantes.',
                  'Replaces the original action button with a temporary panel. message appears above the fields and buttons, with wrapping. Each publication replaces these controls without changing persistent checkboxes.',
                ),
              ],
              [
                literal('ToolButton(id, label, enabled)'),
                t(
                  'label est le texte du bouton. enabled=false empêche son activation. Le clic arrive dans le même service, avec request.action=id et request.value=null. Jusqu’à 12 boutons.',
                  'label is the button text. enabled=false prevents activation. A click reaches the same service with request.action=id and request.value=null. Up to 12 buttons.',
                ),
              ],
              [
                literal('ToolNumberInput(id, label, value, minimum, maximum, enabled)'),
                t(
                  'label est affiché au-dessus du champ entier. value est la valeur proposée ; minimum et maximum bornent les valeurs acceptées. enabled=false empêche la saisie. Une édition valide arrive avec action=id et value=nouvel entier. Jusqu’à 4 champs.',
                  'label appears above the integer field. value is the proposed value; minimum and maximum bound accepted values. enabled=false prevents editing. A valid edit arrives with action=id and value=the new integer. Up to 4 fields.',
                ),
              ],
              [
                t('Saisie incomplète', 'Incomplete input'),
                t(
                  'Un champ vide, invalide ou hors bornes conserve le brouillon et bloque les commandes. Le SDK n’invente pas zéro. Après une édition valide, le mod republie le panneau et invalide son ancien aperçu.',
                  'An empty, invalid or out-of-range field retains its draft and blocks commands. The SDK does not invent zero. After a valid edit, the mod republishes the panel and invalidates its old preview.',
                ),
              ],
              [
                literal('request.signalId / worldId / generation'),
                t(
                  'Source de l’action et identité de la partie. Ne réutilisez pas un ticket ou un aperçu après changement de génération. panelToken et originAction relient les clics au panneau d’origine : transmettez la requête reçue.',
                  'Action source and game-session identity. Do not reuse a ticket or preview after a generation change. panelToken and originAction connect clicks to the original panel: pass along the received request.',
                ),
              ],
            ],
          ),
          text(
            t(
              'Un texte déclaré n’est pas une action automatique : écrire « Fermer » ou « Confirmer » ne ferme ni ne construit rien. Le service doit traiter l’identifiant reçu. Pour fermer, retirez l’aperçu et republiez le bouton d’ouverture ; pour construire, utilisez un ticket et suivez son résultat.',
              'Declared text is not an automatic action: writing “Close” or “Confirm” does not close or build anything. The service must handle the received identifier. To close, clear the preview and republish the opening button; to build, use a ticket and track its result.',
            ),
          ),
          text(
            t(
              'showPanel, showSignalPreview et clearSignalPreview peuvent lever ToolOperationException avec isBusy. Conservez la demande de présentation pour un prochain onTick, sans boucle d’attente. Un refus de publication ne confirme ni le nouveau panneau ni l’aperçu : désactivez localement Appliquer et Annuler jusqu’à une présentation à jour. Un clic déjà reçu doit encore passer vos contrôles de session, source, plan et opération en cours.',
              'showPanel, showSignalPreview and clearSignalPreview can throw ToolOperationException with isBusy. Keep the presentation request for a later onTick, without a waiting loop. A refused publication confirms neither the new panel nor the preview: locally disable Apply and Undo until the presentation is current. A received click must still pass your session, source, plan and pending-operation checks.',
            ),
          ),
          links({
            label: t(
              'Aperçu, refus temporaire et ticket unique',
              'Preview, temporary refusal and one-shot ticket',
            ),
            to: '/mods/cycle-outils',
          }),
          links(
            {
              label: t('Exemple d’outil et champs numériques', 'Tool example and numeric fields'),
              to: '/mods/outils-optionnels',
            },
            { label: t('Traductions JSON', 'JSON translations'), to: '/mods/traductions' },
          ),
        ],
      },
      {
        id: 'reproduire',
        title: t('Reconstruire un mod complet', 'Rebuild a complete mod'),
        blocks: [
          text(
            t(
              'Pour une signalisation comparable à AB Signalisation lumineuse : assemblez plusieurs signalModel, chacun avec ses enums, règles, construction, images et driving ; ajoutez les cases propres au modèle, observez l’approche si nécessaire et lisez next avec son type. Les couleurs et les vitesses restent des choix du mod. Les extraits AB Signalisation lumineuse du wiki montrent des usages ciblés sans imposer le téléchargement du projet.',
              'For signalling comparable to AB Signalisation lumineuse: combine multiple signalModel declarations, each with its enums, rules, construction, images and driving; add model-specific checkboxes, observe approaching trains where needed, and read next with its type. Colours and speeds remain mod choices. The wiki’s AB Signalisation lumineuse excerpts illustrate focused uses without requiring the project download.',
            ),
          ),
          text(
            t(
              'Pour un outil comparable à BA Signal Placement : déclarez toolMod et un service facultatif ; lisez network, calculez les positions en respectant les raccordements et aiguilles, affichez toutes les positions avec showSignalPreview, puis préparez un ticket et relisez le réseau avant confirmation. Suivez Pending avec pollConstruction, utilisez undoConstruction uniquement si canUndo, et remettez à zéro votre état lors d’un changement de partie ou de onStop. Le calcul métier appartient à l’outil.',
              'For a tool comparable to BA Signal Placement: declare toolMod and an optional service; read network, calculate positions while respecting connections and junctions, display all positions with showSignalPreview, then prepare a ticket and read the network again before confirmation. Track Pending with pollConstruction, use undoConstruction only when canUndo, and reset your state on session changes or onStop. The tool owns its domain calculations.',
            ),
          ),
          links(
            {
              label: t('Parcourir les possibilités du SDK', 'Browse SDK capabilities'),
              to: '/commencer/possibilites',
            },
            {
              label: t('Extraits ciblés d’AB Signalisation lumineuse', 'Focused AB Signalisation lumineuse excerpts'),
              to: '/mods/exemples-sfr',
            },
            {
              label: t('Référence des opérations d’outils', 'Tool operations reference'),
              to: '/reference/toolcontext',
            },
          ),
        ],
      },
    ],
  },
]
