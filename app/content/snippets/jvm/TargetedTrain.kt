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
    // Une lecture ciblée, sans capture complète de la carte ni boucle par train.
    val observation = game.trains.read(id) ?: return null
    // Une vitesse de secours ne permet pas de conclure que le train est arrêté.
    val measured = observation.speedMps.takeUnless { observation.speedDefaulted }
    // La génération est propre à cette connexion ; l'heure de capture est réelle, en ms UTC.
    return SpeedSample(
        id, observation.sessionGeneration, observation.capturedAtMillis,
        measured?.times(3.6), observation.currentDynamics?.maxSpeedMps?.times(3.6),
    )
}
