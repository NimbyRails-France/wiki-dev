import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { declarations } from '../scripts/kotlin-api.mjs'

test('constructor properties are included once; internal scopes stay hidden', () => {
  const symbols = declarations(`
internal data class Secret(
    val token: String
)
/** Public values. */
data class Public(
    val speed: Double,
    val position: Long?
) {
    private fun hidden() { fun local() {} }
    /** Measured distance. */
    fun distance(scale: Double): Double = speed * scale
}
`)
  assert.deepEqual(
    symbols.map((s) => s.name),
    ['Public', 'speed', 'position', 'distance'],
  )
  assert.match(symbols[0].signature, /val position: Long\?/)
  assert(symbols.slice(1).every((s) => s.owner === 'Public'))
  assert.equal(symbols[3].documentation, 'Measured distance.')
  assert.equal(symbols[3].signature, 'fun distance(scale: Double): Double')
})

test('typed DSL function name survives nested generic bounds', () => {
  const [symbol] = declarations(
    'inline fun <reified A : Enum<A>, reified R : Enum<R>> signalMod(\n    fallback: Pair<A, R>\n): Mod = create(fallback)',
  )
  assert.equal(symbol.name, 'signalMod')
  assert.match(symbol.signature, /fallback: Pair<A, R>/)
})

test('enum values survive semicolons inside comments, strings and entry bodies', () => {
  const [flag] = declarations(`enum class Flag(val bit: Int, val label: String) {
    Clear(1, ";"),
    /** Permission at the remembered speed; keep independent restrictions. */
    ApproachPassable(128, "pass") { fun local() { println(1); println(2) } };
    fun member(): Int = bit
  }`)
  assert.match(flag.signature, /ApproachPassable\(128/)
  assert(!flag.signature.includes('fun member'))
  assert(!flag.signature.includes('fun local'))
  assert(!flag.signature.includes('println'))
  const permission = declarations(
    `enum class Flag { /** Permission; retained. */ Pass(128) }`,
  ).find((s) => s.kind === 'enum-entry')
  assert.equal(permission.name, 'Pass')
  assert.equal(permission.documentation, 'Permission; retained.')
})

test('annotations preserve complete multiline signatures and do not steal previous KDoc', () => {
  const symbols = declarations(`class API {
    /** Only the first method. */
    @Synchronized fun first(train: Long, speed: Double,
      enabled: Boolean = false): String = privateHelper(train)
    @Synchronized fun second(): Int = privateCode
  }`)
  assert.match(symbols[1].signature, /^fun first\(train: Long, speed: Double,/)
  assert.match(symbols[1].signature, /enabled: Boolean = false\): String$/)
  assert.equal(symbols[1].documentation, 'Only the first method.')
  assert.equal(symbols[2].documentation, '')
  assert(!JSON.stringify(symbols).includes('privateHelper'))
})

test('getters, initializers and superclass construction do not expose implementation', () => {
  const symbols =
    declarations(`class Error(val status: Int, reason: String): IllegalStateException(format(reason)) {
    val available: Boolean get() = hiddenFlags and 1025 != 0
    val name: String = readPrivateCatalogue()
  }
class Log(private val maximumBytes: Long = 2097152)
typealias PublicError = Error`)
  assert.equal(
    symbols[0].signature,
    'class Error(val status: Int, reason: String): IllegalStateException',
  )
  assert.equal(symbols.find((s) => s.name === 'available').signature, 'val available: Boolean')
  assert.equal(symbols.find((s) => s.name === 'name').signature, 'val name: String')
  assert.equal(
    symbols.find((s) => s.name === 'Log').signature,
    'class Log(maximumBytes: Long = 2097152)',
  )
  assert(!symbols.some((s) => s.name === 'maximumBytes'))
  assert.equal(symbols.at(-1).signature, 'typealias PublicError = Error')
  assert(!JSON.stringify(symbols).includes('hiddenFlags'))
  assert(!JSON.stringify(symbols).includes('readPrivateCatalogue'))
})

test('an unreviewed inferred public type stops synchronization instead of leaking its body', () => {
  assert.throws(() => declarations('val ratio = 1 / 2.0'), /inferred type requires review/)
  assert.throws(
    () => declarations('fun unknown() = nativeDecoder()'),
    /inferred type requires review/,
  )
  assert.equal(declarations('val enabled = false')[0].signature, 'val enabled: Boolean = false')
})

test('internal constructors hide transport parameters but preserve public properties', () => {
  const symbols = declarations(`class Context @PublishedApi internal constructor(
    val world: String, override val generation: Long,
    private val native: (Int, List<Pair<Long, Int>>) -> Int,
) {
  fun close() {}
}`)
  assert.equal(symbols[0].signature, 'class Context')
  assert.deepEqual(
    symbols.slice(1).map((s) => s.name),
    ['world', 'generation', 'close'],
  )
  assert(symbols.slice(1).every((s) => s.owner === 'Context'))
  assert(!JSON.stringify(symbols).includes('private val native'))
})

test('a same-named property cannot change a block-bodied function return type', () => {
  const symbols = declarations(`class SignalModelBuilder {
    var observeApproach = base.observeApproach
    fun observeApproach(blocks: Int) { observeApproach = true }
    fun observeApproach(blocks: Int, enabled: Boolean): Boolean { return enabled }
  }`)
  assert.equal(symbols[1].signature, 'var observeApproach: Boolean')
  assert.equal(symbols[2].signature, 'fun observeApproach(blocks: Int): Unit')
  assert.equal(symbols[3].signature, 'fun observeApproach(blocks: Int, enabled: Boolean): Boolean')
})

test('snapshot covers the two SDK surfaces without native internals', async () => {
  const snapshot = JSON.parse(
    await readFile(new URL('../app/content/generated/api.json', import.meta.url), 'utf8'),
  )
  assert(snapshot.files.length >= 12)
  assert(snapshot.files.every((f) => f.symbols.length && f.sha256.length === 64))
  const names = snapshot.files.flatMap((f) => f.symbols.map((s) => s.name))
  assert.match(
    snapshot.files.flatMap((f) => f.symbols).find((s) => s.name === 'DrivingFlag').signature,
    /ApproachPassable\(128\)/,
  )
  for (const required of [
    'signalMod',
    'Indication',
    'NimbyClient',
    'readTrain',
    'SimulationClock',
    'TrackMetric',
    'AutomaticDriving',
    'ConstructionResult',
    'ModControlSession',
    'TrainQuery',
    'TrainVehicle',
    'VehicleModel',
    'ToolOperationException',
    'ToolTopology',
  ])
    assert(names.includes(required), required)
  for (const hidden of [
    'CompiledSignal',
    'LibraryLease',
    'Libraries',
    'ConstructionCodec',
    'buildSignalMod',
  ])
    assert(!names.includes(hidden), hidden)
  const signatureText = snapshot.files.flatMap((f) => f.symbols.map((s) => s.signature)).join('\n')
  for (const hidden of [
    'nativeCall',
    'catalogue.lines',
    'servicesById',
    'and 1025',
    'buildSignalMod(',
    'base.title',
  ])
    assert(!signatureText.includes(hidden), hidden)
  assert.equal(snapshot.files.filter((f) => f.file === 'TrainTypes.kt').length, 2)
  for (const file of snapshot.files.filter((f) => f.file === 'TrainTypes.kt')) {
    const fields = file.symbols.filter((s) => s.owner === 'TrainQuery').map((s) => s.name)
    assert.deepEqual(fields, [
      'includeService',
      'includeLocations',
      'includeCharacteristics',
      'includeTimetables',
      'includeTags',
      'includePassengers',
      'includeLines',
      'includeComposition',
    ])
    assert(!file.symbols.some((s) => s.name === 'flags'))
  }
})
