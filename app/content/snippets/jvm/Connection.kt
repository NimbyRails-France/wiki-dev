package wiki.connection

import fr.nimby.sdk.Nimby
import fr.nimby.sdk.TrainQuery
import java.nio.file.Path

fun printTrainSpeeds(sdk: Path, processId: Int) {
    Nimby.connect(sdk, processId).use { game ->
        val snapshot = game.trains.snapshot(query = TrainQuery(
            includeService = false,
            includeLocations = false,
        ))
        snapshot.trains.forEach { train ->
            // Un zéro de présentation ne prouve pas que le train est arrêté.
            val speed = train.speedKmh.takeUnless { train.speedDefaulted }
            println("${train.name} : ${speed ?: "inconnue"} km/h")
        }
        println(game.clock.read()?.toInstant())
    }
}
