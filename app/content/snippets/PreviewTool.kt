package wiki.preview

import nimby.*

// Marqueurs graphiques seulement : ni planificateur de route, ni commande de pose.
fun previewPositions(network: ToolNetwork, sourceId: Long, count: Int): List<SignalPosition> {
    require(count in 1..64)
    val source = requireNotNull(network.topology().signal(sourceId)) { "Source ou voie indisponible." }
    return (1..count).map { source.placementAt(source.track, it.toDouble() / (count + 1)) }
}

// Interface de test autour des appels publics ; recréée à chaque callback, jamais conservée.
interface PreviewPort {
    val worldId: String
    val generation: Long
    fun network(): ToolNetwork
    fun clear()
    fun show(request: SignalActionRequest, positions: List<SignalPosition>)
    fun panel(request: SignalActionRequest, message: String, count: Int, closed: Boolean)
}

class PreviewSession {
    private var request: SignalActionRequest? = null
    private var count = 3
    private var positions: List<SignalPosition>? = null
    private var clearRequested = false
    private var calculationRequested = false
    private var closed = false
    private var panelDirty = false
    private var message = "Choisissez le nombre de marqueurs."
    private var idleMessage = message

    fun event(port: PreviewPort, next: SignalActionRequest) {
        if (next.worldId != port.worldId || next.generation != port.generation) return
        request = next
        positions = null // Révoquer localement AVANT les appels qui peuvent être refusés.
        calculationRequested = false
        clearRequested = true
        closed = next.action == "close"
        if (next.action == "count") next.value?.takeIf { it in 1..64 }?.let { count = it }
        calculationRequested = next.action == "show"
        message = if (closed) "" else "Aperçu masqué."
        idleMessage = message
        panelDirty = true
        tick(port)
    }

    fun tick(port: PreviewPort) {
        val current = request ?: return
        if (current.worldId != port.worldId || current.generation != port.generation) {
            stop()
            return
        }
        try {
            if (clearRequested) {
                port.clear(); clearRequested = false
                if (!calculationRequested) setMessage(idleMessage)
            }
            if (calculationRequested) {
                val snapshot = port.network()
                check(snapshot.worldId == current.worldId && snapshot.generation == current.generation)
                positions = previewPositions(snapshot, current.signalId, count)
                calculationRequested = false
            }
            positions?.let {
                port.show(current, it) // Renouveler les positions copiées, sans nouvelle capture.
                setMessage("Affichage de ${it.size} marqueurs temporaires.")
            }
        } catch (error: ToolOperationException) {
            if (error.isBusy) setMessage("Service occupé ; affichage de l’aperçu en attente.")
            else abandon()
        } catch (error: Exception) { abandon() }
        if (panelDirty) {
            try {
                port.panel(current, message, count, closed)
                panelDirty = false
            } catch (error: ToolOperationException) {
                if (!error.isBusy) stop()
            } catch (error: Exception) { stop() }
        }
    }

    private fun setMessage(value: String) {
        if (message != value) { message = value; panelDirty = true }
    }
    private fun abandon() {
        positions = null
        calculationRequested = false
        clearRequested = true
        idleMessage = "Aperçu indisponible ; demandez un nouvel aperçu."
        setMessage(idleMessage)
    }
    fun stop() {
        request = null; positions = null
        calculationRequested = false; clearRequested = false; panelDirty = false
    }
}

private fun ToolContext.previewPort() = object : PreviewPort {
    override val worldId get() = this@previewPort.worldId
    override val generation get() = this@previewPort.generation
    override fun network() = this@previewPort.network()
    override fun clear() = clearSignalPreview()
    override fun show(request: SignalActionRequest, positions: List<SignalPosition>) = showSignalPreview(request, positions)
    override fun panel(request: SignalActionRequest, message: String, count: Int, closed: Boolean) {
        if (closed) showPanel(request, "", listOf(ToolButton(request.originAction, "Ouvrir l’outil d’aperçu")))
        else showPanel(request, message,
            listOf(ToolButton("show", "Afficher l’aperçu"), ToolButton("hide", "Masquer"), ToolButton("close", "Fermer")),
            listOf(ToolNumberInput("count", "Nombre de marqueurs", count, 1, 64)))
    }
}

fun createPreviewTool(): ToolMod {
    val session = PreviewSession()
    return toolMod("preview-tool", "Outil d’aperçu") {
        service("preview.v1") { request -> session.event(previewPort(), request) }
        onTick { session.tick(previewPort()) }
        onStop { session.stop() }
    }
}
