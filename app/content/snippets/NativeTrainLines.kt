package wiki.trainlines

import nimby.*

data class LineTags(
    val line: Line,
    val declared: List<Tag>?,
    val includingParents: List<Tag>?,
)

fun readLineTags(context: ToolContext, id: LineId): LineTags? {
    val snapshot = context.trains(TrainQuery(
        includeService = false,
        includeLocations = false,
        includeTags = true,
    ))
    val line = snapshot.line(id) ?: return null
    return LineTags(line, line.declaredTags, snapshot.tagsForLine(id))
}

// Résultat ternaire : true, false ou appartenance inconnue.
fun hasTag(tags: List<Tag>?, id: TagId): Boolean? =
    tags?.any { it.id == id }
