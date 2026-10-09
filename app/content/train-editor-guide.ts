import type { Article } from './schema'
import { code, links, note, table, text } from './schema'
import example from './snippets/TrainEditor.kt?raw'

export const trainEditorEnglish: Record<string, string> = {}
const t = (fr: string, en: string) => {
  trainEditorEnglish[fr] = en
  return fr
}
const literal = (value: string) => t(value, value)

export const trainEditorGuides: Article[] = [{
  slug: 'mods/composition-trains',
  group: 'Créer un mod',
  title: t('Contrôler la longueur des trains', 'Control train length'),
  description: t(
    'Créez un mod sans fenêtre qui limite la longueur totale des trains, expose un réglage au joueur et explique les ajouts refusés.',
    'Create a mod without a window that limits total train length, exposes a player setting and explains rejected additions.',
  ),
  status: 'development',
  sections: [
    {
      id: 'projet',
      title: t('Préparer le projet et ses fichiers', 'Prepare the project and its files'),
      blocks: [
        text(t(
          'Prérequis : le projet Kotlin/Native du guide d’installation, le kit et le SDK du jeu 0.9.0-alpha.3 compatibles avec votre jeu Windows x64. Cet exemple utilise uniquement les options du mod et trainEditor. Il n’ajoute ni fenêtre ni raccourci : son réglage apparaît dans Options → NRF Hub → Interface, sous le nom du mod.',
          'Prerequisites: the Kotlin/Native project from the setup guide, a kit and in-game SDK 0.9.0-alpha.3 compatible with your Windows x64 game. This example uses only mod options and trainEditor. It adds no window or shortcut: its setting appears in Options → NRF Hub → Interface under the mod’s name.',
        )),
        text(t(
          'Conservez settings.gradle.kts et build.gradle.kts du projet. Remplacez mod.json et src/main/kotlin/Entry.kt par les fichiers ci-dessous, puis créez assets/translations.json. modInfo est généré par le plugin depuis ce manifeste ; ne le redéclarez pas dans votre code.',
          'Keep the project’s settings.gradle.kts and build.gradle.kts. Replace mod.json and src/main/kotlin/Entry.kt with the files below, then create assets/translations.json. The plugin generates modInfo from this manifest; do not redeclare it in your code.',
        )),
        code(JSON.stringify({
          id: 'long-trains', name: 'Long trains', modId: 'long-trains',
          module: 'long-trains-mod', version: '0.1.0', language: 'kotlin-native',
          developmentStatus: 'in-development', sdkMin: '0.9.0-alpha.3', sdkMaxExclusive: '0.10.0',
          gameSha256: ['fff49ac21720abfc824c2b4f68b862727630eb0db71cfe1f9ea8f685d0db10ae'],
        }, null, 2), literal('mod.json'), 'json'),
        note(t(
          'L’empreinte du manifeste correspond au jeu utilisé pour cet exemple. Conservez l’empreinte compatible fournie par votre projet ou votre kit ; la remplacer arbitrairement ne rend pas une autre version du jeu compatible.',
          'The manifest hash identifies the game used for this example. Keep the compatible hash provided by your project or kit; arbitrarily replacing it does not make another game version compatible.',
        )),
        links({ label: t('Créer le projet Kotlin/Native', 'Create the Kotlin/Native project'), to: '/commencer/installation' }),
      ],
    },
    {
      id: 'regle',
      title: t('Déclarer la préférence et la règle', 'Declare the preference and the rule'),
      blocks: [
        code(example, literal('src/main/kotlin/Entry.kt')),
        table([t('Argument', 'Argument'), t('Valeur de l’exemple', 'Example value'), t('Rôle et contrainte', 'Purpose and constraint')], [
          [literal('IntegerOption.id'), literal('maximumLengthMeters'), t('Identité de la préférence sauvegardée. Gardez-la stable lors des mises à jour.', 'Identity of the saved preference. Keep it stable across updates.')],
          [literal('label'), literal('tr("options.maximumLength")'), t('Texte affiché au joueur ; la clé doit exister dans le catalogue de traductions.', 'Text displayed to the player; the key must exist in the translation catalogue.')],
          [literal('defaultValue'), literal('850'), t('Mètres, locomotives comprises. Utilisé en l’absence d’un choix sauvegardé compatible ou après réinitialisation.', 'Metres, including locomotives. Used when no compatible saved choice exists or after resetting.')],
          [literal('minimum / maximum'), literal('minimumTrainLengthMeters / maximumTrainLengthMeters'), t('Bornes incluses, actuellement 1 et 10 000 m. La valeur par défaut doit être comprise entre elles.', 'Inclusive bounds, currently 1 and 10,000 m. The default must lie between them.')],
          [literal('maximumLength.meters'), literal('maximumLengthOption'), t('Le même objet IntegerOption que celui enregistré avec options(...), pas une copie ni un nombre.', 'The same IntegerOption object registered with options(...), not a copy or a number.')],
          [literal('exceeded'), literal('tr("train.exceeded")'), t('Message pour un ajout qui dépasserait la limite. Le SDK ajoute séparément les deux longueurs.', 'Message for an addition that would exceed the limit. The SDK adds the two lengths separately.')],
          [literal('lengthUnavailable'), literal('tr("train.lengthUnavailable")'), t('Message lorsque la longueur d’un véhicule nécessaire au calcul est indisponible.', 'Message when a vehicle length needed for the calculation is unavailable.')],
          [literal('verificationUnavailable'), literal('tr("train.verificationUnavailable")'), t('Message lorsque la composition ne peut pas être vérifiée.', 'Message when the composition cannot be verified.')],
        ]),
        text(t(
          'metadata fournit l’auteur et la description obligatoires pour générer le paquet. Le bloc trainEditor est exécuté lors de la déclaration du mod et contient exactement une règle maximumLength. Il ne parcourt pas les trains et ne renvoie pas une commande de modification. Le SDK applique ensuite la valeur courante de la préférence aux opérations de composition prises en charge. Aucun onTick ni service n’est requis.',
          'metadata supplies the author and description required to generate the package. The trainEditor block runs when the mod is declared and contains exactly one maximumLength rule. It does not scan trains or return a modification command. The SDK subsequently applies the current preference value to supported composition operations. No onTick or service is required.',
        )),
        links({ label: literal('TrainEditorBuilder.maximumLength'), to: '/reference/native/nimby/traineditor' }, { label: literal('IntegerOption'), to: '/reference/native/nimby/modoptions' }),
      ],
    },
    {
      id: 'messages',
      title: t('Fournir les messages français et anglais', 'Provide French and English messages'),
      blocks: [
        code(JSON.stringify({ fallback: 'en', languages: {
          fr: {
            'mod.description': 'Limiter la longueur totale des trains avec un réglage du joueur.',
            'options.maximumLength': 'Longueur maximale des trains (m)',
            'train.exceeded': 'Impossible d’ajouter ce véhicule : la longueur maximale du train serait dépassée.',
            'train.lengthUnavailable': 'Impossible d’ajouter ce véhicule : sa longueur est indisponible.',
            'train.verificationUnavailable': 'Impossible de modifier cette composition : sa longueur ne peut pas être vérifiée.',
          },
          en: {
            'mod.description': 'Limit total train length with a player setting.',
            'options.maximumLength': 'Maximum train length (m)',
            'train.exceeded': 'Cannot add this vehicle: the maximum train length would be exceeded.',
            'train.lengthUnavailable': 'Cannot add this vehicle: its length is unavailable.',
            'train.verificationUnavailable': 'Cannot change this composition: its length could not be verified.',
          },
        } }, null, 2), literal('assets/translations.json'), 'json'),
        text(t(
          'Les trois messages sont obligatoires et suivent la langue du jeu. Ils acceptent un texte fixe ou tr("clé") sans arguments, limité à 1 024 octets UTF-8. Le caractère nul et les caractères de contrôle sont interdits, sauf les retours à la ligne et les tabulations. Les longueurs ne sont pas des paramètres de traduction de cette déclaration : le SDK les affiche séparément pour un dépassement.',
          'All three messages are required and follow the game’s language. Each accepts fixed text or tr("key") without arguments, up to 1,024 UTF-8 bytes. NUL and control characters are forbidden, except for newlines and tabs. Lengths are not translation parameters in this declaration: the SDK displays them separately for an exceeded limit.',
        )),
        note(t(
          'Une clé absente, une déclaration sans règle, plusieurs règles ou une préférence non enregistrée sont des erreurs d’auteur. Corrigez-les avant d’activer le paquet ; il ne s’agit pas d’un ajout refusé au joueur pendant la partie.',
          'A missing key, a declaration without a rule, multiple rules or an unregistered preference are authoring errors. Correct them before activating the package; they are distinct from an addition refused to the player during a game.',
        )),
        links({ label: t('Traduire un mod', 'Translate a mod'), to: '/mods/traductions' }),
      ],
    },
    {
      id: 'resultats',
      title: t('Comprendre le résultat avec des cas chiffrés', 'Understand the result with numerical cases'),
      blocks: [
        text(t(
          'Les nombres suivants illustrent le contrôle avec une limite de 850 m ; ils ne désignent pas des modèles de véhicules particuliers. La longueur de départ comprend tous les véhicules de la composition contrôlée, locomotives comprises.',
          'The following numbers illustrate the check with an 850 m limit; they do not identify particular vehicle models. The starting length includes every vehicle in the checked composition, including locomotives.',
        )),
        table([t('Situation', 'Situation'), t('Calcul', 'Calculation'), t('Résultat attendu', 'Expected result')], [
          [t('Ajouter un véhicule de 60 m à 740 m', 'Add a 60 m vehicle to 740 m'), literal('740 + 60 = 800 m'), t('La règle de longueur permet l’ajout ; les autres contrôles du jeu restent applicables.', 'The length rule permits the addition; other game checks still apply.')],
          [t('Ajouter un véhicule de 40 m à 810 m', 'Add a 40 m vehicle to 810 m'), literal('810 + 40 = 850 m'), t('Atteindre exactement la limite ne constitue pas un dépassement.', 'Reaching the limit exactly does not exceed it.')],
          [t('Ajouter un véhicule de 60 m à 810 m', 'Add a 60 m vehicle to 810 m'), literal('810 + 60 = 870 m'), t('Ajout refusé ; la composition actuelle reste à 810 m.', 'Addition rejected; the current composition stays at 810 m.')],
          [t('Abaisser la limite alors qu’un train mesure 900 m', 'Lower the limit while a train measures 900 m'), literal('900 m > 850 m'), t('Le train existant est conservé. Il peut être raccourci progressivement ; aucun véhicule n’est supprimé automatiquement.', 'The existing train is preserved. It can be shortened gradually; no vehicle is removed automatically.')],
          [t('Longueur d’un véhicule inconnue', 'Unknown vehicle length'), t('Calcul indisponible', 'Calculation unavailable'), t('Le SDK refuse l’opération à vérifier et affiche le motif correspondant, sans remplacer l’inconnu par zéro.', 'The SDK refuses the operation that needs verification and displays the corresponding reason, without substituting zero for unknown data.')],
        ]),
        text(t(
          'Si plusieurs mods déclarent une limite, la plus petite limite active s’applique. Chaque mod conserve sa préférence. Les trains attelés et les changements de composition pris en charge restent soumis aux contrôles du SDK et du jeu ; cette règle ne lève pas toutes les contraintes du jeu et ne remplace pas leur vérification.',
          'When several mods declare a limit, the smallest active limit applies. Each mod retains its preference. Supported coupled trains and composition changes remain subject to SDK and game checks; this rule does not remove every game constraint or replace their validation.',
        )),
      ],
    },
    {
      id: 'essayer',
      title: t('Compiler puis vérifier dans une partie de test', 'Build, then verify in a test game'),
      blocks: [
        code('.\\gradlew.bat windowsTest verifyNativeMod packageMod', t('Depuis la racine du projet', 'From the project root'), 'powershell'),
        text(t(
          'Dans le Hub, ajoutez le projet à Développer, choisissez le kit compatible, compilez puis appliquez le profil contenant votre mod et le SDK correspondant. Lancez ensuite le jeu depuis ce profil. Un paquet compilé seul ne remplace pas celui d’une partie déjà ouverte.',
          'In the Hub, add the project to Develop, select the compatible kit, build and apply the profile containing your mod and matching SDK. Then launch the game from that profile. Building a package alone does not replace the package in a game that is already running.',
        )),
        table([t('Vérification', 'Check'), t('Ce qu’il faut observer', 'What to observe')], [
          [t('Premier lancement sans préférence sauvegardée', 'First launch without a saved preference'), t('Le réglage affiche 850 m. Un ancien choix sauvegardé est conservé et peut donc afficher une autre valeur.', 'The setting shows 850 m. An existing saved choice is retained and can therefore show a different value.')],
          [t('Ajout sous la limite, puis ajout au-dessus', 'Addition below the limit, then above it'), t('Le premier ajout est permis par cette règle ; le second est refusé avec longueur et limite.', 'The first addition is permitted by this rule; the second is rejected with the length and limit.')],
          [t('Changer la valeur, puis relancer le jeu', 'Change the value, then restart the game'), t('La valeur acceptée est conservée. Un refus ne doit pas modifier la composition actuelle.', 'The accepted value is retained. A rejected addition must not alter the current composition.')],
          [t('Passer le jeu en français puis en anglais', 'Switch the game to French, then English'), t('Les motifs utilisent les textes du catalogue ; les identifiants de préférence restent les mêmes.', 'Reasons use the catalogue’s text; preference identities remain unchanged.')],
        ]),
        links({ label: t('Tester son mod', 'Test your mod'), to: '/maintenance/tests' }, { label: t('Retrouver les journaux utiles', 'Find useful logs'), to: '/maintenance/journaux' }),
      ],
    },
  ],
}]
