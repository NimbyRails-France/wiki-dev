package wiki.preview

import nimby.*

// Marqueurs graphiques seulement : ni planificateur de route, ni commande de pose.
fun previewPositions(network: ToolNetwork, sourceId: Long, count: Int): List<SignalPosition> {
    // 1. count est un nombre de marqueurs (1..64), pas un espacement en mètres.
    require(count in 1..64)
    val source = requireNotNull(network.topology().signal(sourceId)) { "Source ou voie indisponible." }
    // Répartir les marqueurs dans la voie source, en excluant ses deux extrémités.
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
    // 2. Cet état peut survivre à un callback ; les objets PreviewPort et ToolContext ne le peuvent pas.
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
        // Une action ancienne ne doit pas modifier l'aperçu d'une autre partie.
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
        // 3. Avancer les étapes disponibles sans boucle d'attente ; le prochain tick peut reprendre.
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
                // Capturer seulement pour un nouveau calcul, pas pour renouveler les mêmes marqueurs.
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
            // Occupé : conserver la demande d'affichage. Autre erreur : exiger un nouvel aperçu.
            if (error.isBusy) setMessage("Service occupé ; affichage de l’aperçu en attente.")
            else abandon()
        } catch (error: Exception) { abandon() }
        if (panelDirty) {
            // Republier seulement quand le contenu change ; un refus temporaire garde panelDirty.
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

// Le paramètre info permet au projet réel de fournir modInfo ; le défaut sert aux tests du guide.
fun createPreviewTool(info: ModInfo = ModInfo("preview-tool", "Outil d’aperçu")): ToolMod {
    // 4. Un clic démarre l'outil ; onTick renouvelle l'affichage ; onStop libère l'état local.
    val session = PreviewSession()
    return toolMod(info) {
        metadata(author = "Votre nom", description = "Afficher des marqueurs temporaires sans construire de signal.")
        service("preview.v1") { request -> session.event(previewPort(), request) }
        onTick { session.tick(previewPort()) }
        onStop { session.stop() }
    }
}
