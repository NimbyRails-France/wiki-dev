package wiki.jvmtrainmaterial

import fr.nimby.sdk.*

data class MaterialCard(
    val id: TrainId,
    val configured: TrainCharacteristics?,
    val current: TrainCharacteristics?,
    val passengers: Int?,
    val occupancyPercent: Double?,
)

fun readMaterial(game: Game): List<MaterialCard> {
    val snapshot = game.trains.snapshot(query = TrainQuery(
        includeService = false,
        includeLocations = false,
        includeCharacteristics = true,
        includeComposition = true,
        includePassengers = true,
    ))
    return snapshot.trains.mapNotNull { train ->
        val record = snapshot.train(train.trainId) ?: return@mapNotNull null
        val current = record.metadata?.current
        val passengers = record.details?.passengers
        MaterialCard(
            train.trainId, record.metadata?.configured, current, passengers,
            occupancyPercent(passengers, current),
        )
    }
}

// Un nombre d'occupants inconnu ne devient jamais zéro.
fun occupancyPercent(passengers: Int?, current: TrainCharacteristics?): Double? {
    val capacity = current?.passengerCapacity ?: return null
    if (passengers == null || capacity <= 0) return null
    return passengers.toDouble() * 100.0 / capacity
}

fun orderedModelIds(profile: TrainCharacteristics?): List<VehicleModelId>? =
    profile?.composition?.map { it.modelId }
