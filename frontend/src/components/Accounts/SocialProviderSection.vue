<template>
  <div class="p-4 bg-white rounded-xl shadow">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <span
          class="flex items-center justify-center shrink-0 w-10 h-10 rounded-full text-white"
          :style="{ backgroundColor: color }"
        >
          <component :is="icon" class="w-5 h-5" />
        </span>
        <div class="min-w-0">
          <p class="font-medium text-gray-900 truncate">{{ label }}</p>
          <p class="text-sm truncate" :class="accounts.length ? 'text-green-600' : 'text-gray-400'">
            {{ accountsSummary }}
          </p>
        </div>
      </div>

      <button
        type="button"
        @click="$emit('connect')"
        :disabled="loading"
        class="shrink-0 px-4 py-2 text-sm rounded-lg transition disabled:opacity-50 text-white hover:opacity-90"
        :style="{ backgroundColor: color }"
      >
        {{ loading ? '...' : (accounts.length ? '+ Ajouter' : 'Connecter') }}
      </button>
    </div>

    <ul v-if="accounts.length" class="mt-3 divide-y divide-gray-100 border-t border-gray-100">
      <li
        v-for="account in accounts"
        :key="account.id"
        class="flex items-center justify-between gap-3 py-2"
      >
        <div class="min-w-0">
          <p class="text-sm font-medium text-gray-800 truncate">{{ account.name }}</p>
          <p v-if="account.handle" class="text-xs text-gray-400 truncate">{{ account.handle }}</p>
        </div>
        <button
          type="button"
          @click="$emit('disconnect', account.id)"
          class="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
        >
          Déconnecter
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  icon: { type: [Object, Function], required: true },
  color: { type: String, default: '#4B5563' },
  accounts: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});
defineEmits(['connect', 'disconnect']);

const accountsSummary = computed(() => {
  const count = props.accounts.length;
  if (!count) return 'Non connecté';
  return `${count} compte${count > 1 ? 's' : ''} connecté${count > 1 ? 's' : ''}`;
});
</script>
