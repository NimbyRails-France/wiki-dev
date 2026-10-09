plugins {
    kotlin("jvm") version "2.2.20"
    application
}
kotlin { jvmToolchain(21) }
dependencies { implementation("fr.nimbyrails:nimby-observation-client:0.9.0-alpha.3") }
application { mainClass = "wiki.firstapplication.TrainDashboardKt" }
