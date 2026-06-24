import {defineStore} from 'pinia';
import {computed, ref} from 'vue';
import api from "@/plugins/api.js";

export const useAuthStore = defineStore('auth', () => {
  const user = ref(undefined);

  const isFetched = computed(() => user.value !== undefined);

  const isAuth = computed(() => !!user.value);

  function reset() {
    user.value = undefined;
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
    } catch (error) {
      user.value = null;
      throw error.response.data.error ?? 'Une erreur est survenue lors de la connexion.';
    }
  }

  async function refresh() {
    try {
      const response = await api.get('me');
      user.value = response.data ?? null;
    } catch {
      user.value = null;
    }
  }

  return {
    user,
    isFetched,
    isAuth,
    login,
    reset,
    refresh,
  };
});
