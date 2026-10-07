import { resolveWikiRoute } from '~/content/editions'

export default defineNuxtRouteMiddleware((to) => {
  const location = resolveWikiRoute(to.fullPath)
  // Legacy HTML remains readable without JavaScript. Client navigation moves
  // to its canonical edition and preserves the query and browser-only hash.
  if (import.meta.client && location.exists && !location.versioned) {
    return navigateTo(location.canonical, { replace: true })
  }
})
