package wiki.traineditortests

import nimby.*
import nimby.mod.createMod
import nimby.mod.modInfo
import nimby.internal.ModOptionsAccess

// Check the copied example as an SDK consumer without opening the game.
fun main() {
    val mod = createMod()
    check(mod.id == modInfo.id && mod.title == modInfo.title)
    check(mod.options.size == 1 && mod.options.single() is IntegerOption)
    check(mod.windows.isEmpty())
    check((mod as ToolMod).services.isEmpty())

    val editor = checkNotNull(mod.trainEditor)
    val limit = editor.maximumLength
    val option = mod.options.single() as IntegerOption
    check(limit.optionId == option.id && limit.maximumLengthMeters == 850)
    check(option.minimum == minimumTrainLengthMeters && option.maximum == maximumTrainLengthMeters)
    check(limit.exceeded == tr("train.exceeded"))
    check(limit.lengthUnavailable == tr("train.lengthUnavailable"))
    check(limit.verificationUnavailable == tr("train.verificationUnavailable"))

    val preferences = ModOptionsAccess(mod.options, mod.windows.size)
    fun configure(meters: String) = preferences.apply("$meters\u0000".encodeToByteArray(), 1)
    configure("700")
    check(limit.maximumLengthMeters == 700 && option.value == 700)
    check(mod.trainEditor === editor)
    check(limit.exceeded == tr("train.exceeded"))

    for (invalid in listOf("0", "10001", "0700", "invalid")) {
        check(runCatching { configure(invalid) }.isFailure)
        check(limit.maximumLengthMeters == 700)
    }
    configure("1200")
    check(limit.maximumLengthMeters == 1200)
    println("PASS: train editor example - linked preference, static messages and validated updates")
}
