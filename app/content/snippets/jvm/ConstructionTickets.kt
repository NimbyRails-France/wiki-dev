package wiki.constructiontickets

import fr.nimby.sdk.ConstructionResult
import fr.nimby.sdk.ConstructionState
import fr.nimby.sdk.Game
import fr.nimby.sdk.Observation
import fr.nimby.sdk.Position

// Validation locale pure : null signifie que le plan doit être revu et confirmé.
fun unchangedConfirmedPlan(
    snapshot: Observation,
    sourceSignal: Long,
    confirmedPositions: List<Position>,
    recalculatedPositions: List<Position>?,
): List<Position>? {
    val currentPositions = recalculatedPositions?.toList() ?: return null
    // Comparaison exacte, ordre et sens compris : ne pas corriger le plan en silence.
    if (currentPositions != confirmedPositions || currentPositions.size !in 1..64) return null
    if (snapshot.signals.none { it.id == sourceSignal }) return null
    if (currentPositions.any {
        !it.fraction.isFinite() || it.fraction <= 0.0 || it.fraction >= 1.0 ||
            (it.direction != -1 && it.direction != 1) || snapshot.track(it.trackId) == null
    }) return null
    // Deux sens opposés au même emplacement constituent aussi un doublon.
    if (currentPositions.map { it.trackId to it.fraction }.toSet().size != currentPositions.size) return null
    return currentPositions
}

class ConfirmedPlacement(
    private val game: Game,
    private val sourceSignal: Long,
    confirmedPositions: List<Position>,
) {
    // Cette copie conserve l'intention confirmée, pas une autorisation de créer.
    private val positions = confirmedPositions.toList()
    var ticket: Long? = null
        private set
    private var prepareSubmitted = false
    private var submitted = false
    private var undoSubmitted = false

    fun prepare(): ConstructionResult {
        check(!prepareSubmitted)
        // Marquer avant l'écriture : une exception ne justifie pas un second prepare.
        prepareSubmitted = true
        val result = game.construction.prepare(sourceSignal)
        if (result.token != 0L) ticket = result.token
        return result
    }

    fun createOnce(recalculate: (Observation) -> List<Position>?): ConstructionResult {
        val token = checkNotNull(ticket)
        check(!submitted)
        val current = game.construction.poll(token)
        // PENDING se traite par inspect ; le lot n'est soumis qu'après READY.
        if (current.state != ConstructionState.READY) return current
        // Capturer après prepare : recalculer avec cette copie, jamais avec l'ancienne.
        val snapshot = game.snapshot()
        val currentPositions = checkNotNull(
            unchangedConfirmedPlan(snapshot, sourceSignal, positions, recalculate(snapshot)),
        ) { "Plan modifié ou invérifiable : revoir et confirmer avant de créer." }
        // Le SDK contrôle encore le ticket, la session et la révision lors de create.
        // Marquer avant l'écriture : une réponse perdue peut cacher une création réussie.
        submitted = true
        return game.construction.create(token, sourceSignal, currentPositions)
    }

    // Lecture de suivi à la cadence de l'application, sans resoumettre la création.
    fun inspect(): ConstructionResult = game.construction.poll(checkNotNull(ticket))

    fun undoIfAvailable(): ConstructionResult {
        val token = checkNotNull(ticket)
        check(!undoSubmitted)
        val current = game.construction.poll(token)
        // Une action ultérieure de l'éditeur peut retirer la possibilité d'annuler.
        if (!current.canUndo) return current
        undoSubmitted = true
        return game.construction.undo(token)
    }
}
