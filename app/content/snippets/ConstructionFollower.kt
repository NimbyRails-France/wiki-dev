package wiki.construction

import nimby.*

// Suit une opération ; ce n’est ni un planificateur ni un bouton Appliquer. Avant confirmCreate,
// l’appelant prépare, relit et compare le plan explicitement approuvé.
interface ConstructionPort {
    // Cet adaptateur n'est utilisé que pendant le callback qui l'a créé.
    val worldId: String
    val generation: Long
    fun create(ticket: Long, source: Long, positions: List<SignalPosition>): ConstructionResult
    fun undo(ticket: Long): ConstructionResult
    fun poll(ticket: Long): ConstructionResult
}

class ConstructionFollower {
    // 1. Conserver le résultat et son ticket ; ne jamais conserver le contexte de jeu.
    var result: ConstructionResult? = null; private set
    var pending = false; private set
    var panelOpen = true; private set
    private var world: Pair<String, Long>? = null
    private var undoIssued = false

    fun confirmCreate(port: ConstructionPort, prepared: ConstructionResult,
                      source: Long, approvedPositions: List<SignalPosition>) {
        // 2. ready et token non nul sont nécessaires, mais le plan doit aussi avoir été approuvé.
        require(!pending && prepared.state == ConstructionState.Ready && prepared.token != 0L)
        require(source != 0L && approvedPositions.size in 1..64)
        require(approvedPositions.all { it.fraction.isFinite() && it.fraction > 0 && it.fraction < 1 && (it.direction == 1 || it.direction == -1) })
        require(approvedPositions.map { it.trackId to it.fraction }.distinct().size == approvedPositions.size)
        check(result?.token != prepared.token) { "Ce ticket a déjà été envoyé." }
        // La source et les positions appartiennent à cette session ; un rechargement les invalide.
        world = port.worldId to port.generation
        result = prepared
        undoIssued = false
        pending = true // AVANT l’appel : une exception peut laisser le résultat inconnu.
        accept(port.create(prepared.token, source, approvedPositions))
    }

    fun confirmUndo(port: ConstructionPort) {
        // 3. canUndo est une disponibilité observée, à vérifier de nouveau avant la commande.
        check(world == (port.worldId to port.generation))
        val previous = requireNotNull(result)
        check(!pending && !undoIssued && previous.canUndo)
        undoIssued = true
        pending = true
        accept(port.undo(previous.token))
    }

    fun tick(port: ConstructionPort) {
        // 4. Une opération déjà envoyée est suivie par poll ; elle n'est jamais renvoyée par create.
        if (world != null && world != (port.worldId to port.generation)) { stop(); return }
        if (pending) accept(port.poll(requireNotNull(result).token))
    }

    private fun accept(next: ConstructionResult) {
        // Applied, Partial ou Rejected sont des résultats à présenter, pas à convertir en succès.
        check(next.token == result?.token) { "Un résultat d’un autre ticket est refusé." }
        result = next
        pending = next.state == ConstructionState.Pending
    }
    fun closePanel() { panelOpen = false } // Fermer n’est pas annuler ; continuer le suivi.
    fun reopenPanel() { panelOpen = true }
    fun stop() { result = null; pending = false; world = null; undoIssued = false }
}

// Créer pour le callback courant seulement ; ne jamais conserver cet adaptateur/contexte.
fun ToolContext.constructionPort() = object : ConstructionPort {
    override val worldId get() = this@constructionPort.worldId
    override val generation get() = this@constructionPort.generation
    override fun create(ticket: Long, source: Long, positions: List<SignalPosition>) = createSignals(ticket, source, positions)
    override fun undo(ticket: Long) = undoConstruction(ticket)
    override fun poll(ticket: Long) = pollConstruction(ticket)
}
