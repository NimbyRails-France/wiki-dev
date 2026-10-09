package wiki.trainlines

import nimby.*

data class LineTags(
    val line: Line,
    val declared: List<Tag>?,
    val includingParents: List<Tag>?,
)

fun readLineTags(context: ToolContext, id: LineId): LineTags? {
    // id provient du catalogue de cette partie, pas d'un nom de ligne.
    val snapshot = context.trains(TrainQuery(
        includeService = false,
        includeLocations = false,
        includeTags = true, // Inclut les lignes nécessaires à la résolution des parents.
    ))
    // Une ligne non résolue reste absente ; ses tags ne deviennent pas une liste vide.
    val line = snapshot.line(id) ?: return null
    return LineTags(line, line.declaredTags, snapshot.tagsForLine(id))
}

// Résultat ternaire : true, false ou appartenance inconnue.
fun hasTag(tags: List<Tag>?, id: TagId): Boolean? =
    tags?.any { it.id == id }
