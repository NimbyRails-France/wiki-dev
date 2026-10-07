package wiki.topology

import nimby.*

// Suivre une chaîne sans ambiguïté. Arrêt aux aiguilles, liens inconnus et cycles.
// Cette règle ne choisit ni ne réserve un itinéraire et ne prouve pas sa liberté.
fun positionAhead(network: ToolNetwork, sourceId: Long, distanceM: Double): SignalPosition? {
    require(distanceM.isFinite() && distanceM > 0)
    val topology = network.topology()
    val source = topology.signal(sourceId) ?: return null
    var track = topology.track(source.track) ?: return null
    var direction = source.travelDirection
    var offset = source.fraction * track.lengthM
    var remaining = distanceM
    val visited = HashSet<Long>()
    repeat(4096) {
        if (!visited.add(track.id)) return null
        val toEnd = if (direction > 0) track.lengthM - offset else offset
        val stop = minOf(remaining, toEnd)
        if (track.junctionOffsetsM.any { val ahead = (it - offset) * direction; ahead >= 0 && ahead <= stop }) return null
        if (remaining < toEnd) return source.placementAt(track.id, (offset + direction * remaining) / track.lengthM, direction)
        if (remaining == toEnd) return null // Aucune pose exactement à une extrémité.
        val connection = track.connection(if (direction > 0) ToolTrackEnd.B else ToolTrackEnd.A)
        if (connection !is ToolTrackConnection.Join) return null
        remaining -= toEnd
        track = topology.track(connection.trackId) ?: return null
        direction = if (connection.entry == ToolTrackEnd.A) 1 else -1
        offset = if (direction > 0) 0.0 else track.lengthM
    }
    return null
}
