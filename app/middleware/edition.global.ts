import { resolveWikiRoute } from '~/content/editions'

export default defineNuxtRouteMiddleware((to) => {
  const location = resolveWikiRoute(to.fullPath)
  // Legacy HTML remains readable without JavaScript. Client navigation moves
  // to its canonical edition and preserves the query and browser-only hash.
  if (import.meta.client && location.exists && !location.versioned) {
    const nuxtApp = useNuxtApp()
    if (nuxtApp.isHydrating) {
      const router = useRouter()
      const initialPath = to.fullPath
      // Hydrate the page that produced the HTML before switching routes. In
      // particular, / and /en use index pages while edition homes use the
      // catch-all page; redirecting before hydration leaves a second shell.
      onNuxtReady(() => {
        if (router.currentRoute.value.fullPath === initialPath) {
          return router.replace(location.canonical)
        }
      })
      return
    }
    return navigateTo(location.canonical, { replace: true })
  }
})
