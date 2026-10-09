package wiki.trackpositions

import fr.nimby.sdk.Observation
import fr.nimby.sdk.Position
import fr.nimby.sdk.TrackDirection
import fr.nimby.sdk.TrackId

class TrackPositions(snapshot: Observation) {
    // Une seule indexation par capture ; une nouvelle capture demande un nouvel index.
    private val metrics = snapshot.trackMetrics?.associateBy { it.trackId }

    fun atMetres(track: TrackId, offsetM: Double, direction: TrackDirection): Position? {
        // offsetM est mesuré depuis l'origine de la voie, même en sens Backward.
        val metric = metrics?.get(track.value) ?: return null
        // L'exemple retourne null plutôt que d'extrapoler hors de la voie.
        if (!offsetM.isFinite() || offsetM !in 0.0..metric.lengthM) return null
        return metric.positionAtMetres(offsetM, direction)
    }
}
