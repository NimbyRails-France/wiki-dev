package wiki.jvmtraintimetables

import fr.nimby.sdk.*
import java.time.Instant

data class PlannedStop(
    val index: Int,
    val station: Station?,
    val arrivalOffsetSeconds: Int?,
    val departureOffsetSeconds: Int?,
    val dwellSeconds: Long?,
)

data class TrainTiming(
    val id: TrainId,
    val timetable: Timetable?,
    val shift: TimetableShiftId?,
    val orderIndex: Int?,
    val observedAt: Instant?,
    val arrival: Instant?,
    val departure: Instant?,
    val dispatchRetry: Instant?,
    val predictedArrivalDelaySeconds: Double?,
    val stops: List<PlannedStop>?,
)

fun readTiming(game: Game, id: TrainId): TrainTiming? {
    // selectedTrain ajoute son plan ; la liste trains reste une capture par lot.
    val snapshot = game.trains.snapshot(
        selectedTrain = id,
        query = TrainQuery(includeTimetables = true),
    )
    val record = snapshot.train(id) ?: return null
    val service = record.service
    val stops = snapshot.lineStops?.map { stop ->
        PlannedStop(
            stop.index, stop.station?.let(snapshot::station),
            stop.arrivalOffsetSeconds, stop.departureOffsetSeconds,
            stop.plannedDwellSeconds,
        )
    }
    return TrainTiming(
        id, record.details?.timetable, record.details?.shift,
        record.details?.orderIndex, service?.observedAt, service?.arrival,
        service?.departure, service?.dispatchRetry,
        record.metadata?.predictedArrivalDelaySeconds, stops,
    )
}
