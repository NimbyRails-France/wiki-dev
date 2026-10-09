package wiki.prepared

import nimby.*

val work = Checkbox("work", "Zone de travaux", "Appliquer la règle de travaux de ce modèle.")
// 0 = source seule ; 1 = source et prochain signal ; 64 = au plus 65 signaux avec la source.
val workBlocks = NumberSetting("workBlocks", "Cantons suivants", maximum = 64,
    defaultValue = 0, visibleWhen = work.name)
enum class Aspect { Closed, Open }
enum class Reason { Unknown, Clear, Work }

val model = signalModel(
    SignalType("example.work", "Signal de travaux", "example_work", checkboxes = listOf(work)),
    fallback = Indication(Aspect.Closed, Reason.Unknown)) {
    number(workBlocks)
    construction(listOf("closed.svg", "open.svg"))
    rules {
        if (!fresh || !routeKnown || block != Occupancy.Clear || observation.forcedStop || observation.lampFailed)
            Indication(Aspect.Closed, Reason.Unknown)
        else if (enabled(work)) Indication(Aspect.Closed, Reason.Work)
        else Indication(Aspect.Open, Reason.Clear)
    }
    images { if (it.aspect == Aspect.Open) "open.svg" else "closed.svg" }
    driving { if (it.aspect == Aspect.Open) AutomaticDriving.clear() else AutomaticDriving.stop() }
}

// Règle d’exemple : propagation par nextSignal, pas par distance physique.
// Zéro signifie la source seule. Aucun réglage dérivé n’est enregistré.
fun effectiveWorkSettings(signals: List<Signal>): List<Signal> {
    // Un index par lot, plutôt qu’une recherche complète pour chaque voisin.
    val byId = signals.associateBy { it.id }
    val affected = HashSet<Long>()
    for (source in signals) {
        if (source.type != model.type.id || source.settingsStatus != SettingsStatus.Present ||
            !source.observation.fresh || source.settings[work.name] != true) continue
        var current: Signal? = source
        val seen = HashSet<Long>()
        // Lire une valeur bornée ; le +1 inclut la source, les liens suivants restent limités.
        repeat(workBlocks.read(source.settings) + 1) {
            val signal = current ?: return@repeat
            // Un cycle, un autre modèle ou une observation indisponible arrête cette source.
            if (!seen.add(signal.id) || signal.type != model.type.id ||
                signal.settingsStatus != SettingsStatus.Present || !signal.observation.fresh) {
                current = null
                return@repeat
            }
            affected.add(signal.id)
            current = byId[signal.nextSignal]
        }
    }
    // Même nombre et ordre d’entrées ; copier uniquement les réglages concernés.
    // Les identités, observations et liens de la capture restent inchangés.
    return signals.map { signal ->
        if (signal.id in affected && signal.settings[work.name] != true)
            signal.copy(settings = signal.settings + (work.name to true))
        else signal
    }
}

fun createPreparedMod(info: ModInfo = ModInfo("prepared-example", "Réglages préparés")) = signalMod(info) {
    metadata(author = "Votre nom", description = "Préparer les réglages de travaux d’un réseau de signaux.")
    signal(model)
    prepareNetwork(::effectiveWorkSettings)
}
