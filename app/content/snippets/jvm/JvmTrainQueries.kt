package wiki.jvmtrainqueries

import fr.nimby.sdk.*
import java.nio.file.Path

data class TrainCard(
    val id: TrainId,
    val name: String,
    val speedKmh: Double?,
    val state: TrainState?,
    val alert: TrainAlert?,
    val positionStation: Station?,
    val serviceStation: Station?,
)

fun readTrainCards(game: Game): List<TrainCard> {
    val snapshot = game.trains.snapshot(query = TrainQuery())
    return snapshot.trains.mapNotNull { train ->
        val record = snapshot.train(train.trainId) ?: return@mapNotNull null
        TrainCard(
            train.trainId, train.name, train.speedKmh,
            record.service?.state, record.service?.alertState,
            record.positionStation, record.locationStation,
        )
    }
}

// Exemple ponctuel ; une application conserve sa connexion entre deux lectures.
fun readOnce(sdkLibrary: Path, gamePid: Int): List<TrainCard> =
    Nimby.connect(sdk = sdkLibrary, processId = gamePid).use(::readTrainCards)
