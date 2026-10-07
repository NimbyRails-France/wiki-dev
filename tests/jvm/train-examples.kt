package wiki.jvmtests

import fr.nimby.sdk.*
import wiki.jvmtrainlines.hasTag
import wiki.jvmtrainmaterial.occupancyPercent
import wiki.jvmtrainmaterial.orderedModelIds
import wiki.jvmtrainqueries.TrainCard
import wiki.jvmtraintimetables.PlannedStop
import wiki.jvmtraintimetables.TrainTiming
import java.time.Instant

// Pure tests: no SDK library is loaded and no game connection is opened.
fun main() {
    var checks = 0
    fun expect(condition: Boolean, description: String) {
        check(condition) { description }
        checks++
    }
    fun profile(capacity: Int?, composition: List<TrainVehicle>? = null) =
        TrainCharacteristics(
            maximumSpeedMps = 50.0, lengthM = null, emptyMassKg = null,
            passengerCapacity = capacity, carCount = composition?.size,
            maximumAccelerationMps2 = null, powerW = null, tractiveForceN = null,
            composition = composition,
        )

    val tag = Tag(TagId(7), null)
    expect(hasTag(null, tag.id) == null, "Unknown tag membership stays unknown")
    expect(hasTag(emptyList(), tag.id) == false, "Known empty tags establish absence")
    expect(hasTag(listOf(tag), tag.id) == true, "An unnamed tag retains its identity")
    expect(hasTag(listOf(tag), TagId(8)) == false, "Labels are not tag identities")

    expect(occupancyPercent(null, profile(100)) == null, "Unknown occupants are not zero")
    expect(occupancyPercent(10, null) == null, "Unknown current material has no fallback")
    expect(occupancyPercent(10, profile(null)) == null, "Unknown capacity stays unknown")
    expect(occupancyPercent(0, profile(0)) == null, "Zero capacity is not a valid divisor")
    expect(occupancyPercent(10, profile(-1)) == null, "Nonpositive capacity is rejected")
    expect(occupancyPercent(0, profile(100)) == 0.0, "Known zero occupants give zero percent")
    expect(occupancyPercent(30, profile(120)) == 25.0, "Occupancy is expressed as a percentage")
    expect(occupancyPercent(150, profile(100)) == 150.0, "Observed ratios are not silently clamped")
    expect(profile(100).maximumSpeedKmh == 180.0, "Material m/s conversion uses 3.6")

    val model = VehicleModel(VehicleModelId(10), null, null, null)
    val other = VehicleModel(VehicleModelId(11), "B", "Model B", null)
    val configured = profile(120, listOf(TrainVehicle(0, model), TrainVehicle(1, model), TrainVehicle(2, other)))
    val current = profile(40, listOf(TrainVehicle(0, other)))
    expect(orderedModelIds(null) == null, "Unknown material has an unknown composition")
    expect(orderedModelIds(profile(0)) == null, "Unknown composition is not an empty list")
    expect(orderedModelIds(profile(0, emptyList())) == emptyList<VehicleModelId>(), "Known empty composition stays empty")
    expect(orderedModelIds(configured) == listOf(model.id, model.id, other.id), "Vehicle order and duplicate models are preserved")
    expect(occupancyPercent(20, current) == 50.0, "Current capacity is independent of configured capacity")
    expect(orderedModelIds(current) == listOf(other.id), "Current composition is not filled from configured material")

    val card = TrainCard(TrainId(1), "Same name", null, null, null, null, null)
    expect(card.speedKmh == null && card.state == null, "A card preserves unknown speed and state")
    expect(card.copy(state = TrainState.Unknown).state != null, "An observed Unknown state differs from unavailable")
    expect(card.copy(alert = TrainAlert.None).alert != null, "Observed no-alert differs from unavailable")

    val now = Instant.parse("1900-01-01T00:00:00Z")
    val timing = TrainTiming(
        TrainId(1), Timetable(TimetableId(2)), TimetableShiftId(TimetableId(2), 3),
        0, now, null, null, null, -30.5,
        listOf(PlannedStop(0, null, 10, 40, 30)),
    )
    expect(timing.timetable?.name == null, "No timetable name is manufactured")
    expect(timing.arrival == null && timing.stops?.first()?.arrivalOffsetSeconds == 10, "A plan offset does not create an absolute arrival")
    expect(timing.predictedArrivalDelaySeconds == -30.5, "Predicted early arrival keeps its sign")
    expect(timing.shift != TimetableShiftId(TimetableId(4), 3), "Shift identity is scoped to a timetable")
    expect(timing.stops?.first()?.station == null, "An unresolved station is not replaced")
    println("Train guide pure JVM contracts: $checks passed")
}
