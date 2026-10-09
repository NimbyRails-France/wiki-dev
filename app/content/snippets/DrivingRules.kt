package wiki.driving

import nimby.*

enum class Aspect { Closed, Warning, Restricted, Open }

// 1. Vitesses choisies par ce mod fictif, en km/h ; ce ne sont pas des défauts du SDK.
data class Speeds(val passageKmh: Double, val restrictedKmh: Double) {
    init {
        require(passageKmh.isFinite() && passageKmh > 0)
        require(restrictedKmh.isFinite() && restrictedKmh > 0)
    }
}

// 2. Entrées : aspect du modèle et vitesses validées. Sortie : une consigne, sans lire le jeu.
fun instruction(aspect: Aspect, speeds: Speeds): DrivingRule = when (aspect) {
    Aspect.Closed -> AutomaticDriving.stop()
    Aspect.Warning -> AutomaticDriving.announceStop(
        // Cible : le prochain signal en AVAL, et non le canton d'approche en amont.
        signalsAhead = 1,
        // Conversion km/h vers m/s ; cette vitesse sert si la cible permet le passage.
        passageSpeedMps = speeds.passageKmh / 3.6,
        // Permission du signal d'annonce courant ; elle ne rend pas la cible franchissable.
        passableHere = true,
        // Accepter aussi une vitesse numérique visible de la cible.
        followTargetSpeed = true
    )
    Aspect.Restricted -> AutomaticDriving.restrictedUntilNextSignal(
        // Vitesse d'entrée et plafond après entrée, tous deux en m/s.
        entrySpeedMps = speeds.restrictedKmh / 3.6,
        maximumSpeedMps = speeds.restrictedKmh / 3.6,
        // false n'impose pas un arrêt préalable ; true exigerait entrySpeedMps = 0.0.
        stopFirst = false
    )
    Aspect.Open -> AutomaticDriving.clear()
}

// 3. Dans votre signalModel : retourner la consigne depuis driving pour qu'elle soit utilisée.
// driving { indication -> instruction(indication.aspect, Speeds(25.0, 12.0)) }
// Le modèle doit utiliser cet enum Aspect ; son enum Reason lui reste propre.
