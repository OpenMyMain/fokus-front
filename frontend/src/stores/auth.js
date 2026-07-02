import {defineStore} from 'pinia';
import {computed, ref} from 'vue';
import api from "@/plugins/api.js";

export const useAuthStore = defineStore('auth', () => {
  const user = ref({
    company_name: 'Acme Studio',
    description: 'Premium creative agency specializing in digital experiences.',
    tags: ['Design', 'Tech', 'B2B'],
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7fX1P98sLBPSP6rdcW63uRO4p0ZNzsPZB-IOzCeWX3NA7OGUjFVqognvk1Dy8UKpyhRea9nLY6Gx4jeX-4IUFi-o79xZK49_JBw8dm-ZBO4I_mZ1KizsPV1vPj6162lz93u8Rv3-KOl64OdUlV5WGuxr6f5gHIYWWMeNawIYm1dokEg0HSmhtw97Wfe1BP2yi7MwpBIXzhyZOwUciocaqTchi9DLvc2OKNlWCRCEUBx8Sb-udM2pS'
  });

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
      user.value = response.data.data ?? null;
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
