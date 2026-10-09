package wiki.trainmaterial

import nimby.*

data class MaterialCard(
    val id: TrainId,
    val configured: TrainCharacteristics?,
    val current: TrainCharacteristics?,
    val passengers: Int?,
    val occupancyPercent: Double?,
)

fun readMaterial(context: ToolContext): List<MaterialCard> {
    // Fiche matériel : aucun besoin de service ou de carte, mais les modèles sont affichés.
    val snapshot = context.trains(TrainQuery(
        includeService = false,
        includeLocations = false,
        includeCharacteristics = true,
        includeComposition = true, // Ordre des véhicules et modèles référencés.
        includePassengers = true, // Occupants observés, distincts de la capacité.
    ))
    return snapshot.trains.map { train ->
        MaterialCard(
            train.trainId, train.configured, train.current, train.passengers,
            occupancyPercent(train.passengers, train.current),
        )
    }
}

// Aucune capacité de remplacement quand le matériel actuel est inconnu.
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
