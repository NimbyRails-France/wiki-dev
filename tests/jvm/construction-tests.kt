package wiki.jvmtests

import fr.nimby.sdk.Observation
import fr.nimby.sdk.Position
import fr.nimby.sdk.Signal
import fr.nimby.sdk.Track
import wiki.constructiontickets.unchangedConfirmedPlan

// These tests exercise copied observations only; no game or SDK library is opened.
fun verifyConstructionPlans(expect: (Boolean, String) -> Unit) {
    val source = Signal(100, Position(10, 0.25, 1), 1, null, null, null)
    val snapshot = Observation(
        capturedAtMillis = 200, processId = 1, gameHash = "fixture",
        trains = emptyList(), tracks = listOf(Track(10, null, 80.0), Track(11, null, 80.0)),
        stations = emptyList(), nodes = emptyList(), junctions = emptyList(),
        signals = listOf(source), services = emptyList(), details = emptyList(),
        platforms = emptyList(), reservations = null, occupations = null,
        selectedPath = null, lineStops = null, clock = null,
    )
    val confirmed = listOf(Position(10, 0.5, 1), Position(11, 0.75, -1))
    fun validate(
        plan: List<Position>?,
        observed: Observation = snapshot,
        intent: List<Position> = confirmed,
    ) = unchangedConfirmedPlan(observed, source.id, intent, plan)

    val fresh = confirmed.map { it.copy() }.toMutableList()
    val accepted = validate(fresh)
    expect(accepted == confirmed && accepted !== fresh, "An unchanged fresh plan is copied before submission")
    fresh.clear()
    expect(accepted == confirmed, "A later mutation of the calculator list cannot alter the submitted copy")
    expect(validate(null) == null, "Unavailable geometry is rejected rather than using old positions")
    expect(validate(confirmed, snapshot.copy(signals = emptyList())) == null, "A missing source prevents creation")
    expect(validate(confirmed, snapshot.copy(signals = listOf(source.copy(id = 101)))) == null, "A different source is not silently substituted")
    expect(validate(confirmed, snapshot.copy(tracks = listOf(snapshot.tracks.first()))) == null, "A disappeared target track invalidates the confirmed plan")
    expect(validate(confirmed.reversed()) == null, "A changed placement order needs a new confirmation")
    expect(validate(listOf(confirmed[0].copy(fraction = 0.6), confirmed[1])) == null, "A changed fraction needs a new confirmation")
    expect(validate(listOf(confirmed[0].copy(direction = -1), confirmed[1])) == null, "A changed direction needs a new confirmation")
    expect(validate(listOf(confirmed[0].copy(trackId = 11), confirmed[1])) == null, "A changed target track needs a new confirmation")
    expect(validate(emptyList(), intent = emptyList()) == null, "An empty batch cannot be submitted")

    val maximum = (1..64).map { Position(10, it / 65.0, 1) }
    expect(validate(maximum, intent = maximum) == maximum, "The complete 64-position batch remains valid")
    val oversized = (1..65).map { Position(10, it / 66.0, 1) }
    expect(validate(oversized, intent = oversized) == null, "A 65-position batch is refused")
    for (fraction in listOf(0.0, 1.0, Double.NaN, Double.POSITIVE_INFINITY, -0.1, 1.1)) {
        val invalid = listOf(Position(10, fraction, 1))
        expect(validate(invalid, intent = invalid) == null, "Invalid or non-interior fraction $fraction is refused")
    }
    val badDirection = listOf(Position(10, 0.5, 0))
    expect(validate(badDirection, intent = badDirection) == null, "A direction other than plus or minus one is refused")
    val duplicate = listOf(Position(10, 0.5, 1), Position(10, 0.5, -1))
    expect(validate(duplicate, intent = duplicate) == null, "Opposite directions do not make duplicate positions distinct")
    expect(confirmed == listOf(Position(10, 0.5, 1), Position(11, 0.75, -1)), "Validation does not mutate the confirmed intent")
}
