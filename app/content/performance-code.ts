// Translate prose and labels only; public API names and stable IDs stay unchanged.
export const performanceCodeEnglish: Record<string, string> = {
  '// Marqueurs graphiques seulement : ni planificateur de route, ni commande de pose.':
    '// Graphical markers only, not a route planner or a construction command.',
  '"Source ou voie indisponible."': '"Source or track unavailable."',
  '// Interface de test autour des appels publics ; recréée à chaque callback, jamais conservée.':
    '// Test seam around public SDK calls, recreated for each callback, never retained.',
  '"Choisissez le nombre de marqueurs."': '"Choose the number of markers."',
  '// Révoquer localement AVANT les appels qui peuvent être refusés.':
    '// Revoke locally BEFORE calls that may be refused.',
  '"Aperçu masqué."': '"Preview hidden."',
  '// Renouveler les positions copiées, sans nouvelle capture.':
    '// Renew using copied positions, no new capture.',
  '"Affichage de ${it.size} marqueurs temporaires."': '"Showing ${it.size} temporary markers."',
  '"Service occupé ; affichage de l’aperçu en attente."':
    '"Temporarily busy; waiting to display the preview."',
  '"Aperçu indisponible ; demandez un nouvel aperçu."':
    '"Preview unavailable; request a new preview."',
  '"Ouvrir l’outil d’aperçu"': '"Open preview tool"',
  '"Afficher l’aperçu"': '"Show preview"',
  '"Masquer"': '"Hide"',
  '"Fermer"': '"Close"',
  '"Nombre de marqueurs"': '"Number of markers"',
  '"Outil d’aperçu"': '"Preview tool"',
  '// Suivre une chaîne sans ambiguïté. Arrêt aux aiguilles, liens inconnus et cycles.':
    '// Follow one unambiguous chain. Stop at junctions, unknown links or cycles.',
  '// Cette règle ne choisit ni ne réserve un itinéraire et ne prouve pas sa liberté.':
    '// This policy does not select a route, reserve it or prove it is unoccupied.',
  '// Aucune pose exactement à une extrémité.': '// No placement exactly at an endpoint.',
  '"Zone de travaux"': '"Work zone"',
  '"Appliquer la règle de travaux de ce modèle."': '"Apply this model\'s work-zone rule."',
  '"Cantons suivants"': '"Following blocks"',
  '"Signal de travaux"': '"Work signal"',
  '// Règle d’exemple : propagation par nextSignal, pas par distance physique.':
    '// Example policy: propagate along nextSignal, not physical distance.',
  '// Zéro signifie la source seule. Aucun réglage dérivé n’est enregistré.':
    '// Zero means source only. No derived setting is written to persistent storage.',
  '"Réglages préparés"': '"Prepared settings"',
  '// Suit une opération ; ce n’est ni un planificateur ni un bouton Appliquer. Avant confirmCreate,':
    '// Follows one operation; not a planner or an Apply button. Before confirmCreate,',
  '// l’appelant prépare, relit et compare le plan explicitement approuvé.':
    '// the caller must prepare, recapture and compare its explicitly approved plan.',
  '"Ce ticket a déjà été envoyé."': '"This ticket has already been submitted."',
  '// AVANT l’appel : une exception peut laisser le résultat inconnu.':
    '// BEFORE calling: exceptions can leave the outcome unknown.',
  '"Un résultat d’un autre ticket est refusé."': '"A result from another ticket is not accepted."',
  '// Fermer n’est pas annuler ; continuer le suivi.':
    '// Closing is not cancellation; keep polling.',
  '// Créer pour le callback courant seulement ; ne jamais conserver cet adaptateur/contexte.':
    '// Create for the current callback only; never retain this adapter/context.',
}
