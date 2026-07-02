<template>
  <div class="flex flex-col gap-4">
    <div>
      <h1 class="mb-1">Créer un post</h1>
      <p class="text-sm text-gray-500">Rédigez votre contenu puis choisissez où le diffuser.</p>
    </div>

    <div class="flex items-center gap-2 text-sm">
      <span class="flex items-center justify-center w-6 h-6 rounded-full" :class="step === 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'">1</span>
      <span :class="step === 1 ? 'font-medium text-gray-900' : 'text-gray-400'">Contenu</span>
      <span class="flex-1 h-px bg-gray-200"></span>
      <span class="flex items-center justify-center w-6 h-6 rounded-full" :class="step === 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'">2</span>
      <span :class="step === 2 ? 'font-medium text-gray-900' : 'text-gray-400'">Diffusion</span>
    </div>

    <!-- ETAPE 1 : CONTENU -->
    <div v-if="step === 1" class="app-form-container bg-white p-4 rounded-xl shadow">
      <app-input v-model="post.title" label="Titre" placeholder="Titre interne du post (optionnel)"/>
      <app-textarea v-model="post.caption" label="Texte" required placeholder="Que voulez-vous partager ?"/>

      <div>
        <label class="app-label">Visuel</label>
        <input type="file" accept="image/*" @change="onImageChange" class="app-input"/>
        <img v-if="imagePreview" :src="imagePreview" alt="Aperçu du visuel" class="mt-2 rounded-lg max-h-48 object-cover"/>
      </div>

      <app-input v-model="post.link" label="Lien externe" placeholder="https://..."/>

      <div>
        <label class="app-label">Diffusion</label>
        <div class="flex gap-4 text-sm">
          <label class="flex items-center gap-2">
            <input type="radio" value="now" v-model="post.scheduleMode"/>
            Publier maintenant
          </label>
          <label class="flex items-center gap-2">
            <input type="radio" value="later" v-model="post.scheduleMode"/>
            Planifier
          </label>
        </div>
        <app-input
          v-if="post.scheduleMode === 'later'"
          v-model="post.scheduledAt"
          type="text"
          label=""
          placeholder="AAAA-MM-JJTHH:mm"
          class="mt-2"
        />
      </div>

      <p v-if="step1Error" class="error-msg-box text-sm">{{ step1Error }}</p>

      <button type="button" class="primary-btn" :disabled="submittingPost" @click="goToStep2">
        {{ submittingPost ? 'Création...' : 'Suivant' }}
      </button>
    </div>

    <!-- ETAPE 2 : MULTIDIFFUSION -->
    <div v-else class="flex flex-col gap-4">
      <div class="p-4 bg-white rounded-xl shadow text-sm text-gray-600">
        Diffusion : <span class="font-medium text-gray-900">{{ scheduleSummary }}</span>
      </div>

      <p v-if="loadingAccounts" class="text-sm text-gray-500">Chargement des comptes connectés...</p>

      <account-network-picker v-model="selectedTargets" :account-networks="accountNetworks"/>

      <p v-if="submitted" class="text-sm text-green-600">
        Post envoyé à {{ publishedCount }} compte{{ publishedCount > 1 ? 's' : '' }}.
        <router-link :to="{ name: 'posts_list' }" class="underline">Voir mes posts</router-link>
      </p>

      <p v-if="publishError" class="error-msg-box text-sm">{{ publishError }}</p>

      <div class="flex gap-3">
        <button type="button" class="secondary-btn" @click="step = 1">Retour</button>
        <button
          type="button"
          class="primary-btn"
          :disabled="!selectedTargets.length || publishing"
          @click="publish"
        >
          {{ publishing ? 'Envoi...' : (post.scheduleMode === 'later' ? 'Planifier la publication' : 'Publier') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue';
import { useAccountNetworks } from '@/composables/useAccountNetworks.js';
import AccountNetworkPicker from '@/components/Post/AccountNetworkPicker.vue';
import AppInput from '@/components/Common/Form/AppInput.vue';
import AppTextarea from '@/components/Common/Form/AppTextarea.vue';
import api from '@/plugins/api.js';

const { accountNetworks, loading: loadingAccounts, load: loadAccountNetworks } = useAccountNetworks();

const step = ref(1);
const step1Error = ref('');
const imagePreview = ref('');
const submitted = ref(false);
const selectedTargets = ref([]);
const submittingPost = ref(false);
const createdPostId = ref(null);
const publishing = ref(false);
const publishError = ref('');
const publishedCount = ref(0);

const post = reactive({
  title: '',
  caption: '',
  image: null,
  link: '',
  scheduleMode: 'now',
  scheduledAt: '',
});

function onImageChange(event) {
  const file = event.target.files?.[0] ?? null;
  post.image = file;
  imagePreview.value = file ? URL.createObjectURL(file) : '';
}

async function goToStep2() {
  if (!post.caption.trim()) {
    step1Error.value = 'Le texte du post est requis.';
    return;
  }
  if (post.scheduleMode === 'later' && !post.scheduledAt) {
    step1Error.value = 'Choisissez une date de diffusion.';
    return;
  }
  step1Error.value = '';

  const formData = new FormData();
  formData.append('text', post.caption);
  if (post.image) formData.append('file', post.image);

  submittingPost.value = true;
  try {
    const { data } = await api.post('/posts', formData, {
      headers: { 'Content-Type': undefined },
    });
    createdPostId.value = data.data.id;
    step.value = 2;
  } catch (e) {
    step1Error.value = e.response?.data?.message ?? 'Une erreur est survenue lors de la création du post.';
  } finally {
    submittingPost.value = false;
  }
}

const scheduleSummary = computed(() =>
  post.scheduleMode === 'later' && post.scheduledAt
    ? `Planifiée pour le ${post.scheduledAt}`
    : 'Immédiate'
);

async function publish() {
  publishing.value = true;
  publishError.value = '';

  const scheduledAt = post.scheduleMode === 'later' && post.scheduledAt
    ? new Date(post.scheduledAt).toISOString()
    : null;

  try {
    const { data } = await api.post(`/posts/${createdPostId.value}/publications`, {
      accountNetworkIds: selectedTargets.value,
      scheduledAt,
    });
    publishedCount.value = data.data.length;
    submitted.value = true;
  } catch (e) {
    publishError.value = e.response?.data?.message ?? 'La diffusion a échoué.';
  } finally {
    publishing.value = false;
  }
}

onMounted(loadAccountNetworks);
</script>
