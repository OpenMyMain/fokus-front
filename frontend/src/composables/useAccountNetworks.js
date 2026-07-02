import { ref } from 'vue';
import api from '@/plugins/api.js';
import { useAuthStore } from '@/stores/auth.js';

export function useAccountNetworks() {
  const accountNetworks = ref([]);
  const loading = ref(false);

  async function load() {
    const authStore = useAuthStore();
    if (!authStore.user?.id) return;

    loading.value = true;
    try {
      const { data } = await api.get(`/users/${authStore.user.id}/account-networks`);
      accountNetworks.value = data.data;
    } catch {
      accountNetworks.value = [];
    } finally {
      loading.value = false;
    }
  }

  return { accountNetworks, loading, load };
}
