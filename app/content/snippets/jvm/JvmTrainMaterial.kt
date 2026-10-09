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
    // Fiche matériel : aucun besoin de service ou de carte, mais les modèles sont affichés.
    val snapshot = game.trains.snapshot(query = TrainQuery(
        includeService = false,
        includeLocations = false,
        includeCharacteristics = true,
        includeComposition = true, // Ordre des véhicules et modèles référencés.
        includePassengers = true, // Occupants observés, distincts de la capacité.
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
    // current est le profil actuel : ne pas utiliser configured comme remplacement.
    val capacity = current?.passengerCapacity ?: return null
    if (passengers == null || capacity <= 0) return null
    // Exemple : 30 occupants / 120 places = 25 %. Un dépassement de 100 % est conservé.
    return passengers.toDouble() * 100.0 / capacity
}

// L'ordre et les répétitions de modèles décrivent la composition.
fun orderedModelIds(profile: TrainCharacteristics?): List<VehicleModelId>? =
    profile?.composition?.map { it.modelId }
