import {defineStore} from 'pinia';
import {computed, ref} from 'vue';
import api, {setTokens, clearTokens, loadTokens} from '@/plugins/api.js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(undefined);
  const fetched = ref(false);

  const isFetched = computed(() => fetched.value);

  const isAuth = computed(() => !!user.value);

  async function reset() {
    user.value = undefined;
    fetched.value = true; // Marquer comme fetched même si déconnecté
    await clearTokens();
  }

  async function login(email, password) {
    try {
      const response = await api.post(
        'login', {
          email: email,
          password: password
        }
      );
      user.value = response.data.data;
      // Réponse du firewall mobile : elle porte les jetons JWT et non l'utilisateur,
      // qu'on récupère ensuite via /api/me une fois le Bearer en place.
      if (response.data.token) {
        await setTokens(response.data.token, response.data.refresh_token);
        await refresh();

        // Sans ce garde-fou, un /me en échec laisse l'app naviguer vers l'accueil avec un
        // user vide : AuthLayout renvoie alors vers /auth sans qu'aucune erreur ne s'affiche.
        if (!user.value) {
          throw new Error('unauthenticated');
        }
      }
      fetched.value = true;

    } catch (error) {
      user.value = null;
      await clearTokens();
      // Optional chaining : sur une erreur réseau (API injoignable, timeout) il n'y a pas
      // de réponse à lire, et l'accès direct à error.response.data lèverait un TypeError
      // à la place du message affiché à l'utilisateur.
      throw error.response?.data?.error ?? 'Une erreur est survenue lors de la connexion.';
    }
  }

  async function refresh() {
    try {
      await loadTokens();
      const response = await api.get('me');
      user.value = response.data.data ?? null;
    } catch {
      user.value = null;
    } finally {
      fetched.value = true;
    }
  }

  // La garde `beforeEach` du routeur et `App.vue` ont besoin de la même réponse — « y a-t-il
  // une session ? » — au même instant du démarrage. Sans mémoïsation, ils lanceraient deux
  // `/api/me` concurrents, et sur mobile deux `loadTokens()` en parallèle.
  let fetching = null;

  async function ensureFetched() {
    if (fetched.value) {
      return;
    }

    if (!fetching) {
      fetching = refresh().finally(() => {
        fetching = null;
      });
    }

    await fetching;
  }

  return {
    user,
    isFetched,
    isAuth,
    login,
    reset,
    refresh,
    ensureFetched,
  };
});
