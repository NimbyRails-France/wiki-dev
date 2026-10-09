package wiki.blinking

import nimby.*

enum class BlinkAspect { Closed, Flashing }
enum class BlinkReason { Unknown, Clear }

// 1. Préparer les images une fois. everyMs est une demi-période en millisecondes SIMULÉES.
private val closedImage = steady("closed.svg")
private val flashingImage = blink(on = "on.svg", off = "off.svg", everyMs = 250)

val blinkingSignal = signalModel(
    id = "monmod.clignotant", title = "Signal clignotant", textures = "textures_clignotantes",
    fallback = Indication(BlinkAspect.Closed, BlinkReason.Unknown)
) {
    // 2. Déclarer les deux phases, même lorsqu'une seule est visible à l'écran.
    construction(states = listOf("closed.svg", "on.svg", "off.svg"))
    rules {
        if (fresh && routeKnown && block == Occupancy.Clear &&
            !observation.forcedStop && !observation.lampFailed)
            Indication(BlinkAspect.Flashing, BlinkReason.Clear)
        else Indication(BlinkAspect.Closed, BlinkReason.Unknown)
    }
    // 3. Retourner l'animation ; le modèle n'attend pas 250 ms et n'alterne pas ses règles.
    appearance { if (it.aspect == BlinkAspect.Flashing) flashingImage else closedImage }
    // Le clignotement ne donne pas de permission : ce modèle exige toujours l'arrêt.
    driving { AutomaticDriving.stop() }
}
