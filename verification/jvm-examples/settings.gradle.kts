pluginManagement { repositories { gradlePluginPortal(); mavenCentral() } }
dependencyResolutionManagement { repositories { mavenCentral() } }
rootProject.name = "wiki-jvm-examples"

// Build the real client as a separate module: examples cannot access its internals.
val sdkRoot = providers.gradleProperty("nrfSdkSources").get()
includeBuild(file("$sdkRoot/kotlin-client")) {
    dependencySubstitution {
        substitute(module("fr.nimbyrails:nimby-observation-client")).using(project(":"))
    }
}
