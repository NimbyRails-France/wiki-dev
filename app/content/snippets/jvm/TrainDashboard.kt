package wiki.firstapplication

import fr.nimby.sdk.Nimby
import fr.nimby.sdk.SdkException
import fr.nimby.sdk.TrainQuery
import java.nio.file.Files
import java.nio.file.Path
import kotlin.system.exitProcess

fun main(args: Array<String>) {
    // Sans argument : découvrir les PID, sans ouvrir de DLL ni modifier la partie.
    if (args.isEmpty()) {
        val games = Nimby.runningGames()
        if (games.isEmpty()) println("Aucune partie accessible : ouvrez NIMBY Rails.")
        games.forEach { println("PID=${it.pid} ${it.executable}") }
        return
    }

    // Deux arguments explicites : chemin de la DLL puis PID de la partie choisie.
    if (args.size != 2) {
        System.err.println("Usage : TrainDashboard <SDK.dll> <PID>")
        exitProcess(2)
    }
    try {
        val sdk = Path.of(args[0]).toAbsolutePath().normalize()
        require(Files.isRegularFile(sdk)) { "Bibliothèque SDK introuvable : $sdk" }
        val pid = args[1].toIntOrNull()
        require(pid != null && pid > 0) { "Le PID doit être un entier strictement positif." }

        // use possède la connexion pour ce relevé et la ferme aussi en cas d'exception.
        Nimby.connect(sdk = sdk, processId = pid).use { game ->
            // L'écran n'utilise que les noms et vitesses : pas de service ni de localisation.
            val snapshot = game.trains.snapshot(query = TrainQuery(
                includeService = false,
                includeLocations = false,
            ))
            println("Trains observés : ${snapshot.trains.size}")
            println("Heure simulée du lot : ${snapshot.clock?.toInstant() ?: "indisponible"}")
            snapshot.trains.forEach { train ->
                // null est inconnu ; 0.0 connu est bien une vitesse mesurée nulle.
                val speed = train.speedKmh.takeUnless { train.speedDefaulted }
                val label = speed?.let { "$it km/h" } ?: "vitesse inconnue"
                println("${train.trainId.value} ${train.name} : $label")
            }
        }
    } catch (failure: Exception) {
        // Aucun réessai automatique : conserver le statut et expliquer l'échec à l'utilisateur.
        val status = (failure as? SdkException)?.status
        System.err.println("Connexion ou lecture impossible (statut SDK=$status) : ${failure.message}")
        exitProcess(1)
    } catch (failure: UnsatisfiedLinkError) {
        // Échec du chargement natif : vérifier le chemin et le runtime Windows x64 compatible.
        System.err.println("Chargement de la bibliothèque impossible : ${failure.message}")
        exitProcess(1)
    }
}
