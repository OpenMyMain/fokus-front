import { ref } from 'vue';
import api from '@/plugins/api.js';

export function useDeletePost() {
  const deleting = ref(false);
  const error = ref('');

  async function deletePost(post) {
    if (!window.confirm('Supprimer définitivement ce post ?')) return false;

    deleting.value = true;
    error.value = '';
    try {
      await api.delete(`/posts/${post.id}`);
      return true;
    } catch (e) {
      error.value = e.response?.data?.message ?? 'Impossible de supprimer ce post.';
      return false;
    } finally {
      deleting.value = false;
    }
  }

  return { deleting, error, deletePost };
}
