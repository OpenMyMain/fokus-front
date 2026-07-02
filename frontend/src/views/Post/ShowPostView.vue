<template>
  <div class="flex flex-col gap-4">
    <router-link :to="{ name: 'posts_list' }" class="text-sm text-primary underline w-fit">← Retour aux posts</router-link>

    <p v-if="loading" class="text-sm text-gray-500">Chargement...</p>
    <p v-if="error" class="error-msg-box text-sm">{{ error }}</p>

    <div v-if="post" class="bg-white p-4 rounded-xl shadow flex flex-col gap-3">
      <img
        v-if="isImage"
        :src="attachmentUrl"
        crossorigin="use-credentials"
        alt=""
        class="rounded-lg max-h-64 object-cover"
      />
      <div v-else-if="post.attachmentOriginalName" class="text-sm text-gray-500 bg-gray-100 rounded-lg p-3 w-fit">
        {{ post.attachmentOriginalName }}
      </div>

      <p class="text-gray-800 whitespace-pre-line">{{ post.text }}</p>
      <p class="text-xs text-gray-400">Créé le {{ formatDate(post.created_at) }}</p>

      <div class="flex gap-2">
        <router-link
          v-if="hasPostPermission(post, 'POST_EDIT')"
          :to="{ name: 'post_edit', params: { id: post.id } }"
          class="text-sm px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          Modifier
        </router-link>
        <button
          v-if="hasPostPermission(post, 'POST_DELETE')"
          type="button"
          :disabled="deleting"
          @click="onDelete"
          class="text-sm px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
        >
          Supprimer
        </button>
      </div>

      <p v-if="deleteError" class="error-msg-box text-sm">{{ deleteError }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/plugins/api.js';
import { hasPostPermission } from '@/composables/usePostPermissions.js';
import { useDeletePost } from '@/composables/useDeletePost.js';

const route = useRoute();
const router = useRouter();

const post = ref(null);
const loading = ref(false);
const error = ref('');

const { deleting, error: deleteError, deletePost } = useDeletePost();

const isImage = computed(() => post.value?.attachmentMimeType?.startsWith('image/'));
const attachmentUrl = computed(() => `${import.meta.env.VITE_API_URL}/api/posts/${post.value.id}/attachment`);

async function loadPost() {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await api.get(`/posts/${route.params.id}`);
    post.value = data.data;
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Impossible de charger ce post.';
  } finally {
    loading.value = false;
  }
}

async function onDelete() {
  const deleted = await deletePost(post.value);
  if (deleted) {
    router.push({ name: 'posts_list' });
  }
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

onMounted(loadPost);
</script>
