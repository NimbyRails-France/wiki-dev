package wiki.trainqueries

import nimby.*

data class TrainCard(
    val id: TrainId,
    val name: String,
    val speedKmh: Double?,
    val state: TrainState?,
    val alert: TrainAlert?,
    val positionStation: Station?,
    val serviceStation: Station?,
)

// Appeler depuis un callback d'outil ; ne pas conserver son ToolContext.
fun readTrainCards(context: ToolContext): List<TrainCard> {
    // Le tableau utilise l'état du service et les gares : demander ces deux groupes ensemble.
    val snapshot = context.trains(TrainQuery(includeService = true, includeLocations = true))
    return snapshot.trains.map { train ->
        // Les objets joints viennent de ce lot ; aucune autre lecture par fiche.
        TrainCard(
            train.trainId, train.name, train.speedKmh,
            train.service?.state, train.service?.alert,
            train.position?.station, train.service?.locationStation,
        )
    }
}

// null reste inconnu ; une vitesse nulle connue vaut bien 0.0.
fun measuredSpeedKmh(card: TrainCard): Double? = card.speedKmh
