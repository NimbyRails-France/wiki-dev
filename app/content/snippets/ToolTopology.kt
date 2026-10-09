package wiki.topology

import nimby.*

// Suivre une chaîne sans ambiguïté. Arrêt aux aiguilles, liens inconnus et cycles.
// Cette règle ne choisit ni ne réserve un itinéraire et ne prouve pas sa liberté.
fun positionAhead(network: ToolNetwork, sourceId: Long, distanceM: Double): SignalPosition? {
    // 1. distanceM est une distance positive en mètres, pas une fraction de voie.
    require(distanceM.isFinite() && distanceM > 0)
    // Le résultat est une position copiée ; null signifie que ce parcours ne peut pas conclure.
    val topology = network.topology()
    val source = topology.signal(sourceId) ?: return null
    var track = topology.track(source.track) ?: return null
    // Le sens vient du signal observé ; ne pas le déduire de son côté d'affichage.
    var direction = source.travelDirection
    var offset = source.fraction * track.lengthM
    var remaining = distanceM
    val visited = HashSet<Long>()
    // 2. Limiter le parcours et détecter les cycles, même sur un très grand réseau.
    repeat(4096) {
        if (!visited.add(track.id)) return null
        val toEnd = if (direction > 0) track.lengthM - offset else offset
        // Chercher une aiguille sur la portion réellement traversée avant de proposer une position.
        val stop = minOf(remaining, toEnd)
        if (track.junctionOffsetsM.any { val ahead = (it - offset) * direction; ahead >= 0 && ahead <= stop }) return null
        if (remaining < toEnd) return source.placementAt(track.id, (offset + direction * remaining) / track.lengthM, direction)
        if (remaining == toEnd) return null // Aucune pose exactement à une extrémité.
        // 3. Changer de voie uniquement par un raccord connu ; Junction et Unknown sont refusés.
        val connection = track.connection(if (direction > 0) ToolTrackEnd.B else ToolTrackEnd.A)
        if (connection !is ToolTrackConnection.Join) return null
        remaining -= toEnd
        track = topology.track(connection.trackId) ?: return null
        // Entrer par A continue vers B ; entrer par B continue vers A.
        direction = if (connection.entry == ToolTrackEnd.A) 1 else -1
        offset = if (direction > 0) 0.0 else track.lengthM
    }
    return null
}
