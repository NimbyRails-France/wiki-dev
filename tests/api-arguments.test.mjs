import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { loadContent } from '../scripts/content-loader.mjs'

const { callableShape } = loadContent('app/content/api-callable-shape.ts')
const { reviewedCallableContracts } = loadContent('app/content/api-arguments.ts')
const snapshot = JSON.parse(
  await readFile(new URL('../app/content/generated/api.json', import.meta.url), 'utf8'),
)
const symbols = snapshot.files.flatMap((file) => file.symbols)

test('public function and constructor arguments have complete reviewed bilingual coverage', () => {
  const expected = symbols
    .filter((symbol) => callableShape(symbol))
    .map((symbol) => symbol.id)
    .sort()
  assert.deepEqual(Object.keys(reviewedCallableContracts).sort(), expected)
  for (const symbol of symbols) {
    const shape = callableShape(symbol)
    if (!shape) continue
    const contract = reviewedCallableContracts[symbol.id]
    assert.deepEqual(
      Object.keys(contract.arguments).sort(),
      Array.from(shape.parameters, (parameter) => parameter.name).sort(),
      symbol.id,
    )
    assert.equal(typeof shape.returnType, 'string', symbol.id)
    assert(shape.returnType.length > 0, symbol.id)
    for (const description of [...Object.values(contract.arguments), contract.result]) {
      assert.equal(description.length, 2, symbol.id)
      for (const language of description) {
        assert.equal(typeof language, 'string', symbol.id)
        assert(language.trim().length > 0, symbol.id)
        assert.doesNotMatch(language, /\b(?:TODO|FIXME|undefined)\b/, symbol.id)
      }
    }
  }
})

test('nested generics, callback signatures, commas and equals in defaults stay intact', () => {
  const parsed = callableShape({
    kind: 'fun',
    name: 'example',
    signature:
      'fun example(values: Map<String, List<Pair<Int, String>>>, block: ToolContext.(List<Pair<String, Int>>) -> Unit, text: String = "a,b=c", vararg others: Pair<String, Any>): List<String>?',
  })
  assert.deepEqual(
    Array.from(parsed.parameters, (parameter) => parameter.name),
    ['values', 'block', 'text', 'others'],
  )
  assert.equal(parsed.parameters[0].type, 'Map<String, List<Pair<Int, String>>>')
  assert.equal(parsed.parameters[1].type, 'ToolContext.(List<Pair<String, Int>>) -> Unit')
  assert.equal(parsed.parameters[2].defaultValue, '"a,b=c"')
  assert.equal(parsed.parameters[3].vararg, true)
  assert.equal(parsed.returnType, 'List<String>?')
  assert.equal(
    callableShape({ kind: 'class', name: 'Choice', signature: 'enum class Choice(val code: Int)' }),
    null,
  )
  assert.throws(
    () =>
      callableShape({ kind: 'fun', name: 'broken', signature: 'fun broken(value: List<String>' }),
    /Unclosed public signature/,
  )
})

test('critical units and distinct operation meanings are retained', () => {
  const native = 'native:nimby:fun:'
  const jvm = 'jvm:fr.nimby.sdk:fun:'
  for (const value of reviewedCallableContracts[native + 'SignalModelBuilder.observeApproach(Int)']
    .arguments.blocks)
    assert.match(value, /16/)
  for (const value of reviewedCallableContracts[native + 'blink(String,String,Long)'].arguments
    .everyMs)
    assert.match(value, /10000/)
  for (const value of reviewedCallableContracts[
    native + 'TrainEditorBuilder.maximumLength(IntegerOption,String,String,String)'
  ].arguments.meters) {
    assert.match(value, /options/)
    assert.match(value, /10000/)
    assert.doesNotMatch(value, /850/)
  }
  for (const value of reviewedCallableContracts[
    jvm + 'ModControlSession.constrainTrain(Long,Double,TrainControlMode,Long,Boolean)'
  ].arguments.speedMps)
    assert.match(value, /Stop/)
  for (const value of reviewedCallableContracts[jvm + 'Nimby.connect(Path,Int?)'].arguments.sdk)
    assert.match(value, /bin\/NimbyRailsFranceSDK\.dll/)
  for (const value of reviewedCallableContracts[
    native + 'SignalModelBuilder.rules(SignalRuleContext.()->Indication<A,R>?)'
  ].arguments.block)
    assert.match(value, /invalidNetwork/)
})

test('rendered reference shows every argument, default and result without losing its public anchor', () => {
  const { referenceArticles, referenceEnglish } = loadContent('app/content/reference.ts')
  for (const file of snapshot.files) {
    const article = referenceArticles.find((entry) => entry.slug === file.slug)
    for (const symbol of file.symbols) {
      const contract = reviewedCallableContracts[symbol.id]
      if (!contract) continue
      const section = article.sections.find((entry) => entry.id === symbol.anchor)
      assert(section, symbol.id)
      const tables = section.blocks.filter((block) => block.kind === 'table')
      const argumentsTable = tables.find((block) => block.columns[0] === 'Argument')
      if (contract.shape.parameters.length) {
        assert(argumentsTable, symbol.id)
        assert.equal(argumentsTable.rows.length, contract.shape.parameters.length, symbol.id)
        contract.shape.parameters.forEach((parameter, index) => {
          const row = argumentsTable.rows[index]
          assert.equal(row[1], parameter.type, symbol.id)
          assert.equal(row[3], contract.arguments[parameter.name][0], symbol.id)
          assert.equal(referenceEnglish[row[3]], contract.arguments[parameter.name][1], symbol.id)
          assert.equal(
            row[2],
            parameter.vararg
              ? 'Aucun élément'
              : parameter.defaultValue === undefined
                ? 'Obligatoire'
                : parameter.defaultValue === '…'
                  ? 'Titre du modèle'
                  : parameter.defaultValue,
            symbol.id,
          )
        })
      }
      const result = tables.find(
        (block) => block.columns[0] === (contract.shape.constructor ? 'Objet créé' : 'Retour'),
      )
      assert(result, symbol.id)
      assert.equal(result.rows[0][0], contract.shape.returnType, symbol.id)
      if (contract.failures) {
        const failure = section.blocks.find(
          (block) => block.kind === 'note' && block.title === 'Refus et erreurs',
        )
        assert(failure, symbol.id)
        assert.equal(failure.text, contract.failures[0], symbol.id)
        assert.equal(referenceEnglish[failure.text], contract.failures[1], symbol.id)
      }
    }
  }
})
