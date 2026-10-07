plugins {
    kotlin("jvm") version "2.2.20"
    application
}
kotlin { jvmToolchain(21) }
val wikiRoot = projectDir.resolve("../..").canonicalFile
val locale = providers.gradleProperty("wikiLocale").orElse("fr").get()
require(locale == "fr" || locale == "en")
layout.buildDirectory = wikiRoot.resolve(".validation/example-check/jvm-$locale")
val frenchSnippets = wikiRoot.resolve("app/content/snippets/jvm")
val snippetDirectory = if (locale == "fr") frenchSnippets else wikiRoot.resolve(".validation/example-check/en/jvm")
val currentSnippets = fileTree(frenchSnippets) { include("**/*.kt") }.files
    .map { it.relativeTo(frenchSnippets).invariantSeparatorsPath }.toSet()
kotlin.sourceSets.main {
    kotlin.srcDir(snippetDirectory)
    kotlin.srcDir(wikiRoot.resolve("tests/jvm"))
    // A removed/renamed French example must never survive as an English source.
    kotlin.exclude { entry ->
        !entry.isDirectory && entry.file.toPath().startsWith(snippetDirectory.toPath()) &&
            entry.relativePath.pathString !in currentSnippets
    }
}
dependencies { implementation("fr.nimbyrails:nimby-observation-client:0.9.0-alpha.1") }
application { mainClass = "wiki.jvmtests.Train_examplesKt" }
