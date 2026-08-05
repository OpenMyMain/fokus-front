/**
 * Fournisseurs de connexion tierce (Google, Facebook…) activés par `VITE_APP_TIERCE`.
 *
 * Le backend n'expose **aucune** route OAuth aujourd'hui : `/auth/google` n'existe pas
 * (voir back/CLAUDE.md → Authentication). Le flag reste donc vide par défaut, ce qui
 * masque les boutons plutôt que d'offrir un clic qui finit en erreur.
 * Pour les réactiver le jour où la route existera :
 *   VITE_APP_TIERCE=[{"app":"google"},{"app":"facebook"}]
 *
 * Le parsing est tolérant : une variable absente ou mal formée désactive la
 * fonctionnalité au lieu de faire planter l'écran de connexion sur un JSON.parse.
 *
 * @returns {Array<{app: string}>}
 */
function parseProviders() {
  const raw = import.meta.env.VITE_APP_TIERCE

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(provider => provider?.app) : []
  } catch {
    console.warn('VITE_APP_TIERCE is not valid JSON — third-party login buttons are hidden.')
    return []
  }
}

export const oauthProviders = parseProviders()
