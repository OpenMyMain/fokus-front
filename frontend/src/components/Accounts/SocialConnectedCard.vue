<template>
  <div class="bg-surface-container-lowest border border-surface-variant rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow cursor-pointer">
    <div class="w-10 h-10 rounded-full flex items-center justify-center text-white relative" :style="{ backgroundColor: provider.color }">
      <component :is="provider.icon" class="w-5 h-5" />
      <div v-if="firstAccount?.status === 'connected'" class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      <div v-else-if="firstAccount?.status === 'reauth'" class="absolute bottom-0 right-0 w-3 h-3 bg-yellow-500 border-2 border-white rounded-full" title="Re-auth needed"></div>
    </div>
    <div class="flex-1 min-w-0">
      <p class="font-label-md text-label-md text-on-surface truncate">
        {{ firstAccount?.handle || firstAccount?.name || provider.label }}
      </p>
      <p
        class="font-body-sm text-body-sm truncate"
        :class="firstAccount?.status === 'reauth' ? 'text-error' : 'text-outline'"
      >
        {{ firstAccount?.status === 'reauth' ? 'Re-authenticate' : provider.label }}
      </p>
    </div>
    <button @click.stop="showMenu = !showMenu" class="text-outline hover:text-on-surface">
      <span class="material-symbols-outlined">more_vert</span>
    </button>

    <!-- Menu Dropdown -->
    <div v-if="showMenu" class="absolute right-4 top-12 bg-surface rounded-lg shadow-lg border border-surface-variant z-10">
      <button
        v-if="provider.accounts.length < 3"
        @click="handleConnect"
        class="block w-full text-left px-4 py-2 text-body-sm text-on-surface hover:bg-surface-container"
      >
        Ajouter compte
      </button>
      <button
        @click="handleConnect"
        class="block w-full text-left px-4 py-2 text-body-sm text-on-surface hover:bg-surface-container"
      >
        Connecter
      </button>
      <button
        v-if="firstAccount"
        @click="handleDisconnect"
        class="block w-full text-left px-4 py-2 text-body-sm text-error hover:bg-error-container"
      >
        Déconnecter
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

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

const emit = defineEmits(['connect', 'disconnect']);

const showMenu = ref(false);

const firstAccount = computed(() => props.provider.accounts?.[0] || null);

function handleConnect() {
  emit('connect');
  showMenu.value = false;
}

function handleDisconnect() {
  if (firstAccount.value) {
    emit('disconnect', firstAccount.value.id);
    showMenu.value = false;
  }
}
</script>
