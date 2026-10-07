package wiki.tooltests

import nimby.*
import wiki.preview.*
import wiki.construction.*
import wiki.topology.positionAhead

private const val A = 0x1000000000001L
private const val B = 0x1000000000002L
private const val C = 0x1000000000003L
private const val S = 0x8000000000001L
private fun source() = ToolSignal(S, A, .5, -1, 4)
private fun fixtureNetwork() = ToolNetwork("world", 1, listOf(ToolTrack(A, null, B, 100.0), ToolTrack(B, null, A, 100.0)), emptyList(), listOf(source()))
private fun busy(): Nothing = throw ToolOperationException(12, "Temporary refusal")
private fun rejected(block: () -> Unit) = check(runCatching(block).isFailure)

private class PreviewFake : PreviewPort {
    override var worldId = "world"
    override var generation = 1L
    var reads = 0; var shows = 0; var clears = 0; var panels = 0
    var fail = ""
    var shown = emptyList<SignalPosition>()
    var closed = false
    override fun network(): ToolNetwork { reads++; if (fail == "read") busy(); return fixtureNetwork() }
    override fun clear() { clears++; if (fail == "clear") busy(); shown = emptyList() }
    override fun show(request: SignalActionRequest, positions: List<SignalPosition>) {
        shows++; if (fail == "show") busy(); shown = positions
    }
    override fun panel(request: SignalActionRequest, message: String, count: Int, closed: Boolean) {
        panels++; if (fail == "panel") busy(); this.closed = closed
    }
}

private class ConstructionFake : ConstructionPort {
    override var worldId = "world"
    override var generation = 1L
    var creates = 0; var undos = 0; var polls = 0
    var throwCreate = false; var throwUndo = false; var throwPoll = false
    var reply = ConstructionResult(ConstructionState.Pending, 7, emptyList(), 0, false)
    override fun create(ticket: Long, source: Long, positions: List<SignalPosition>): ConstructionResult {
        creates++; if (throwCreate) busy(); return reply
    }
    override fun undo(ticket: Long): ConstructionResult { undos++; if (throwUndo) busy(); return reply }
    override fun poll(ticket: Long): ConstructionResult { polls++; if (throwPoll) busy(); return reply }
}

fun main() {
    val leapDay = GameDateTime(2000, 2, 29, 12, 0, 0)
    check(GameDateTime.fromUtcSeconds(leapDay.toUtcSeconds()) == leapDay)
    rejected { GameDateTime(1900, 2, 29, 12, 0, 0).toUtcSeconds() }
    // B-to-B join: the SDK tells us the entry end; the caller preserves travel direction.
    check(positionAhead(fixtureNetwork(), S, 75.0) == source().placementAt(B, .75, -1))
    check(positionAhead(fixtureNetwork(), S, 50.0) == null) // Exact endpoint rejected.
    check(positionAhead(fixtureNetwork(), S, 180.0) == null) // Unknown continuation.
    val junction = fixtureNetwork().copy(junctions = listOf(ToolJunction(C, A, .7, 1, 1)))
    check(positionAhead(junction, S, 30.0) == null)
    val unknownLength = fixtureNetwork().copy(tracks = listOf(ToolTrack(A, null, B, 100.0), ToolTrack(B, null, A, null)))
    check(positionAhead(unknownLength, S, 75.0) == null)
    val notReciprocal = fixtureNetwork().copy(tracks = listOf(ToolTrack(A, null, B, 100.0), ToolTrack(B, null, C, 100.0)))
    check(positionAhead(notReciprocal, S, 75.0) == null)
    val cycle = fixtureNetwork().copy(tracks = listOf(ToolTrack(A, C, B, 100.0), ToolTrack(B, A, C, 100.0), ToolTrack(C, B, A, 100.0)))
    check(positionAhead(cycle, S, 1000.0) == null)
    rejected { positionAhead(fixtureNetwork(), S, Double.NaN) }

    val option = wiki.prepared.workBlocks
    check(option.read(emptyMap()) == 0)
    check(option.read(option.withValue(mapOf("other" to true), 64)) == 64)
    check(option.withValue(mapOf("other" to true), 2)["other"] == true)
    rejected { option.withValue(emptyMap(), 65) }
    val observed = Observation(Occupancy.Clear, fresh = true, routeKnown = true)
    val input = listOf(
        Signal(1, 2, option.withValue(mapOf("work" to true), 1), observed, type = wiki.prepared.model.type.id),
        Signal(2, 3, emptyMap(), observed, type = wiki.prepared.model.type.id),
        Signal(3, 1, emptyMap(), observed, type = wiki.prepared.model.type.id))
    val prepared = wiki.prepared.createPreparedMod().prepareObservedNetwork(input)
    check(prepared[1].settings["work"] == true && prepared[2].settings["work"] != true)
    check(input[1].settings.isEmpty()) // No persistence or in-place mutation.
    check(prepared.indices.all { i -> prepared[i].copy(settings = input[i].settings) == input[i] })
    val unavailable = input.map { if (it.id == 2L) it.copy(settingsStatus = SettingsStatus.Unavailable) else it }
    check(wiki.prepared.effectiveWorkSettings(unavailable)[2].settings["work"] != true)

    val request = SignalActionRequest(1, S, "show", "preview.v1", "world", 1)
    for (failure in listOf("clear", "read", "show", "panel")) {
        val port = PreviewFake(); val session = PreviewSession()
        port.fail = failure
        session.event(port, request)
        port.fail = ""
        session.tick(port)
        check(port.shown.size == 3)
        val reads = port.reads
        repeat(8) { session.tick(port) }
        check(port.reads == reads) // Renewal never recaptures the full network.
        port.fail = "clear"
        session.event(port, request.copy(action = "close"))
        val shows = port.shows
        session.tick(port)
        check(port.shows == shows) // Closing revokes local preview even when clear is Busy.
        port.fail = ""; session.tick(port)
        check(port.shown.isEmpty() && port.closed)
    }
    val port = PreviewFake(); val session = PreviewSession()
    port.fail = "read"; session.event(port, request)
    val reads = port.reads; port.generation = 2; port.fail = ""; session.tick(port)
    check(port.reads == reads && port.shown.isEmpty()) // Do not resume an old session's plan.

    val construction = ConstructionFake(); val follower = ConstructionFollower()
    val ready = ConstructionResult(ConstructionState.Ready, 7, emptyList(), 0, false)
    val positions = listOf(source().placementAt(A, .75))
    construction.throwCreate = true
    rejected { follower.confirmCreate(construction, ready, S, positions) }
    check(follower.pending && construction.creates == 1)
    follower.closePanel()
    construction.throwPoll = true
    rejected { follower.tick(construction) }
    check(follower.pending && construction.creates == 1)
    construction.throwPoll = false
    construction.reply = ConstructionResult(ConstructionState.Applied, 7, listOf(S + 1), 0, true)
    follower.tick(construction)
    check(!follower.pending && !follower.panelOpen && construction.creates == 1)
    rejected { follower.confirmCreate(construction, ready, S, positions) }
    follower.reopenPanel(); construction.throwUndo = true
    rejected { follower.confirmUndo(construction) }
    check(follower.pending && construction.undos == 1)
    construction.reply = ConstructionResult(ConstructionState.Undone, 7, emptyList(), 0, false)
    follower.tick(construction)
    rejected { follower.confirmUndo(construction) }
    check(construction.undos == 1 && construction.creates == 1)
    construction.generation = 2; follower.tick(construction)
    check(follower.result == null)
    println("PASS: tool examples — topology, bounded preparation, settings, Busy recovery, session cleanup, one-shot create/undo and closed-panel polling")
}
