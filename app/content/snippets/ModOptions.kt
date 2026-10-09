package nimby.mod

import nimby.*

private val showDate = BooleanOption("showDate", tr("options.showDate"), true)
private val historySize = IntegerOption(
    "historySize", tr("options.historySize"), defaultValue = 5, minimum = 1, maximum = 20,
)
private val order = ChoiceOption("order", tr("options.order"), listOf(
    OptionChoice("newest", tr("options.newest")),
    OptionChoice("oldest", tr("options.oldest")),
), "newest")

private val samples = mutableListOf<ToolClock>()
private var session: Pair<String, Long>? = null

fun createMod() = toolMod(modInfo) {
    metadata(author = "Your name", name = tr("mod.name"), description = tr("mod.description"))
    options(showDate, historySize, order)
    window("history", tr("window.history"), shortcut = "F9") { event ->
        val currentSession = worldId to generation
        if (session != currentSession) {
            samples.clear()
            session = currentSession
        }
        when (event.action) {
            "open", "sample" -> samples.add(clock())
            "refresh" -> Unit
            else -> return@window
        }
        val limit = historySize.value
        val newestFirst = order.value == "newest"
        val displayDate = showDate.value
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
        samples.clear()
        session = null
    }
}
