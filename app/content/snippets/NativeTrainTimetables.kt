package wiki.traintimetables

import nimby.*

data class TrainTiming(
    val id: TrainId,
    val timetable: Timetable?,
    val shift: TimetableShiftId?,
    val orderIndex: Int?,
    val observedAt: GameInstant?,
    val arrival: GameInstant?,
    val departure: GameInstant?,
    val dispatchRetry: GameInstant?,
    val predictedArrivalDelaySeconds: Double?,
    val plan: LinePlan?,
)

fun readTiming(context: ToolContext, id: TrainId): TrainTiming? {
    // Une seule requête riche avant de lire le plan dans cette capture.
    val snapshot = context.trains(TrainQuery(includeTimetables = true))
    // id vient du lot ou de la sélection de cette partie ; null signifie train indisponible.
    val train = snapshot[id] ?: return null
    val times = train.service?.times
    val plan = context.linePlan(id) // Optionnel : un plan absent ne prouve pas l'absence de ligne.
    return TrainTiming(
        id, train.assignment?.timetable, train.assignment?.shift,
        train.assignment?.orderIndex, times?.observedAt, times?.arrival,
        times?.departure, times?.dispatchRetry,
        train.predictedArrivalDelaySeconds, plan,
    )
}

// Conserver les offsets ; ne pas fabriquer une date de prochain passage.
fun plannedDwells(plan: LinePlan): List<Pair<Int, Long?>> =
    plan.stops.map { it.index to it.plannedDwellSeconds }

// Seuil en secondes simulées, fini et positif ou nul ; null conserve une estimation absente.
fun needsDelayReview(timing: TrainTiming, thresholdSeconds: Double): Boolean? {
    require(thresholdSeconds.isFinite() && thresholdSeconds >= 0.0)
    return timing.predictedArrivalDelaySeconds?.let { it >= thresholdSeconds }
}
