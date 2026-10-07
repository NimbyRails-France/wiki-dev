package wiki.prepared

import nimby.*

val work = Checkbox("work", "Zone de travaux", "Appliquer la règle de travaux de ce modèle.")
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
    val byId = signals.associateBy { it.id }
    val affected = HashSet<Long>()
    for (source in signals) {
        if (source.type != model.type.id || source.settingsStatus != SettingsStatus.Present ||
            !source.observation.fresh || source.settings[work.name] != true) continue
        var current: Signal? = source
        val seen = HashSet<Long>()
        repeat(workBlocks.read(source.settings) + 1) {
            val signal = current ?: return@repeat
            if (!seen.add(signal.id) || signal.type != model.type.id ||
                signal.settingsStatus != SettingsStatus.Present || !signal.observation.fresh) {
                current = null
                return@repeat
            }
            affected.add(signal.id)
            current = byId[signal.nextSignal]
        }
    }
    return signals.map { signal ->
        if (signal.id in affected && signal.settings[work.name] != true)
            signal.copy(settings = signal.settings + (work.name to true))
        else signal
    }
}

fun createPreparedMod() = signalMod("prepared-example", "Réglages préparés") {
    signal(model)
    prepareNetwork(::effectiveWorkSettings)
}
