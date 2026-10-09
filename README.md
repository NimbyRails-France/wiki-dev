# Wiki développeurs NimbyRails France

Manuel des développeurs de mods et d’outils, en français et en anglais,
destiné à **https://wiki-dev.nimbyrails-france.fr**. Il couvre les API publiques
Kotlin/Native et Kotlin/JVM du SDK, les projets de mods, leurs essais et leurs
paquets. Dépôt : https://github.com/NimbyRails-France/wiki-dev.

Les deux sites ont des publics distincts :

| Adresse | Public et contenu | Projet |
| --- | --- | --- |
| `wiki-dev.nimbyrails-france.fr` | Développeurs de mods et d’outils : SDK, guides, exemples et référence | Ce dépôt Nuxt statique, en français et en anglais |
| `wiki.nimbyrails-france.fr` | Joueurs et utilisateurs des mods : documentation des mods et de leur utilisation | Dépôt `wiki`, avec Wiki.js et PostgreSQL |

Le dépôt et le dossier de ce manuel portent le nom `wiki-dev`. Wiki.js possède
son propre dépôt, sa base de données et sa procédure de déploiement.
Les routes et les éditions du manuel développeurs restent identiques sur le
nouveau domaine. Les textes archivés de l’édition 0.8 gardent leurs références
historiques ; les liens canoniques et les liens de langue de toutes les éditions
utilisent le domaine développeurs actuel.

Les guides se consultent sur le site. Ce README concerne la contribution et
l’exploitation du wiki ; ses procédures de serveur ne font pas partie du manuel
public. La documentation d’une version en développement ne constitue pas une
annonce de disponibilité ni une publication.

The public manual is equally available in French and English. Examples keep
the same identifiers, file names and API contracts in both languages. This
README documents the website workflow; implementation and deployment details
do not belong in the public mod-author guides.

This `wiki-dev` repository contains the developer documentation for
`wiki-dev.nimbyrails-france.fr`. The separate `wiki.nimbyrails-france.fr` address
hosts the separate `wiki` project, using Wiki.js to document mods and their use
by players. Pushing this repository does not deploy either website.

## Développement local

Node 24.11 ou plus récent dans la branche 24.

```sh
npm ci
npm run dev
```

Ouvrir l'adresse locale affichée. Aucun service distant n'est nécessaire.

## Structure du contenu

| Fichiers dans `app/content/`                                               | Responsabilité                                                                    |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `getting-started-guides.ts`                                                | Choix Native/JVM, installation, premier mod, parcours, glossaire et langues       |
| `maintenance-guides.ts`                                                    | Tests, journaux, diagnostic et préparation d’une distribution                     |
| `gradle-project-guide.ts`                                                  | Organisation du projet et contrat public du plugin, du manifeste et des tâches    |
| `capabilities.ts`                                                          | Recherche par besoin et extraits commentés d’AB Signalisation lumineuse           |
| `signal-guides.ts`, `authoring.ts`, `tool-authoring.ts`, `translations.ts` | Modèles, réglages, conduite, ressources, outils et localisation                   |
| `mod-options-guide.ts`                                                    | Préférences globales, raccourcis des fenêtres et choix des libellés FR/EN          |
| `train-editor-guide.ts`                                                   | Projet de contrôle de longueur : fichiers complets, arguments, messages et cas chiffrés |
| `observation-guides.ts`, `train-guides.ts`                                 | Connexion JVM, observations, trains, lignes, horaires et matériel                 |
| `performance-guides.ts`, `performance-code.ts`                             | Travail borné, lectures ciblées, isolation et exemples associés                   |
| `reference.ts`, `api-comments.ts` et modules de contrats                   | Présentation des types et explications de leurs membres                           |
| `api-callable-shape.ts`, `api-arguments.ts`                                 | Arguments et résultats revus FR/EN des fonctions et constructeurs publics         |
| `generated/api.json`                                                       | Instantané versionné des déclarations publiques Kotlin                            |
| `snippets/`                                                                | Exemples Native et JVM utilisés directement par les articles et les vérifications |
| `index.ts`, `localization.ts`                                              | Assemblage des articles et sélection de la langue                                 |
| `en.json`, `ui-en.json`, `code-en.json`                                    | Traductions partagées, interface et textes des exemples                           |
| `tutorial-code-en.json`                                                   | Traductions des commentaires des exemples d’options, de composition et de tests |
| `guides.ts`, `details.ts`                                                  | Anciens fichiers conservés, hors du manuel actif et non importés par l’index      |

`scripts/api-catalogue.mjs` et `api-legacy.json` gèrent les identités des
déclarations, les imports et la conservation des routes et ancres publiques.
`app/components` contient la navigation, la recherche locale, le rendu et la
copie du code.

Les guides sont structurés en TypeScript, sans moteur Markdown ni base de données.
La recherche reste dans le navigateur, sans envoyer les requêtes à un service tiers.
Les adresses canoniques incluent l’édition du SDK : `/version/0.9/<guide>`
en français et `/en/version/0.9/<guide>` en anglais. Le sélecteur de langue
conserve l’édition, la page et la section. Le choix d’édition conserve une page
et une ancre présentes dans la cible ; sinon il revient à l’accueil de cette
édition. Les anciennes adresses restent lisibles et deviennent des alias vers
l’édition courante, avec canonical explicite et redirection navigateur conservant
la requête et l’ancre. Un guide ou une section retirés restent accessibles dans
leur archive : un ancien fragment connu y est dirigé par le navigateur. Les
adresses comportant explicitement une édition ne changent jamais d’édition.
Chaque module de guides peut exporter son tableau d’articles et son dictionnaire
anglais. Les intégrer respectivement à `index.ts` et `localization.ts`. Une route
doit avoir un seul propriétaire. Une traduction manquante bloque les vérifications
et la génération : aucun repli silencieux en français n’est prévu.

Après une modification du texte français ou d’un contrat, mettre à jour sa
traduction dans le même module, les commentaires de référence ou `en.json`.
Les identifiants Kotlin et les IDs de ressources restent identiques dans les
exemples. Les commentaires et les libellés visibles peuvent être traduits.

## Éditions du SDK

Les auteurs continuent à modifier les modules TypeScript et leurs traductions.
Le site lit des **instantanés FR/EN distincts**, dans `app/content/editions/`,
sélectionnés par `registry.json`. Le registre indique la version exacte du SDK,
l’édition courante, le statut archivé et le SHA-256 de chaque instantané. Les
recherches, menus et liens d’un lecteur portent sur l’édition choisie.
Les traductions historiques ne sont jamais recalculées avec les dictionnaires
actuels. Les textes d’interface communs peuvent évoluer indépendamment.

L’édition 0.8 documente **0.8.0-alpha.8**, dernière version publiée de cette
branche. Sa base documentaire bilingue provient du commit wiki
`75c88420cb10dd5de17d1ca9ee0e805570597f5b`, puis ses guides ont été revus et sa
référence reconstruite depuis le tag SDK `v0.8.0-alpha.8`, commit
`ea1ffc6ee68ffd650d1ceab5ca450ae0b8136434`. Le catalogue `0.8-api.json` conserve
les 22 fichiers publics et leurs hashes, ainsi que les 673 déclarations. Les
anciennes adresses et ancres sont conservées. Le bandeau distingue les sources
du SDK de la base documentaire historique. L’édition actuelle 0.9 suit
**0.9.0-alpha.3**. La disponibilité des paquets se vérifie dans le Hub et dans
les releases du SDK.

À la demande explicite du propriétaire, la page historique
`maintenance/distribution` a été retirée de l’édition 0.8 dans les deux langues.
Cet amendement est conservé lors de la mise à jour alpha.8. Ses 48 articles par
langue incluent désormais la référence NumberSetting. La page de distribution
de l’édition 0.9 reste disponible.

La mise à jour 0.8 est reproductible sans utiliser les auteurs ni les contrats
0.9. `0.8-guides.ts` et `0.8-contracts.ts` contiennent les amendements FR/EN
revus contre alpha.8. Depuis le dépôt wiki, avec un export exact des sources
du tag et un checkout SDK contenant ce tag :

```sh
node scripts/update-edition-0.8.mjs --sdk=<sources-alpha.8> --sdk-repo=../sdk --check
```

`--apply` à la place de `--check` reconstruit cette seule édition et son
catalogue. La commande vérifie le commit du tag, la version, l’inventaire et
chaque hash SDK avant toute écriture. Elle garde la protection de l’instantané
existant, met à jour son hash et laisse l’édition courante intacte. Cette
exception répond à la demande explicite d’actualiser le wiki 0.8 jusqu’à alpha.8.

Après modification des auteurs ou synchronisation du catalogue :

```sh
npm run edition:capture
npm run edition:check
```

La capture actualise uniquement l’édition courante, puis produit son module
d’import. `edition:check`, également exécuté avant build/generate, vérifie les
hashes des archives et la correspondance exacte entre l’édition courante et les
sources FR/EN. Relire les diffs des textes et de l’instantané ensemble avant de
les versionner. Une capture n’effectue aucune publication.

Pour ouvrir une future édition, après avoir validé et capturé l’édition actuelle :

1. La figer avec `npm run edition:capture -- --id=0.9 --archive`.
2. Mettre à jour les modules auteurs, traductions, dépendances des exemples et
   catalogue depuis les sources du nouveau SDK réel.
3. Créer la nouvelle édition avec `npm run edition:capture -- --id=<majeure.mineure>`.
4. Exécuter les contrôles du site et les exemples contre le kit correspondant.

Le script refuse de remplacer une archive, y compris avec `--id`. Ne pas copier
le contenu vivant sous plusieurs numéros ni changer à la main son hash pour
contourner ce refus. Une correction d’archive doit être revue contre les sources
de la version qu’elle documente, sans y injecter les API de l’édition courante.
Un retrait ciblé expressément demandé par le propriétaire constitue une exception
éditoriale : retirer uniquement la page et ses liens entrants, consigner le motif
dans la provenance, relire le diff et mettre à jour le hash du registre. La
recapture générale de l’archive reste interdite par le script.
Pour importer une ancienne édition vérifiable depuis Git, utiliser un commit
wiki complet et cohérent :

```sh
npm run edition:capture -- --id=<majeure.mineure> --archive-from=<commit-wiki-complet> --sdk-commit=<commit-sdk-vérifié>
```

Cette commande lit les modules, les snippets et les traductions du même commit
Git sans checkout ni modification du travail courant. Avec `--sdk-commit`, elle
vérifie la version et les hashes du catalogue contre le checkout `../sdk`
(ou `--sdk=<chemin>`). Une archive sans provenance
prouvée ne doit pas être inventée.

English: edit the normal authoring modules, then run `edition:capture` and
`edition:check`. Archived editions contain complete, independent localized
snapshots; the capture command refuses to overwrite them. Freeze the current
edition before opening a new one, verify the real SDK version and examples,
and review the generated diff. None of these commands publishes the site.

## Rédiger et vérifier un contrat

- Commencer par un résultat concret, le public visé et les prérequis. Donner
  l’effet attendu, les valeurs inconnues et le traitement des erreurs à côté
  de l’opération concernée.
- Identifier le contexte Native ou JVM. Vérifier les imports, les unités,
  la portée de session, la propriété des ressources et leur durée de vie.
  Deux noms de type identiques ne prouvent pas deux contrats identiques.
- Partir des sources publiques et de tests utiles. Une signature extraite ne
  suffit pas à expliquer un comportement ; une hypothèse non vérifiée reste
  une note de validation interne, jamais une garantie dans le manuel.
- Utiliser un fichier compilable dans `snippets/` pour un exemple complet.
  Étiqueter les fragments et préciser le callback ou le contexte attendu.
- Commenter les étapes qui expliquent un choix ou une contrainte, puis donner
  un cas concret et son résultat attendu. Documenter les arguments avec leur
  type, unité, valeur par défaut, bornes et comportement en cas de donnée
  inconnue. Un retour `null`, un refus et une exception ne sont pas interchangeables.
- Préserver les titres de blocs du tutoriel : `settings.gradle.kts`,
  `build.gradle.kts`, `mod.json`, `gradle.properties`, `src/main/kotlin/Entry.kt`,
  `assets/closed.svg`, `assets/open.svg`, `src/test/kotlin/SignalTests.kt`. Les essais navigateur extraient ces
  fichiers tels que le lecteur les copie, en français et en anglais.
- Expliquer le contrat du plugin Gradle, pas ses classes d’implémentation.
  Le manuel public exclut les offsets, les hooks, les protocoles et les
  procédures internes de déploiement du SDK.
- Conserver les routes et ancres utiles. Un déplacement entre modules n’a
  pas besoin de changer l’adresse publique d’un guide.

Les sources Kotlin peuvent être synchronisées depuis un checkout voisin :

```sh
npm run api:sync -- --sdk ../sdk
npm run api:check -- --sdk ../sdk
```

Contrôler tous les dossiers des sources publiques Native et JVM lors d’un ajout
de fichier ou de sous-package. Les éléments internes ou privés, les exports
techniques et les fichiers générés ne deviennent pas des API pour les auteurs.
L’extracteur couvre les formes de déclaration du SDK, pas toute la grammaire
Kotlin. Vérifier les nouveaux cas de syntaxe, le diff, les contrats et les exemples
après une évolution de l’API.
Le build du wiki reste autonome : il utilise l'instantané versionné.
Les tables de paramètres sont construites depuis les signatures du catalogue,
avec des explications FR/EN revues dans `api-arguments.ts`. Une fonction ou un
constructeur ajouté sans contrat d’argument ou de résultat bloque les contrôles.
L’extraction conserve les valeurs par défaut et les types imbriqués ; elle ne
déduit pas les unités, les limites ou les effets à partir du nom d’un paramètre.

## Vérification

```sh
npm test
npm run typecheck
npm run generate
npm run check:generated
```

Vérifier aussi la navigation, la recherche et la copie dans un navigateur
sans fenêtre, après génération :

```powershell
$env:WIKI_BROWSER_CHANNEL = 'msedge'
npm run test:browser
```

La configuration accepte aussi `chrome`, ou le Chromium de Playwright si
`WIKI_BROWSER_CHANNEL` n'est pas défini. Les tests ne pilotent aucune session
de navigateur personnelle. Les captures sont dans `test-results/`.

Sous Windows, avec JDK 21 et Kotlin/Native 2.2.20 déjà disponibles :

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check-examples.ps1 -SdkRoot ../sdk
```

Pour reprendre une seule vérification après une correction, ajouter `-Locales fr`
ou `-Locales en`, et `-Runtime native` ou `-Runtime jvm`. Sans ces options,
les deux langues et les deux environnements sont vérifiés.

Cette commande compile les exemples Native FR/EN contre une bibliothèque créée
à partir des sources actuelles, puis exécute leurs scénarios purs. Les exemples
JVM sont compilés séparément par `verification/jvm-examples` : un build composite
consomme une copie fraîche du vrai module client du SDK, avec sa visibilité publique
et JNA. `check-jvm-examples.ps1` compile aussi les trois fichiers du premier projet
JVM, dont ses fichiers Gradle traduits, sans exécuter son programme. Les sorties et
le rapport restent dans `.validation/` ; ce contrôle n’écrit pas dans le SDK.
Aucun exemple de cette vérification ne se connecte à une partie. Les sources extraites
par le navigateur dans `.validation/tutorial-generated-project[-en]` doivent
aussi être assemblées avec le kit testé avant une livraison des tutoriels.
Conserver les commandes, les versions du kit et les résultats de chaque couche.
Une compilation d’exemple, une vérification de cycle de vie et un essai en partie
prouvent des choses différentes ; un résultat Gradle `UP-TO-DATE` n’est pas une
nouvelle exécution.

Après génération, contrôler les pages importantes dans les deux langues :
lisibilité des tableaux, ancres de référence, recherche, copie et absence de
débordement sur mobile. Les contrôles doivent utiliser un serveur de vérification
distinct sans interrompre le serveur de développement personnel déjà ouvert.

Le wiki public s’adresse aux auteurs de mods et d’outils. Les protocoles,
adresses natives et procédures de déploiement du SDK restent dans ses notes
internes ; les instructions de contribution et de production du site restent ici.

## Production

Publier uniquement le contenu généré de `.output/public`. Caddy peut le servir
directement : ni serveur Node, ni base de données ne sont nécessaires en production.
`deploy/compose.yaml` et `deploy/Caddyfile` définissent un serveur statique interne,
sur le réseau Docker `proxy`. `deploy/gateway.caddy` déclare uniquement
`wiki-dev.nimbyrails-france.fr` au Caddy public, qui gère le certificat HTTPS
automatiquement lors d’un déploiement. Ce modèle ne configure pas Wiki.js.

Le projet Docker et l’alias réseau portent le nom `nrf-wiki-dev`, dans
`/opt/docker/nimbyrailsfrance-wiki-dev`. Le projet `nrf-wikijs` et l’ancien dossier
`/opt/docker/nimbyrailsfrance-wiki` appartiennent désormais au projet Wiki.js.
La séparation initiale conserve une copie de l’ancien déploiement pour retour
arrière. Les déploiements suivants ne modifient que le manuel développeurs.

Après validation locale, transférer une archive tar.gz de `.output/public` avec
ces trois fichiers et `deploy/install.sh` dans un dossier de staging. Exécuter
`sudo bash install.sh <staging> <identifiant-release> <sha256-archive>`.
Le script vérifie l’archive, conserve la version précédente, bascule le lien
`storage/current`, valide puis recharge Caddy sans arrêter les autres sites.
Les fichiers se trouvent sous `/opt/docker/nimbyrailsfrance-wiki-dev`.
Pour revenir en arrière, faire pointer `storage/current` vers la cible de
`storage/previous` avec un remplacement atomique du lien. Aucun rebuild nécessaire.
Les journaux HTTP sont accessibles avec `docker compose logs wiki` dans ce dossier,
avec rotation à 3 fichiers de 10 Mo. Les sources et clés privées ne sont pas déployées.

Le VPS est réservé à la production. Générer et tester sur le poste local ou sur
un runner distinct. Ce dépôt ne contient aucun déploiement automatique ni secret.
La publication est explicite ; un push Git ne modifie pas la production.
