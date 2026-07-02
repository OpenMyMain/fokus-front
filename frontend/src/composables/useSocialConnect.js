import { ref } from 'vue';
import api from '@/plugins/api.js';

export function useSocialConnect() {
  const loadingSlug = ref(null);
  const error = ref(null);

  async function connect(slug) {
    loadingSlug.value = slug;
    error.value = null;
    try {
      const { data } = await api.get(`/${slug}/connect`, {
        headers: { Accept: 'application/json' },
      });
      window.location.href = data.url;
    } catch (e) {
      error.value = e.response?.data?.message ?? 'Une erreur est survenue.';
      loadingSlug.value = null;
    }
  }

  return { loadingSlug, error, connect };
}
