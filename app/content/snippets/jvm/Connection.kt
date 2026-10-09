package wiki.connection

import fr.nimby.sdk.Nimby
import fr.nimby.sdk.TrainQuery
import java.nio.file.Path

fun printTrainSpeeds(sdk: Path, processId: Int) {
    // sdk désigne la DLL compatible ; processId est le PID choisi, strictement positif.
    Nimby.connect(sdk, processId).use { game ->
        // Noms et vitesses uniquement : ne pas demander les services et les gares.
        val snapshot = game.trains.snapshot(query = TrainQuery(
            includeService = false,
            includeLocations = false,
        ))
        snapshot.trains.forEach { train ->
            // Un zéro de présentation ne prouve pas que le train est arrêté.
            val speed = train.speedKmh.takeUnless { train.speedDefaulted }
            println("${train.name} : ${speed ?: "inconnue"} km/h")
        }
        // Lecture séparée pour une heure plus récente ; snapshot.clock est celle du lot.
        println(game.clock.read()?.toInstant())
    }
}
