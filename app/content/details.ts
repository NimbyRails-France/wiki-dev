import type { Section } from './schema'
import { text, code, note, table, links, list } from './schema'
import previewTool from './snippets/PreviewTool.kt?raw'
import drivingRules from './snippets/DrivingRules.kt?raw'

// Additional practical sections. Keep each snippet in a source file compiled
// by check-examples.ps1, so the text a reader copies follows the actual SDK.
export const details: Record<string, Section[]> = {
  'commencer/installation': [
    {
      id: 'activer',
      title: 'Compiler, installer et activer : trois étapes',
      blocks: [
        table(
          ['Étape', 'Résultat', 'Dans le jeu'],
          [
            [
              'windowsTest / assembleReleaseMod',
              'Des tests et un paquet dans build/gradle/mod/release.',
              'Aucun changement.',
            ],
            [
              'Compilation depuis le Hub développeur',
              'Paquet préparé et version du kit associée au mod.',
              'Ancien profil encore actif.',
            ],
            [
              'Activation du profil, jeu fermé',
              'SDK et mods cohérents sont installés ensemble.',
              'Les nouvelles DLL sont chargées au prochain lancement.',
            ],
          ],
        ),
        text(
          'Si le Hub refuse le mélange de builds, reconstruisez d’abord le SDK local puis les mods. Copier une seule DLL ne suffit pas : le kit, le SDK et ses ponts doivent correspondre. La version de votre mod reste indépendante de celle du SDK.',
        ),
      ],
    },
  ],
  'mods/signaux': [
    {
      id: 'inconnu',
      title: 'Choisir un repli explicite',
      blocks: [
        table(
          ['Situation', 'Ce que sait le mod', 'Réponse à définir'],
          [
            [
              'fresh == false',
              'Les observations ne sont pas exploitables comme état actuel.',
              'Une indication de repli définie par le modèle.',
            ],
            [
              'block == Occupancy.Unknown',
              'Le canton n’est prouvé ni libre ni occupé.',
              'Ne pas traiter Unknown comme Clear.',
            ],
            [
              'settingsStatus == Absent',
              'Cette instance est absente du catalogue observé.',
              'Appliquer le repli du modèle ; un signal connu sans profil sauvegardé est Present avec ses valeurs par défaut.',
            ],
            [
              'settingsStatus == Unavailable',
              'Le profil n’est pas lisible actuellement.',
              'Ne pas confondre avec des cases décochées.',
            ],
            [
              'next?.of(otherModel) == null',
              'Le voisin n’est pas de ce modèle ou n’est pas encore résolu.',
              'Renvoyer null pour demander sa résolution, puis définir le repli.',
            ],
          ],
        ),
        text(
          'Gardez les fonctions de règles indépendantes des fichiers, du réseau et de l’interface. Une même entrée doit produire une décision explicable par son Reason. Testez une fermeture locale avant la dépendance au voisin pour que les cycles ne masquent pas une observation restrictive.',
        ),
      ],
    },
  ],
  'mods/outils-optionnels': [
    {
      id: 'exemple-apercu',
      title: 'Exemple complet : plusieurs signaux temporaires sur la voie',
      blocks: [
        text(
          'Ce second projet est un mod outil. Il affiche simultanément tous les emplacements calculés : trois repères par défaut, répartis sur la voie source. Une seule publication contient la liste complète. Il ne choisit pas de branche, ne mesure pas un itinéraire et ne pose aucun signal. Les identifiants du service et du fournisseur doivent correspondre dans les deux mods.',
        ),
        code(
          'action("preview", "Voir les repères", whenMod = "preview-tool", service = "preview.v1")',
          'Dans le signalModel du mod fournisseur de signaux',
        ),
        code(previewTool, 'src/main/kotlin/PreviewTool.kt'),
        code(
          'package nimby.mod\n\nfun createMod() = wiki.preview.createPreviewTool()',
          'src/main/kotlin/Entry.kt du mod outil',
        ),
        text(
          'Dans le mod.json de cet outil, utilisez id = preview-tool et un nom de module propre. Le projet utilise le même plugin Gradle que le premier mod. Conservez request et les positions copiées, jamais le ToolContext. Chaque onTick reçoit son propre contexte valide.',
        ),
        note(
          'Le repère reprend la texture, la géométrie et le sens natifs du signal source. Sa publication n’atteste ni l’absence d’obstacle ni une autorisation de construction. Pour un vrai outil de pose, calculez le chemin, les exclusions et les distances avant de demander la confirmation.',
        ),
      ],
    },
    {
      id: 'cycle-apercu',
      title: 'Du clavier à l’aperçu',
      blocks: [
        list(
          'Un champ vide ou hors limites reste un brouillon dans le panneau ; il ne devient pas zéro.',
          'Une édition invalide les anciens boutons et masque l’ancien aperçu immédiatement.',
          'Le callback reçoit value seulement pour une valeur entière valide. Recalculez votre résultat puis republiez le panneau.',
          'showSignalPreview accepte au maximum 64 positions ; renouvelez-le avant deux secondes dans onTick.',
          'Appelez clearSignalPreview avant une construction, un changement de source ou un masquage explicite.',
          'L’aperçu est visible uniquement pendant l’édition de sa source et dans les couches visibles. Un seul aperçu est actif à la fois.',
        ),
        links({ label: 'API du contexte outil', to: '/reference/toolcontext' }),
      ],
    },
    {
      id: 'replier-menu',
      title: 'Fermer le menu de son outil',
      blocks: [
        text(
          'Pour replier le menu, republiez uniquement le bouton de son action d’origine, puis arrêtez de renouveler ses anciens contrôles dans onTick. Masquez aussi les aperçus. Conservez un ticket de construction en cours et continuez de le vérifier ; fermer une interface n’annule pas une commande du jeu.',
        ),
        code(
          'clearSignalPreview()\nshowPanel(request, "", listOf(ToolButton(request.originAction, "Ouvrir l’outil")))',
          'Dans le callback du bouton Fermer',
        ),
        text(
          'Le clic suivant porte request.originAction : votre service peut réafficher les champs et boutons. Gardez séparément l’état ouvert/fermé du menu, l’espacement choisi et le résultat de construction. Signal Placement suit ce fonctionnement avec ses boutons Fermer et Répéter.',
        ),
      ],
    },
  ],
  'mods/conduite': [
    {
      id: 'exemple-politique',
      title: 'Une politique de conduite testable',
      blocks: [
        code(drivingRules, 'DrivingRules.kt — modèle fictif'),
        text(
          'Closed impose l’arrêt au panneau courant. Warning annonce le suivant et déclare explicitement que ce panneau est franchissable sous une approche déjà reçue. Cela ne donne aucune permission au panneau suivant. Restricted choisit un plafond de marche à vue avec couverture physique ; Open émet une libération Clear.',
        ),
        text(
          'La valeur passageKmh est une limite choisie par ce mod pour une approche déjà mémorisée : elle ne transforme pas toute ouverture en permission de passer. Le signal cible doit publier une indication fraîche et une permission correspondante. Une annonce franchie reste mémorisée jusqu’à la condition de sortie choisie.',
        ),
        code(
          'val speeds = wiki.driving.Speeds(passageKmh = 25.0, restrictedKmh = 12.0)\nval rule = wiki.driving.instruction(wiki.driving.Aspect.Warning, speeds)\ncheck(rule.signalsAhead == 1)\ncheck(rule.reopenedSpeedMps == 25.0 / 3.6)\ncheck(DrivingFlag.ApproachPassable in rule.flags)',
          'Vérifier le contrat de votre politique',
        ),
      ],
    },
  ],
  'lire/trains': [
    {
      id: 'memoire',
      title: 'Ne pas réutiliser une ancienne observation',
      blocks: [
        code(
          'class TrainReader {\n    private var generation: Long? = null\n\n    fun read(client: fr.nimby.sdk.NimbyClient, id: Long) {\n        val sample = client.readTrain(id)\n        if (sample == null) {\n            println("Observation indisponible")\n            return\n        }\n        if (generation != sample.sessionGeneration) {\n            // Effacer ici les calculs qui dépendaient de la partie précédente.\n            generation = sample.sessionGeneration\n        }\n        if (sample.speedDefaulted) println("Zéro de présentation, pas une mesure")\n        else println(sample.speedMps?.times(3.6))\n    }\n\n    fun disconnected() { generation = null }\n}',
          'Exemple de lecteur avec invalidation',
        ),
        text(
          'Une nouvelle connexion peut recommencer sa génération à 1. Invalidez donc aussi vos mémoires lors d’une reconnexion. Les caractéristiques currentDynamics et purchasedDynamics ne doivent pas se remplacer mutuellement ; une longueur absente ne se devine pas à partir de la dernière observation.',
        ),
      ],
    },
  ],
  'lire/horloge': [
    {
      id: 'temps',
      title: 'Choisir la bonne horloge',
      blocks: [
        table(
          ['Temps', 'Usage', 'À éviter'],
          [
            [
              'SimulationClock / simulationMs',
              'Calendrier, animation et état temporel du jeu.',
              'Mesurer un délai réseau ou un bail avec une horloge qui peut être en pause.',
            ],
            [
              'capturedAtMillis',
              'Situer une observation dans les journaux système.',
              'Le confondre avec l’heure simulée.',
            ],
            [
              'Durée de bail / onTick',
              'Renouveler une publication ou un contrôle temporaire.',
              'Supposer que la pause du jeu suspend tous les délais du SDK.',
            ],
          ],
        ),
        text(
          'Changer le calendrier n’accélère pas la simulation. Relisez le résultat de la commande, puis une observation fraîche si votre logique en dépend. Affichez explicitement UTC, ou convertissez pour l’interface avec le fuseau choisi par l’utilisateur.',
        ),
      ],
    },
  ],
  'lire/construction': [
    {
      id: 'resultats',
      title: 'Traiter chaque état du ticket',
      blocks: [
        table(
          ['État JVM / Native', 'Action de votre outil'],
          [
            ['READY / Ready', 'Préparation seulement : capturer puis confirmer les positions.'],
            [
              'PENDING / Pending',
              'Conserver le ticket, désactiver la nouvelle pose, interroger pollConstruction.',
            ],
            [
              'APPLIED / Applied',
              'Présenter les createdIds effectivement retournés ; contrôler canUndo.',
            ],
            [
              'PARTIAL / Partial',
              'Conserver les IDs réellement créés et le reason ; ne pas afficher une réussite complète.',
            ],
            [
              'REJECTED / Rejected',
              'Afficher le refus ; une autre tentative exige une nouvelle vérification.',
            ],
            [
              'UNDONE / Undone',
              'La série a été annulée ; retirer le bouton d’annulation précédent.',
            ],
          ],
        ),
        text(
          'Une exception après createSignals peut cacher une écriture déjà effectuée. Conservez le ticket de préparation et interrogez-le ; renvoyer CREATE pourrait dupliquer les signaux. Même APPLIED ne prouve pas que votre calcul de distance ou votre politique d’aiguilles était correct.',
        ),
        text(
          'Copiez le résultat final dès sa réception. Les tickets ne sont pas un historique durable : une nouvelle préparation valide peut remplacer une ancienne opération terminée et son accès à l’annulation. Un ticket périmé ne signifie pas que la création précédente n’a rien modifié. Fermer le menu ne doit pas interrompre le suivi d’une commande en cours.',
        ),
        links({ label: 'Cycle de vie et refus temporaires', to: '/mods/cycle-outils' }),
      ],
    },
  ],
  'maintenance/journaux': [
    {
      id: 'erreurs-courantes',
      title: 'Diagnostiquer sans deviner',
      blocks: [
        table(
          ['Symptôme', 'Vérifications utiles'],
          [
            [
              'Une API Kotlin n’existe pas',
              'sdk.json, chemin nrfSdkDir et version du plugin sélectionné.',
            ],
            [
              'La compilation réussit mais le jeu garde l’ancien comportement',
              'Profil activé, jeu redémarré et provenance des DLL dans le journal loader.',
            ],
            [
              'Le bouton optionnel est absent',
              'Fournisseur chargé, nom de service exact et même partie observée par les deux mods.',
            ],
            [
              'La case ou le champ n’apparaît pas',
              'Modèle, catalogue de textures, panneau déclaré et journal du pont UI.',
            ],
            [
              'Aperçu accepté mais invisible',
              'Source toujours éditée, positions dans le cadrage, couche visible et publication renouvelée.',
            ],
            [
              'Construction incertaine',
              'Ticket, état retourné, reason, createdIds et journal ; aucune répétition automatique.',
            ],
          ],
        ),
        text(
          'Dans un outil, log("preview source=${request.signalId} count=${positions.size}") donne un contexte utile. Ajoutez worldId, generation et le ticket lors d’une opération. Gardez la distinction entre une demande acceptée, un résultat observé et une validation visuelle.',
        ),
      ],
    },
  ],
}
