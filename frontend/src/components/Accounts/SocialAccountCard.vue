<template>
  <div class="bg-surface-container-lowest border border-surface-variant rounded-xl p-4 hover:shadow-sm transition-shadow">
    <!-- Provider Header with Connect Button -->
    <div class="flex items-center justify-between gap-2 mb-3">
      <div class="flex items-center gap-3 min-w-0">
        <span
          class="flex items-center justify-center shrink-0 w-10 h-10 rounded-full text-white"
          :style="{ backgroundColor: provider.color }"
        >
          <component :is="provider.icon" class="w-5 h-5" />
        </span>
        <div class="min-w-0">
          <p class="font-label-md text-label-md text-on-surface truncate">{{ provider.label }}</p>
          <p class="text-body-sm text-body-sm text-outline">
            {{ accountsCount }} {{ accountsCount === 1 ? 'compte' : 'comptes' }}
          </p>
        </div>
      </div>
      <button
        @click="$emit('connect')"
        :disabled="loading"
        class="shrink-0 px-3 py-1 text-sm rounded-lg transition disabled:opacity-50 text-white hover:opacity-90 whitespace-nowrap"
        :style="{ backgroundColor: provider.color }"
      >
        {{ loading ? '...' : (accountsCount ? '+ Ajouter' : 'Connecter') }}
      </button>
    </div>

    <!-- Connected Accounts List -->
    <ul v-if="provider.accounts.length" class="space-y-2 border-t border-surface-variant pt-3">
      <li
        v-for="account in provider.accounts"
        :key="account.id"
        class="flex items-center justify-between gap-2"
      >
        <div class="min-w-0">
          <p class="font-body-sm text-body-sm text-on-surface truncate">{{ account.name }}</p>
          <p v-if="account.handle" class="font-body-sm text-body-sm text-outline truncate">{{ account.handle }}</p>
        </div>
        <button
          @click="$emit('disconnect', account.id)"
          class="shrink-0 text-xs px-2 py-1 rounded text-error hover:bg-error-container transition"
        >
          ✕
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  provider: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['connect', 'disconnect']);

const accountsCount = computed(() => props.provider.accounts?.length || 0);
</script>
