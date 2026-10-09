package wiki.clockchange

import fr.nimby.sdk.Game
import fr.nimby.sdk.SimulationTimeChange
import java.time.Instant

// Appeler après confirmation de la date UTC et du mode par l'utilisateur.
fun changeConfirmedTime(game: Game, chosenUtc: Instant, recalculateTrains: Boolean): SimulationTimeChange {
    // Le SDK demande des secondes entières ; la phase sub-seconde actuelle est conservée.
    require(chosenUtc.nano == 0)
    // false conserve positions et délais relatifs ; true demande le recalcul du jeu.
    // Une exception peut suivre le début du changement : relire avant toute autre écriture.
    return game.clock.set(chosenUtc, recalculateTrains = recalculateTrains)
}
