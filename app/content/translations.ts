import type { Article } from './schema'
import { text, code, note, list, table, links } from './schema'
import snippet from './snippets/Translations.kt?raw'

export const translationsEnglish: Record<string, string> = {}
const t = (fr: string, en: string) => { translationsEnglish[fr] = en; return fr }
const literal = (value: string) => t(value, value)

export const translationsGuide: Article = {
  slug: 'mods/traductions',
  group: 'Créer un mod',
  title: t('Traduire un mod', 'Translate a mod'),
  description: t('Un catalogue français et anglais, des identifiants stables et un repli lisible.', 'One French and English catalogue, stable identifiers and readable fallback text.'),
  sections: [
    {
      id: 'fichier', title: t('1. Ajouter le catalogue', '1. Add the catalogue'),
      blocks: [
        text(t('Prérequis : un projet Kotlin/Native configuré et un modèle, un service ou une fenêtre d’outil existants. Ce guide traduit leurs textes visibles sans changer leurs identifiants, leurs réglages ou leurs règles.', 'Prerequisites: a configured Kotlin/Native project and an existing model, service or tool window. This guide translates their visible text without changing identifiers, settings or rules.')),
        text(t('Créez assets/translations.json. Le plugin copie le catalogue dans le paquet et le SDK le valide au chargement. Chaque mod possède ses textes : une même clé peut avoir une traduction différente dans deux mods.', 'Create assets/translations.json. The plugin copies the catalogue into the package and the SDK validates it on loading. Each mod owns its text: the same key may have different translations in two mods.')),
        code(JSON.stringify({ fallback: 'en', languages: {
          en: { maintenance: 'Maintenance mode', 'maintenance.help': 'Enable the maintenance mode of this signal.', repeat: 'Repeat', 'count.one': '{count} signal', 'count.many': '{count} signals' },
          fr: { maintenance: 'Mode maintenance', 'maintenance.help': 'Activer le mode maintenance de ce signal.', repeat: 'Répéter', 'count.one': '{count} signal', 'count.many': '{count} signaux' },
        } }, null, 2), literal('assets/translations.json'), 'json'),
        text(t('fallback choisit la langue de repli ; en est utilisé si ce champ est omis. Cette langue doit exister et contenir toutes les clés. Les autres langues peuvent être incomplètes : une clé absente reprend le texte de repli.', 'fallback selects the fallback language; en is used when omitted. This language must exist and contain every key. Other languages may be incomplete: a missing key uses fallback text.')),
        text(t('Vous choisissez les clés : mod.name, window.clock et title sont des exemples, pas des noms réservés. Une clé n’a d’effet que lorsqu’un appel tr("clé") la transmet à un texte visible. Ajouter mod.name au JSON ne renomme donc pas automatiquement le mod ; ajouter window.clock ne crée ni fenêtre ni raccourci.', 'You choose the keys: mod.name, window.clock and title are examples, not reserved names. A key only takes effect when a tr("key") call supplies it to visible text. Adding mod.name to JSON therefore does not automatically rename the mod; adding window.clock creates neither a window nor a shortcut.')),
      ],
    },
    {
      id: 'kotlin', title: t('2. Traduire les contrôles', '2. Translate controls'),
      blocks: [
        text(t('Importez nimby.tr ou nimby.*. Utilisez tr dans les titres, libellés, aides et messages. Les identifiants de modèles, réglages, actions, fenêtres et services restent des chaînes fixes.', 'Import nimby.tr or nimby.*. Use tr in titles, labels, help and messages. Model, setting, action, window and service identifiers remain fixed strings.')),
        code(snippet, t('Contrôles et message traduits', 'Translated controls and message')),
        text(t('L’extrait définit une case réutilisable et un outil de démonstration. Ajoutez la case à votre modèle et exposez message.v1 par une action optionnelle pour afficher le panneau. Le JSON seul ne crée aucun contrôle.', 'The fragment defines a reusable checkbox and a demonstration tool. Add the checkbox to your model and expose message.v1 through an optional action to display the panel. JSON alone creates no controls.')),
        note(t('tr renvoie une référence pour l’interface, pas une traduction finale à manipuler. Passez-la directement au contrôle : aucune concaténation, découpe ou référence tr dans un paramètre. Les journaux utilisent des messages techniques ordinaires.', 'tr returns an interface reference, not final text to manipulate. Pass it directly to controls: do not concatenate, truncate or put a tr reference in an argument. Logs use ordinary technical messages.'), t('Texte et identité', 'Text and identity')),
        table([t('À traduire', 'Translate'), t('À garder stable', 'Keep stable')], [
          [literal('metadata(name = tr(...), description = tr(...))'), literal('modInfo.id · modId · module')],
          [literal('Checkbox.label / description'), literal('Checkbox.name')],
          [literal('SignalType.title · construction.name'), literal('SignalType.id · textureSet')],
          [literal('ToolButton.label · ToolNumberInput.label'), literal('ToolButton.id · ToolNumberInput.id')],
          [literal('ToolWindow.title · message'), literal('ToolWindow.id · action · service · whenMod')],
        ]),
        text(t('Dans Options → NRF Hub, le nom du groupe vient du titre déclaré par toolMod ou signalMod. Avec toolMod(modInfo), il s’agit de modInfo.title, généré depuis name dans mod.json. metadata(name = tr("mod.name")) traduit le nom dans les listes et fiches du jeu ; il ne remplace pas ce titre de groupe. Le title transmis à window nomme à la fois la fenêtre et sa ligne dans Raccourcis.', 'In Options → NRF Hub, the group name comes from the title declared by toolMod or signalMod. With toolMod(modInfo), this is modInfo.title, generated from name in mod.json. metadata(name = tr("mod.name")) translates the name in the game’s lists and details; it does not replace that group title. The title passed to window names both the window and its row under Shortcuts.')),
        text(t('Pour un groupe BB Timechange, utilisez par exemple tr("window.clock") avec « Date et heure » pour le titre de la fenêtre. La ligne reste courte, sans répéter « BB Timechange — Date et heure ». Gardez son identifiant "clock" inchangé dans les deux langues et lors des mises à jour : changer le libellé ne doit pas créer une nouvelle préférence de raccourci.', 'For a BB Timechange group, use tr("window.clock") with “Date and time” as the window title, for example. The row stays concise without repeating “BB Timechange — Date and time”. Keep its "clock" identifier unchanged in both languages and across updates: changing the label should not create a new shortcut preference.')),
        links(
          { label: t('Nom du mod, groupe et fenêtre', 'Mod name, group and window'), to: '/mods/metadonnees-traduites#noms-outil' },
          { label: t('Options du mod et raccourcis', 'Mod options and shortcuts'), to: '/mods/options' },
        ),
      ],
    },
    {
      id: 'parametres', title: t('3. Paramètres et pluriels', '3. Parameters and plurals'),
      blocks: [
        text(t('tr("count.many", "count" to 3) remplace {count} par 3. Les valeurs passent par toString : formatez nombres et dates avant de les fournir si nécessaire. Une même clé conserve les mêmes paramètres dans toutes les langues. {{ et }} affichent des accolades littérales.', 'tr("count.many", "count" to 3) replaces {count} with 3. Values use toString: format numbers and dates before supplying them when needed. A key keeps the same parameters across all languages. {{ and }} display literal braces.')),
        text(t('Le SDK ne choisit pas automatiquement un pluriel. Déclarez une clé par formulation et choisissez-la en Kotlin, comme summary dans l’extrait. Le paramètre reste du texte, sans seconde résolution de traduction.', 'The SDK does not select plurals automatically. Declare a key for each wording and choose it in Kotlin, as summary does in the fragment. An argument remains text, without a second translation lookup.')),
      ],
    },
    {
      id: 'repli', title: t('Langue active et repli', 'Active language and fallback'),
      blocks: [
        text(t('Les contrôles suivent la langue du jeu, indépendamment de Windows ou du Hub. Les codes usuels eng et fra correspondent à en et fr. Casse et séparateurs sont normalisés : FR_ca devient fr-ca.', 'Controls follow the game language, independently of Windows or the Hub. Common codes eng and fra map to en and fr. Case and separators are normalized: FR_ca becomes fr-ca.')),
        list(
          t('Langue exacte, par exemple fr-ca.', 'Exact language, for example fr-ca.'),
          t('Puis langue principale, par exemple fr.', 'Then base language, for example fr.'),
          t('Puis fallback du mod pour cette clé.', 'Then the mod fallback for this key.'),
          t('Référence toujours absente ou invalide : [clé] rend le problème visible.', 'Reference still missing or invalid: [key] makes the problem visible.'),
        ),
        text(t('Une langue indisponible utilise le repli. Le changement de langue actualise les textes sans réinitialiser les réglages. Dans une fenêtre ouverte, il ne remplace pas la saisie en cours ; une nouvelle publication showWindow remplace en revanche le formulaire par les valeurs de votre outil.', 'An unavailable language uses the fallback. Changing language updates text without resetting settings. In an open window, it does not replace current input; a new showWindow publication does replace the form with your tool’s values.')),
      ],
    },
    {
      id: 'validation', title: t('Vérifier les deux langues', 'Verify both languages'),
      blocks: [
        text(t('Utilisez du JSON UTF-8 strict : aucune clé en double, virgule finale ou commentaire. verifyNativeMod contrôle aussi le catalogue du paquet sans ouvrir le jeu. Un catalogue invalide empêche le chargement du mod avec une erreur dans le journal.', 'Use strict UTF-8 JSON: no duplicate keys, trailing commas or comments. verifyNativeMod also checks the packaged catalogue without opening the game. An invalid catalogue prevents mod loading and writes a diagnostic.')),
        table([t('Élément', 'Element'), t('Limite', 'Limit')], [
          [literal('translations.json'), t('1 Mio ; 64 langues.', '1 MiB; 64 languages.')],
          [t('Une langue', 'One language'), t('4096 clés ; 4096 octets UTF-8 par texte.', '4096 keys; 4096 UTF-8 bytes per text.')],
          [t('Clé ou paramètre', 'Key or parameter'), t('1 à 96 caractères ASCII : lettres, chiffres, point, tiret et soulignement.', '1 to 96 ASCII characters: letters, digits, dot, hyphen and underscore.')],
          [literal('tr'), t('8 paramètres distincts ; référence de 256 octets UTF-8 maximum.', '8 distinct arguments; reference limited to 256 UTF-8 bytes.')],
        ]),
        list(
          t('Compiler, vérifier le paquet puis l’activer dans une partie de test.', 'Build, verify the package, then activate it in a test game.'),
          t('Ouvrir les panneaux en français et en anglais ; vérifier textes longs, aides et pluriels.', 'Open panels in French and English; check long text, help and plurals.'),
          t('Tester une langue non traduite pour vérifier le repli.', 'Test an untranslated language to check fallback behaviour.'),
          t('Après un changement du JSON, reconstruire et recharger le mod. Changer de langue ne relit pas le fichier.', 'After changing JSON, rebuild and reload the mod. Switching language does not reread the file.'),
        ),
        links(
          { label: t('Nom du mod et catalogues', 'Mod name and catalogues'), to: '/mods/metadonnees-traduites' },
          { label: t('Actions optionnelles', 'Optional actions'), to: '/mods/outils-optionnels' },
          { label: t('Référence de tr', 'tr reference'), to: '/reference/translations' },
        ),
      ],
    },
  ],
}
