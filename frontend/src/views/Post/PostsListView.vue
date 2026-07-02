<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h1 class="mb-1">Mes posts</h1>
        <p class="text-sm text-gray-500">Historique des posts créés sur Magnum.</p>
      </div>
      <router-link
        :to="{ name: 'create_post' }"
        class="shrink-0 bg-primary text-white text-sm rounded-lg px-4 py-2 whitespace-nowrap"
      >
        + Nouveau
      </router-link>
    </div>

    <p v-if="loading && !posts.length" class="text-sm text-gray-500">Chargement...</p>
    <p v-if="error" class="error-msg-box text-sm">{{ error }}</p>

    <p v-if="!loading && !posts.length && !error" class="text-sm text-gray-500">
      Aucun post pour le moment.
      <router-link :to="{ name: 'create_post' }" class="text-primary underline">Créer le premier</router-link>
    </p>

    <div
      v-for="post in posts"
      :key="post.id"
      class="p-4 bg-white rounded-xl shadow flex gap-3"
    >
      <img
        v-if="isImage(post)"
        :src="attachmentUrl(post)"
        crossorigin="use-credentials"
        alt=""
        class="w-16 h-16 rounded-lg object-cover shrink-0"
      />
      <div v-else-if="post.attachmentOriginalName" class="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 text-center p-1 shrink-0">
        {{ post.attachmentOriginalName }}
      </div>

      <div class="min-w-0 flex-1">
        <p class="text-sm text-gray-800 line-clamp-3">{{ post.text }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ formatDate(post.created_at) }}</p>

        <div v-if="post.publications" class="flex flex-wrap gap-1 mt-2">
          <span
            v-if="statusCounts(post).toPublish"
            class="text-xs px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700"
          >
            {{ statusCounts(post).toPublish }} à publier
          </span>
          <span
            v-if="statusCounts(post).published"
            class="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700"
          >
            {{ statusCounts(post).published }} publiée{{ statusCounts(post).published > 1 ? 's' : '' }}
          </span>
          <span
            v-if="statusCounts(post).error"
            class="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700"
          >
            {{ statusCounts(post).error }} erreur{{ statusCounts(post).error > 1 ? 's' : '' }}
          </span>
        </div>

        <div class="flex gap-2 mt-2">
          <router-link
            v-if="hasPostPermission(post, 'POST_SHOW')"
            :to="{ name: 'post_show', params: { id: post.id } }"
            class="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Voir
          </router-link>
          <router-link
            v-if="hasPostPermission(post, 'POST_EDIT')"
            :to="{ name: 'post_edit', params: { id: post.id } }"
            class="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Modifier
          </router-link>
          <button
            v-if="hasPostPermission(post, 'POST_CREATE_PUBLICATION')"
            type="button"
            class="text-xs px-3 py-1.5 rounded-lg bg-primary text-white hover:opacity-90"
            @click="openDiffuseModal(post)"
          >
            Diffuser
          </button>
          <button
            v-if="hasPostPermission(post, 'POST_DELETE')"
            type="button"
            :disabled="deleting"
            @click="onDelete(post)"
            class="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <p v-if="deleteError" class="error-msg-box text-sm">{{ deleteError }}</p>

    <button
      v-if="nextOffset !== null"
      type="button"
      class="secondary-btn"
      :disabled="loading"
      @click="loadPosts(nextOffset)"
    >
      {{ loading ? 'Chargement...' : 'Charger plus' }}
    </button>

    <app-modal ref="diffuseModalRef" @reset="diffuseError = ''">
      <template #header>
        <h2>Diffuser vers une nouvelle plateforme</h2>
      </template>
      <template #body>
        <div class="flex flex-col gap-3">
          <div class="flex gap-4 text-sm">
            <label class="flex items-center gap-2">
              <input type="radio" value="now" v-model="diffuseScheduleMode"/>
              Publier maintenant
            </label>
            <label class="flex items-center gap-2">
              <input type="radio" value="later" v-model="diffuseScheduleMode"/>
              Planifier
            </label>
          </div>
          <app-input
            v-if="diffuseScheduleMode === 'later'"
            v-model="diffuseScheduledAt"
            type="text"
            label=""
            placeholder="AAAA-MM-JJTHH:mm"
          />

          <account-network-picker
            v-model="diffuseSelectedIds"
            :account-networks="accountNetworks"
            :exclude-account-ids="diffusingPostTargetedIds"
          />

          <p v-if="diffuseError" class="error-msg-box text-sm">{{ diffuseError }}</p>
        </div>
      </template>
      <template #footer>
        <button type="button" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm" @click="closeDiffuseModal">
          Annuler
        </button>
        <button
          type="button"
          class="px-4 py-2 rounded-lg bg-primary text-white text-sm disabled:opacity-50"
          :disabled="!diffuseSelectedIds.length || diffusing"
          @click="submitDiffuse"
        >
          {{ diffusing ? 'Envoi...' : 'Diffuser' }}
        </button>
      </template>
    </app-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/plugins/api.js';
import { hasPostPermission } from '@/composables/usePostPermissions.js';
import { useDeletePost } from '@/composables/useDeletePost.js';
import { useAccountNetworks } from '@/composables/useAccountNetworks.js';
import AccountNetworkPicker from '@/components/Post/AccountNetworkPicker.vue';
import AppModal from '@/components/Common/AppModal.vue';
import AppInput from '@/components/Common/Form/AppInput.vue';

const posts = ref([]);
const loading = ref(false);
const error = ref('');
const nextOffset = ref(null);

const { deleting, error: deleteError, deletePost } = useDeletePost();
const { accountNetworks, load: loadAccountNetworks } = useAccountNetworks();

async function onDelete(post) {
  const deleted = await deletePost(post);
  if (deleted) {
    posts.value = posts.value.filter((p) => p.id !== post.id);
  }
}

async function loadPosts(offset = 0) {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await api.get('/posts', { params: { offset, size: 20 } });
    posts.value = offset === 0 ? data.data : [...posts.value, ...data.data];
    nextOffset.value = data._pagination?.nextOffset ?? null;

    const newlyLoadedPosts = posts.value.slice(posts.value.length - data.data.length);
    newlyLoadedPosts.forEach(loadPublicationsForPost);
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Impossible de charger les posts.';
  } finally {
    loading.value = false;
  }
}

async function loadPublicationsForPost(post) {
  if (!hasPostPermission(post, 'POST_LIST_PUBLICATIONS')) return;
  try {
    const { data } = await api.get(`/posts/${post.id}/publications`, { params: { size: 100 } });
    post.publications = data.data;
  } catch {
    post.publications = [];
  }
}

function statusCounts(post) {
  const counts = { toPublish: 0, published: 0, error: 0 };
  for (const pub of post.publications ?? []) {
    if (pub.status === 'published') counts.published++;
    else if (pub.status === 'error') counts.error++;
    else counts.toPublish++;
  }
  return counts;
}

function isImage(post) {
  return post.attachmentMimeType?.startsWith('image/');
}

function attachmentUrl(post) {
  return `${import.meta.env.VITE_API_URL}/api/posts/${post.id}/attachment`;
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

const diffuseModalRef = ref(null);
const diffusingPost = ref(null);
const diffuseSelectedIds = ref([]);
const diffuseScheduleMode = ref('now');
const diffuseScheduledAt = ref('');
const diffusing = ref(false);
const diffuseError = ref('');

const diffusingPostTargetedIds = computed(() =>
  (diffusingPost.value?.publications ?? []).map((pub) => pub.accountNetwork.id)
);

function openDiffuseModal(post) {
  diffusingPost.value = post;
  diffuseSelectedIds.value = [];
  diffuseScheduleMode.value = 'now';
  diffuseScheduledAt.value = '';
  diffuseError.value = '';
  diffuseModalRef.value?.open();
}

function closeDiffuseModal() {
  diffuseModalRef.value?.close();
}

async function submitDiffuse() {
  diffusing.value = true;
  diffuseError.value = '';

  const scheduledAt = diffuseScheduleMode.value === 'later' && diffuseScheduledAt.value
    ? new Date(diffuseScheduledAt.value).toISOString()
    : null;

  try {
    const { data } = await api.post(`/posts/${diffusingPost.value.id}/publications`, {
      accountNetworkIds: diffuseSelectedIds.value,
      scheduledAt,
    });
    diffusingPost.value.publications = [...(diffusingPost.value.publications ?? []), ...data.data];
    closeDiffuseModal();
  } catch (e) {
    diffuseError.value = e.response?.data?.message ?? 'La diffusion a échoué.';
  } finally {
    diffusing.value = false;
  }
}

onMounted(() => {
  loadPosts();
  loadAccountNetworks();
});
</script>
