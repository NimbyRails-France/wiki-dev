package wiki.constructiontickets

import fr.nimby.sdk.ConstructionResult
import fr.nimby.sdk.ConstructionState
import fr.nimby.sdk.Game
import fr.nimby.sdk.Position

class ConfirmedPlacement(
    private val game: Game,
    private val sourceSignal: Long,
    confirmedPositions: List<Position>,
) {
    private val positions = confirmedPositions.toList()
    var ticket: Long? = null
        private set
    private var prepareSubmitted = false
    private var submitted = false
    private var undoSubmitted = false

    fun prepare(): ConstructionResult {
        check(!prepareSubmitted)
        prepareSubmitted = true
        val result = game.construction.prepare(sourceSignal)
        if (result.token != 0L) ticket = result.token
        return result
    }

    fun createOnce(): ConstructionResult {
        val token = checkNotNull(ticket)
        check(!submitted)
        val current = game.construction.poll(token)
        if (current.state != ConstructionState.READY) return current
        submitted = true
        return game.construction.create(token, sourceSignal, positions)
    }

    fun inspect(): ConstructionResult = game.construction.poll(checkNotNull(ticket))

    fun undoIfAvailable(): ConstructionResult {
        val token = checkNotNull(ticket)
        check(!undoSubmitted)
        val current = game.construction.poll(token)
        if (!current.canUndo) return current
        undoSubmitted = true
        return game.construction.undo(token)
    }
}
