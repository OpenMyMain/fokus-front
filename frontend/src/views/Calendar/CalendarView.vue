<template>
  <div class="flex flex-col gap-4">
    <div>
      <h1 class="mb-1">Calendrier</h1>
      <p class="text-sm text-gray-500">Publications planifiées et publiées, mois par mois.</p>
    </div>

    <div class="p-4 bg-white rounded-xl shadow flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <button type="button" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200" @click="goToPreviousMonth">‹</button>
        <p class="font-medium text-gray-900 capitalize">{{ monthLabel }}</p>
        <button type="button" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200" @click="goToNextMonth">›</button>
      </div>

      <select v-model="selectedAccountId" class="app-input" @change="loadPublications">
        <option :value="null">Tous les comptes</option>
        <option v-for="account in accountNetworks" :key="account.id" :value="account.id">
          {{ account.externalName ?? account.network }} ({{ networkLabel(account.network) }})
        </option>
      </select>

      <div class="grid grid-cols-7 gap-1 text-center text-xs text-gray-400">
        <span v-for="label in weekdayLabels" :key="label">{{ label }}</span>
      </div>

      <div class="grid grid-cols-7 gap-1">
        <button
          v-for="day in monthGrid"
          :key="day.toISOString()"
          type="button"
          class="aspect-square rounded-lg text-sm flex flex-col items-center justify-center gap-0.5 relative"
          :class="[
            isSameDay(day, selectedDay) ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-700',
            !isSameMonth(day, currentMonth) && !isSameDay(day, selectedDay) ? 'text-gray-300' : '',
          ]"
          @click="selectedDay = day"
        >
          {{ day.getDate() }}
          <span class="flex gap-0.5">
            <span
              v-for="pub in publicationsForDay(day).slice(0, 3)"
              :key="pub.id"
              class="w-1.5 h-1.5 rounded-full"
              :style="{ backgroundColor: networkColor(pub.accountNetwork.network) }"
            ></span>
          </span>
        </button>
      </div>
    </div>

    <p v-if="loading" class="text-sm text-gray-500">Chargement...</p>
    <p v-if="error" class="error-msg-box text-sm">{{ error }}</p>

    <div class="flex flex-col gap-3">
      <p class="text-sm font-medium text-gray-900">{{ selectedDayLabel }}</p>

      <p v-if="!loading && !selectedDayPublications.length" class="text-sm text-gray-500">
        Aucune publication ce jour-là.
      </p>

      <div
        v-for="pub in selectedDayPublications"
        :key="pub.id"
        class="p-4 bg-white rounded-xl shadow flex gap-3"
      >
        <span
          class="flex items-center justify-center w-8 h-8 rounded-full text-white shrink-0"
          :style="{ backgroundColor: networkColor(pub.accountNetwork.network) }"
        >
          <component :is="networkIcon(pub.accountNetwork.network)" class="w-4 h-4" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-sm text-gray-800 line-clamp-2">{{ pub.post?.text }}</p>
          <p class="text-xs text-gray-400 mt-1">
            {{ pub.accountNetwork.externalName ?? networkLabel(pub.accountNetwork.network) }} ·
            {{ formatTime(pub) }} · {{ statusLabel(pub.status) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/plugins/api.js';
import { findProvider } from '@/config/socialProviders.js';
import { useAccountNetworks } from '@/composables/useAccountNetworks.js';

const { accountNetworks, load: loadAccountNetworks } = useAccountNetworks();

const currentMonth = ref(startOfMonth(new Date()));
const selectedDay = ref(startOfMonth(new Date()));
const selectedAccountId = ref(null);
const publications = ref([]);
const loading = ref(false);
const error = ref('');

const weekdayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

const monthLabel = computed(() =>
  currentMonth.value.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
);

const monthGrid = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - leadingBlanks);

  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
});

const selectedDayLabel = computed(() =>
  selectedDay.value.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
);

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isSameMonth(day, month) {
  return day.getFullYear() === month.getFullYear() && day.getMonth() === month.getMonth();
}

function publicationEffectiveDate(pub) {
  return new Date(pub.scheduledAt ?? pub.publishedAt ?? pub.created_at);
}

const publicationsByDay = computed(() => {
  const map = new Map();
  for (const pub of publications.value) {
    const key = publicationEffectiveDate(pub).toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(pub);
  }
  return map;
});

function publicationsForDay(day) {
  return publicationsByDay.value.get(day.toDateString()) ?? [];
}

const selectedDayPublications = computed(() => publicationsForDay(selectedDay.value));

function networkLabel(slug) {
  return findProvider(slug)?.label ?? slug;
}

function networkColor(slug) {
  return findProvider(slug)?.color ?? '#192D40';
}

function networkIcon(slug) {
  return findProvider(slug)?.icon;
}

function statusLabel(status) {
  return { queued: 'En attente', scheduled: 'Planifiée', published: 'Publiée', error: 'Erreur' }[status] ?? status;
}

function formatTime(pub) {
  return publicationEffectiveDate(pub).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function goToPreviousMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1);
  selectedDay.value = startOfMonth(currentMonth.value);
  loadPublications();
}

function goToNextMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1);
  selectedDay.value = startOfMonth(currentMonth.value);
  loadPublications();
}

async function loadPublications() {
  loading.value = true;
  error.value = '';
  try {
    const from = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth(), 1);
    const to = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 0, 23, 59, 59);
    const params = { from: from.toISOString(), to: to.toISOString() };

    const endpoint = selectedAccountId.value
      ? `/account-networks/${selectedAccountId.value}/publications`
      : '/publications';

    const { data } = await api.get(endpoint, { params });
    publications.value = data.data;
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Impossible de charger les publications.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadAccountNetworks();
  loadPublications();
});
</script>
