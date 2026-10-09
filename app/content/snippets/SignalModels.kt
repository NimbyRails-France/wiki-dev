package wiki.models

import nimby.*

// 1. Chaque famille conserve ses aspects et ses motifs ; elle n'interprète pas les enums d'une autre.
enum class MainAspect { Closed, Open }
enum class MainReason { Unknown, Clear }
enum class DistantAspect { Wait, Proceed }
enum class DistantReason { Unknown, MainClosed, MainOpen }

val mainSignal = signalModel(
    id = "mon-reseau.principal", title = "Principal", textures = "textures_principal",
    fallback = Indication(MainAspect.Closed, MainReason.Unknown)
) {
    // Déclarer les deux images empaquetées ; construction est nécessaire pour poser ce modèle.
    construction(states = listOf("main-closed.svg", "main-open.svg"))
    rules {
        // Le principal décide avec son propre canton. Clear doit être une observation exploitable.
        if (fresh && routeKnown && block == Occupancy.Clear &&
            settingsStatus != SettingsStatus.Unavailable &&
            !observation.forcedStop && !observation.lampFailed)
            Indication(MainAspect.Open, MainReason.Clear)
        else Indication(MainAspect.Closed, MainReason.Unknown)
    }
    images { if (it.aspect == MainAspect.Open) "main-open.svg" else "main-closed.svg" }
    // La permission vient de l'indication calculée, jamais du nom de l'image.
    driving { if (it.aspect == MainAspect.Open) AutomaticDriving.clear() else AutomaticDriving.stop() }
}

val distantSignal = signalModel(
    id = "mon-reseau.annonce", title = "Annonce", textures = "textures_annonce",
    fallback = Indication(DistantAspect.Wait, DistantReason.Unknown)
) {
    construction(states = listOf("distant-wait.svg", "distant-proceed.svg"))
    rules {
        // 2. Refuser d'abord les données locales inconnues ; demander ensuite le voisin aval.
        when {
            !fresh || !routeKnown || block != Occupancy.Clear ||
                settingsStatus == SettingsStatus.Unavailable ||
                observation.forcedStop || observation.lampFailed ->
                Indication(DistantAspect.Wait, DistantReason.Unknown)
            // null reporte ce calcul jusqu'à la résolution du voisin ; il ne signifie pas voie libre.
            next == null -> null
            else -> when (next?.of(mainSignal)?.aspect) {
                // of(mainSignal) lit les enums du principal, pas un nombre supposé universel.
                MainAspect.Closed -> Indication(DistantAspect.Wait, DistantReason.MainClosed)
                MainAspect.Open -> Indication(DistantAspect.Proceed, DistantReason.MainOpen)
                // Un autre modèle ou un voisin non interprétable conserve le repli de l'annonce.
                null -> Indication(DistantAspect.Wait, DistantReason.Unknown)
            }
        }
    }
    images { if (it.aspect == DistantAspect.Proceed) "distant-proceed.svg" else "distant-wait.svg" }
    // Politique fictive de ce tutoriel : attendre impose l'arrêt, procéder autorise le passage.
    driving { if (it.aspect == DistantAspect.Proceed) AutomaticDriving.clear() else AutomaticDriving.stop() }
}

// 3. Entry.kt appelle ce constructeur avec modInfo ; son défaut permet les tests hors jeu.
// Les quatre SVG doivent être présents dans assets pour distribuer le paquet.
fun createNetworkMod(info: ModInfo = ModInfo("mon-reseau", "Mon réseau")) = signalMod(info) {
    metadata(author = "Votre nom", description = "Deux modèles pédagogiques avec leurs règles et leur conduite.")
    signal(mainSignal)
    signal(distantSignal)
}
