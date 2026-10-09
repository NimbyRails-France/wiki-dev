package nimby.mod

import nimby.*

// Une seule préférence pour tout le mod, exprimée en mètres.
// Le choix sauvegardé du joueur remplace le défaut de 850 m lorsqu’il est compatible.
private val maximumLengthOption = IntegerOption(
    id = "maximumLengthMeters",
    label = tr("options.maximumLength"),
    defaultValue = 850,
    minimum = minimumTrainLengthMeters,
    maximum = maximumTrainLengthMeters,
)

fun createMod(): GameMod = toolMod(modInfo) {
    // Le paquet exige un auteur et une description ; le nom du groupe vient de modInfo.
    metadata(author = "Votre nom", description = tr("mod.description"))
    // Enregistrer cet objet dans les options du jeu, puis réutiliser le même objet dans la règle.
    options(maximumLengthOption)
    trainEditor {
        // Déclarer le contrôle une fois : le SDK gère ensuite les modifications de composition.
        // Aucun parcours des trains, callback périodique ou fenêtre n’est nécessaire dans le mod.
        maximumLength(
            meters = maximumLengthOption,
            // Chaque motif vient du catalogue ; la langue du jeu choisit le texte affiché.
            // La longueur calculée et la limite sont ajoutées par le SDK, pas dans tr(...).
            exceeded = tr("train.exceeded"),
            lengthUnavailable = tr("train.lengthUnavailable"),
            verificationUnavailable = tr("train.verificationUnavailable"),
        )
    }
}
