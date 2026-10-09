package nimby.mod

import nimby.*

// 1. L'aspect choisit l'affichage ; le motif explique pourquoi cet aspect a été choisi.
// Ces enums appartiennent à ce modèle ; leurs positions ne sont pas des codes à partager.
enum class Aspect { Closed, Open }
enum class Reason { Unknown, Disabled, Occupied, Clear }

val firstSignal = signalModel(
    // Identité du modèle et du catalogue : conserver ces chaînes après distribution.
    id = "monmod.signal",
    title = "Mon premier signal",
    textures = "mon_premier_signal",
    // Résultat de repli lorsque le calcul ne peut pas fournir une indication exploitable.
    fallback = Indication(Aspect.Closed, Reason.Unknown)
) {
    // 2. Chaque chemin est relatif au paquet : assets/closed.svg devient closed.svg.
    construction(states = listOf("closed.svg", "open.svg"))
    // Le défaut s'applique aux nouveaux réglages ; une valeur sauvegardée reste prioritaire.
    val active = checkbox("active", "Activer le signal", defaultValue = true)

    rules {
        // 3. Les observations et réglages sont les entrées ; retourner une Indication est le résultat.
        // Vérifier les refus avant l'ouverture. Une donnée manquante ne prouve jamais un canton libre.
        when {
            settingsStatus == SettingsStatus.Unavailable -> Indication(Aspect.Closed, Reason.Unknown)
            !enabled(active) -> Indication(Aspect.Closed, Reason.Disabled)
            !fresh || !routeKnown || observation.lampFailed || observation.forcedStop ->
                Indication(Aspect.Closed, Reason.Unknown)
            block == Occupancy.Clear -> Indication(Aspect.Open, Reason.Clear)
            block == Occupancy.Occupied -> Indication(Aspect.Closed, Reason.Occupied)
            else -> Indication(Aspect.Closed, Reason.Unknown)
        }
    }

    // 4. Une indication sélectionne une image déjà déclarée ; ce choix ne commande pas le train.
    images { indication ->
        when (indication.aspect) {
            Aspect.Closed -> "closed.svg"
            Aspect.Open -> "open.svg"
        }
    }
    driving { indication ->
        // 5. La conduite utilise la même indication, mais sa permission reste un choix explicite.
        when (indication.aspect) {
            Aspect.Closed -> AutomaticDriving.stop()
            Aspect.Open -> AutomaticDriving.clear()
        }
    }
}

// 6. Le plugin fournit modInfo depuis mod.json ; createMod assemble seulement les déclarations.
// Le mod est le paquet ; le modèle ci-dessus garde ses propres types et règles.
fun createMod(): SignallingMod = signalMod(modInfo) {
    metadata(author = "Votre nom", description = "Mon premier mod de signalisation.")
    signal(firstSignal)
}
