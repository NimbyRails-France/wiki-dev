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
    val train = snapshot[id] ?: return null
    val times = train.service?.times
    val plan = context.linePlan(id)
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
