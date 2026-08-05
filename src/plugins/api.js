import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { useAuthStore } from '@/stores/auth.js';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const isMobile = Capacitor.getPlatform() !== 'web';

let accessToken = null;
let refreshToken = null;
let refreshPromise = null;

// Sur mobile, le firewall JWT est stateless : rien n'est restauré automatiquement
// entre deux lancements de l'app, il faut recharger les tokens persistés au boot.
export async function loadTokens() {
  if (!isMobile) {
    return;
  }
  accessToken = await SecureStorage.getItem(ACCESS_TOKEN_KEY);
  refreshToken = await SecureStorage.getItem(REFRESH_TOKEN_KEY);
}

// Les deux jetons sont écrits séparément : si le backend n'en renvoie qu'un (le
// refresh_token est absent du corps quand l'option cookie du bundle est activée),
// SecureStorage lèverait une erreur sur une valeur nulle et ferait échouer le login.
export async function setTokens(newAccessToken, newRefreshToken) {
  accessToken = newAccessToken ?? accessToken;
  refreshToken = newRefreshToken ?? refreshToken;
  if (!isMobile) {
    return;
  }
  if (newAccessToken) {
    await SecureStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
  }
  if (newRefreshToken) {
    await SecureStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
  }
}

export async function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (!isMobile) {
    return;
  }
  await SecureStorage.removeItem(ACCESS_TOKEN_KEY);
  await SecureStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getRefreshToken() {
  return refreshToken;
}

// Routes d'authentification : un 401 y est attendu (mauvais identifiants) et ne doit
// jamais déclencher de rafraîchissement, sinon un login raté rejoue les mauvais
// identifiants et laisse les jetons de la session précédente en place.
const AUTH_PATHS = ['login', 'token/refresh'];

function isAuthRequest(url) {
  return AUTH_PATHS.includes((url ?? '').replace(/^\/+/, ''));
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
    'X-Platform': isMobile ? 'mobile' : 'web',
  },
  withCredentials: true,
});

// Le firewall mobile (JWT) est stateless : sans ce header, chaque appel après
// le login part sans authentification et revient en 401 (cf. security.yaml).
api.interceptors.request.use((config) => {
  if (isMobile && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Appel direct via axios (pas `api`) pour ne pas repasser par ces mêmes intercepteurs.
async function performRefresh() {
  const response = await axios.post(
    `${import.meta.env.VITE_API_URL}/api/token/refresh`,
    { refresh_token: refreshToken },
    { headers: { 'Content-Type': 'application/json', 'X-Platform': 'mobile' } },
  );
  await setTokens(response.data.token, response.data.refresh_token);
  return response.data.token;
}

// Mutualise les 401 concurrents : un seul appel /token/refresh même si plusieurs
// requêtes échouent en même temps, les autres attendent la même promesse.
function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// Détecte l'expiration de session en cours d'utilisation. Sans cet intercepteur,
// un 401 renvoyé après coup (cookie expiré, déconnexion serveur) n'était vu par
// personne : AuthLayout ne revérifie l'auth qu'une fois au montage, donc l'app
// restait affichée dans un état incohérent jusqu'au prochain rechargement complet.
// On ne redirige que si le store pensait l'utilisateur connecté, pour ne pas
// interférer avec les 401 attendus (mauvais mot de passe sur /login, /me anonyme).
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      if (isMobile && refreshToken && !originalRequest?._retry && !isAuthRequest(originalRequest?.url)) {
        originalRequest._retry = true;
        try {
          await refreshAccessToken();
          return api(originalRequest);
        } catch {
          await clearTokens();
        }
      }

      const authStore = useAuthStore();
      if (authStore.user) {
        // reset() efface le stockage sécurisé : on l'attend avant de recharger, sinon
        // le rechargement peut interrompre l'écriture et les jetons survivent.
        await authStore.reset();
        // Même cible que LogoutView : un reload complet sur '/' laisse AuthLayout
        // renvoyer proprement vers l'écran de connexion une fois l'auth re-vérifiée.
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  },
);

export default api;
