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
    // Le tableau utilise l'état du service et les gares : demander ces deux groupes ensemble.
    val snapshot = game.trains.snapshot(query = TrainQuery(includeService = true, includeLocations = true))
    return snapshot.trains.mapNotNull { train ->
        // Jointure indexée dans la copie ; ce n'est pas une nouvelle requête au jeu.
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
