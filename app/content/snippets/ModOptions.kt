package nimby.mod

import nimby.*

// Ces objets décrivent des préférences du mod entier, conservées par le SDK.
// Une lecture de .value récupère le choix actuel ; elle ne relit pas la carte.
private val showDate = BooleanOption("showDate", tr("options.showDate"), true)
private val historySize = IntegerOption(
    "historySize", tr("options.historySize"), defaultValue = 5, minimum = 1, maximum = 20,
)
private val order = ChoiceOption("order", tr("options.order"), listOf(
    // Les identifiants restent stables ; seuls les libellés sont traduits.
    OptionChoice("newest", tr("options.newest")),
    OptionChoice("oldest", tr("options.oldest")),
), "newest")

// L’historique appartient à notre outil, et non aux préférences sauvegardées.
private val samples = mutableListOf<ToolClock>()
private var session: Pair<String, Long>? = null

fun createMod() = toolMod(modInfo) {
    metadata(author = "Your name", name = tr("mod.name"), description = tr("mod.description"))
    options(showDate, historySize, order)
    window("history", tr("window.history"), shortcut = "F9") { event ->
        // Ne jamais afficher les lectures d’une autre partie ou génération.
        val currentSession = worldId to generation
        if (session != currentSession) {
            samples.clear()
            session = currentSession
        }
        when (event.action) {
            // Ouvrir ou cliquer ajoute une lecture ; rafraîchir change seulement l’affichage.
            "open", "sample" -> samples.add(clock())
            "refresh" -> Unit
            else -> return@window
        }
        // Lire ici les valeurs, après le chargement éventuel des préférences du joueur.
        val limit = historySize.value
        val newestFirst = order.value == "newest"
        val displayDate = showDate.value
        // Éviter un historique illimité : supprimer les plus anciennes lectures en premier.
        while (samples.size > limit) samples.removeAt(0)
        val rows = if (newestFirst) samples.asReversed() else samples
        val message = rows.joinToString("\n") { sample ->
            if (displayDate) sample.dateTime().toString()
            else "${sample.elapsedMillis} ms"
        }
        showWindow(event, message, listOf(
            ToolButton("sample", tr("history.sample")),
            ToolButton("refresh", tr("history.refresh")),
        ))
    }
    onStop {
        // Libérer l’état temporaire ; le SDK conserve séparément les préférences.
        samples.clear()
        session = null
    }
}
