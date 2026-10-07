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
    val accepted = recipe.forceSignal(signalId, aspectFromMod)
    observe(recipe, accepted)
}
