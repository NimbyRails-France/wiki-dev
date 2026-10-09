package wiki.approach

import nimby.*

enum class ApproachAspect { Closed, Open }
enum class ApproachReason { Unknown, TrainApproaching }

val approachSignal = signalModel(
    id = "monmod.approche", title = "Signal à l’approche", textures = "textures_approche",
    fallback = Indication(ApproachAspect.Closed, ApproachReason.Unknown)
) {
    construction(states = listOf("closed.svg", "open.svg"))
    // 1. Portée en cantons AMONT : ce n'est ni une distance en mètres, ni une cible de conduite.
    observeApproach(blocks = 2)
    rules {
        // 2. trainApproaching est une preuve fraîche orientée vers ce signal, pas une réservation.
        if (fresh && routeKnown && block == Occupancy.Clear && trainApproaching &&
            !observation.forcedStop && !observation.lampFailed)
            Indication(ApproachAspect.Open, ApproachReason.TrainApproaching)
        else Indication(ApproachAspect.Closed, ApproachReason.Unknown)
    }
    images { if (it.aspect == ApproachAspect.Open) "open.svg" else "closed.svg" }
    // 3. Le train n'est autorisé à passer que si la règle a aussi validé le canton du signal.
    driving { if (it.aspect == ApproachAspect.Open) AutomaticDriving.clear() else AutomaticDriving.stop() }
}
