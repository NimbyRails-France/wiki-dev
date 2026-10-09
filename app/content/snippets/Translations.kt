package wiki.translations

import nimby.*

// 1. La clé du réglage reste fixe ; label et description sont les textes traduits.
val maintenance = Checkbox(
    "maintenance", tr("maintenance"), tr("maintenance.help")
)

// 2. Le mod choisit le pluriel. count remplace {count} dans chaque langue du JSON.
// Retourner cette valeur directement au panneau ; ne pas y concaténer un autre tr(...).
fun summary(count: Int): String =
    tr(if (count == 1) "count.one" else "count.many", "count" to count)

fun createTranslatedTool(info: ModInfo = ModInfo("my-translated-tool", "Mon outil traduit")): ToolMod = toolMod(info) {
    metadata(author = "Votre nom", name = tr("mod.name"), description = tr("mod.description"))
    service("message.v1") { request ->
        // 3. Le clic choisit une source ; showPanel renvoie un message et un bouton à cette source.
        showPanel(request, summary(3), listOf(
            ToolButton(request.originAction, tr("repeat"))
        ))
    }
}
