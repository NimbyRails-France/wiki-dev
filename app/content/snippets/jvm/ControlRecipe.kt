package wiki.controlrecipe

import fr.nimby.sdk.ControlResponse
import fr.nimby.sdk.Game
import fr.nimby.sdk.ModControlSession

fun <T> withSignalRecipe(
    game: Game,
    modId: String,
    signalId: Long,
    aspectFromMod: Int,
    observe: (ModControlSession, ControlResponse) -> T,
): T = game.mods.control(modId, leaseMillis = 5_000).use { recipe ->
    // Le mod fournit le code d'aspect ; le bail dure ici 5 secondes réelles.
    val accepted = recipe.forceSignal(signalId, aspectFromMod)
    // La demande acceptée n'est pas la preuve du rendu : observe organise les vérifications.
    observe(recipe, accepted)
    // use libère le bail même si observe lève une exception ; aucun renouvellement automatique.
}
