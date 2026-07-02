<template>
  <div class="flex flex-col gap-4">
    <router-link :to="{ name: 'post_show', params: { id: route.params.id } }" class="text-sm text-primary underline w-fit">← Retour au post</router-link>

    <h1>Modifier le post</h1>

    <p v-if="loading" class="text-sm text-gray-500">Chargement...</p>
    <p v-if="loadError" class="error-msg-box text-sm">{{ loadError }}</p>

    <div v-if="!loading && !loadError" class="app-form-container bg-white p-4 rounded-xl shadow">
      <app-textarea v-model="text" label="Texte" required/>

      <p v-if="saveError" class="error-msg-box text-sm">{{ saveError }}</p>

      <button type="button" class="primary-btn" :disabled="saving" @click="save">
        {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/plugins/api.js';
import AppTextarea from '@/components/Common/Form/AppTextarea.vue';

const route = useRoute();
const router = useRouter();

const text = ref('');
const loading = ref(false);
const loadError = ref('');
const saving = ref(false);
const saveError = ref('');

async function loadPost() {
  loading.value = true;
  loadError.value = '';
  try {
    const { data } = await api.get(`/posts/${route.params.id}`);
    text.value = data.data.text;
  } catch (e) {
    loadError.value = e.response?.data?.message ?? 'Impossible de charger ce post.';
  } finally {
    loading.value = false;
  }
}

async function save() {
  if (!text.value.trim()) {
    saveError.value = 'Le texte du post est requis.';
    return;
  }

  saving.value = true;
  saveError.value = '';
  try {
    await api.put(`/posts/${route.params.id}`, { text: text.value });
    router.push({ name: 'post_show', params: { id: route.params.id } });
  } catch (e) {
    saveError.value = e.response?.data?.message ?? 'Impossible d\'enregistrer ce post.';
  } finally {
    saving.value = false;
  }
}

onMounted(loadPost);
</script>
