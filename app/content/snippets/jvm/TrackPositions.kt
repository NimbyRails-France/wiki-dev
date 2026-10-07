package wiki.trackpositions

import fr.nimby.sdk.Observation
import fr.nimby.sdk.Position
import fr.nimby.sdk.TrackDirection
import fr.nimby.sdk.TrackId

class TrackPositions(snapshot: Observation) {
    private val metrics = snapshot.trackMetrics?.associateBy { it.trackId }

    fun atMetres(track: TrackId, offsetM: Double, direction: TrackDirection): Position? {
        val metric = metrics?.get(track.value) ?: return null
        if (!offsetM.isFinite() || offsetM !in 0.0..metric.lengthM) return null
        return metric.positionAtMetres(offsetM, direction)
    }
}
