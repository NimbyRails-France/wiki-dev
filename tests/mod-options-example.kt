package wiki.optiontests

import nimby.*
import nimby.mod.createMod
import nimby.mod.modInfo
import nimby.internal.ModOptionsAccess
import nimby.internal.ToolAccess

// The harness emulates the SDK's callback and preference delivery. The copied
// example remains an ordinary consumer of the separately compiled public API.
private class Game {
    var world = "world-a"
    var generation = 1L
    var reads = 0
    var presentations = 0
    var message = ""
    var seconds = 0L
    private var sequence = 0L

    fun event(mod: ToolMod, action: String) {
        val request = ToolWindowEvent("history", action, emptyMap(), ++sequence, world, generation)
        ToolAccess.withContext(world, generation, { op, integers, _, text ->
            when (op) {
                10 -> {
                    reads++
                    integers[0] = seconds
                    integers[1] = seconds * 1000
                }
                12 -> {
                    presentations++
                    check(integers[0] == request.sequence)
                    val fields = text.decodeToString().split('\u0000')
                    check(fields[0] == request.window)
                    message = fields[1]
                }
                else -> error("The history tool requested unrelated game data: $op")
            }
            0
        }) { context -> mod.onWindowEvent(request, context) }
    }
}

fun main() {
    val mod = createMod()
    check(mod.id == modInfo.id && mod.title == modInfo.title)
    val preferences = ModOptionsAccess(mod.options, mod.windows.size)
    fun configure(date: Boolean = true, size: Int = 5, order: String = "newest") {
        val values = mapOf("showDate" to date.toString(), "historySize" to size.toString(), "order" to order)
        preferences.apply(mod.options.joinToString("\u0000", postfix = "\u0000") { values.getValue(it.id) }.encodeToByteArray(), mod.options.size)
    }
    fun dates(vararg seconds: Long) = seconds.joinToString("\n") { GameDateTime.fromUtcSeconds(it).toString() }

    val game = Game()
    game.event(mod, "open")
    check(game.reads == 1 && game.message == dates(0))
    for (second in 1L..6L) { game.seconds = second; game.event(mod, "sample") }
    check(game.message == dates(6, 5, 4, 3, 2))

    // Player changes take effect on refresh without polling more game data or
    // inventing extra observations. A smaller limit discards older readings.
    configure(size = 2, order = "oldest")
    val reads = game.reads
    game.event(mod, "refresh")
    check(game.reads == reads && game.message == dates(5, 6))
    configure(size = 20)
    game.event(mod, "refresh")
    check(game.reads == reads && game.message == dates(6, 5))
    for (second in 7L..30L) { game.seconds = second; game.event(mod, "sample") }
    check(game.message == (30L downTo 11L).joinToString("\n") { GameDateTime.fromUtcSeconds(it).toString() })

    configure(date = false, size = 20)
    val datedMessage = game.message
    game.event(mod, "refresh")
    check(game.message != datedMessage)
    // A message must not concatenate separate deferred translation references.
    check(game.message.count { it == '\u001e' } <= 1)
    val presentations = game.presentations
    game.event(mod, "unknown")
    check(game.presentations == presentations)

    configure()
    game.generation++
    game.event(mod, "refresh")
    check(game.message.isEmpty())
    game.seconds = 31; game.event(mod, "open")
    check(game.message == dates(31))
    game.world = "world-b"
    game.event(mod, "refresh")
    check(game.message.isEmpty())
    game.event(mod, "sample")
    mod.onStop()
    game.event(mod, "refresh")
    check(game.message.isEmpty())
    println("PASS: isolated options example — live preferences, bounded history, refresh without reads and session/stop cleanup")
}
