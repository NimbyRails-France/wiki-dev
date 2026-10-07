package wiki.jvmtrainlines

import fr.nimby.sdk.*

data class LineTags(
    val line: Line,
    val declared: List<Tag>?,
    val includingParents: List<Tag>?,
)

fun readLineTags(game: Game, id: LineId): LineTags? {
    val snapshot = game.trains.snapshot(query = TrainQuery(
        includeService = false,
        includeLocations = false,
        includeTags = true,
    ))
    val line = snapshot.line(id) ?: return null
    return LineTags(line, line.declaredTags, snapshot.tagsForLine(id))
}

// Un nom traduit ou renommé ne remplace pas l'identifiant du tag.
fun hasTag(tags: List<Tag>?, id: TagId): Boolean? =
    tags?.any { it.id == id }
