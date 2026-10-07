package wiki.targetedtrain

import fr.nimby.sdk.Game
import fr.nimby.sdk.TrainId

data class SpeedSample(
    val train: TrainId,
    val generation: Long,
    val capturedAtMillis: Long,
    val speedKmh: Double?,
    val currentMaximumKmh: Double?,
)

fun readSpeed(game: Game, id: TrainId): SpeedSample? {
    val observation = game.trains.read(id) ?: return null
    val measured = observation.speedMps.takeUnless { observation.speedDefaulted }
    return SpeedSample(
        id, observation.sessionGeneration, observation.capturedAtMillis,
        measured?.times(3.6), observation.currentDynamics?.maxSpeedMps?.times(3.6),
    )
}
