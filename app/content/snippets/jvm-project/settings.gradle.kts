pluginManagement { repositories { gradlePluginPortal(); mavenCentral() } }
dependencyResolutionManagement { repositories { mavenCentral() } }
rootProject.name = "train-dashboard"

// nrfSdk est le dossier extrait du SDK complet, pas le kit Kotlin/Native des mods.
val sdkRoot = file(providers.gradleProperty("nrfSdk").get())
val client = sdkRoot.resolve("share/NimbyRailsFranceSDK/kotlin-client")
require(client.resolve("build.gradle.kts").isFile) { "Client Kotlin/JVM absent du SDK : $client" }
// Gradle compile le client fourni ; aucune publication Maven externe du SDK n'est supposée.
includeBuild(client)
