<template>
  <div class="flex flex-col gap-3">
    <div v-for="group in groups" :key="group.slug" class="p-4 bg-white rounded-xl shadow">
      <div class="flex items-center gap-3 mb-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-full text-white" :style="{ backgroundColor: group.color }">
          <component :is="group.icon" class="w-4 h-4"/>
        </span>
        <p class="font-medium text-gray-900">{{ group.label }}</p>
      </div>

      <p v-if="!group.accounts.length" class="text-sm text-gray-400">
        Aucun compte connecté —
        <router-link :to="{ name: 'social_accounts' }" class="text-primary underline">en connecter un</router-link>
      </p>

      <label
        v-for="account in group.accounts"
        :key="account.id"
        class="flex items-center gap-3 py-2 border-t border-gray-100 first:border-t-0"
        :class="{ 'opacity-50': isExcluded(account.id) }"
      >
        <input
          type="checkbox"
          :checked="modelValue.includes(account.id)"
          :disabled="isExcluded(account.id)"
          @change="toggle(account.id, $event.target.checked)"
          class="h-4 w-4 text-primary border-gray-300 rounded"
        />
        <span class="text-sm text-gray-800">{{ account.externalName ?? group.label }}</span>
        <span v-if="isExcluded(account.id)" class="text-xs text-gray-400 ml-auto">Déjà diffusé</span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { findProvider, publishableNetworks } from '@/config/socialProviders.js';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  accountNetworks: { type: Array, default: () => [] },
  excludeAccountIds: { type: Array, default: () => [] },
});
const emit = defineEmits(['update:modelValue']);

const groups = computed(() =>
  publishableNetworks.map((slug) => {
    const provider = findProvider(slug);
    return {
      slug,
      label: provider?.label ?? slug,
      icon: provider?.icon,
      color: provider?.color,
      accounts: props.accountNetworks.filter((account) => account.network === slug),
    };
  })
);

function isExcluded(accountId) {
  return props.excludeAccountIds.includes(accountId);
}

function toggle(accountId, checked) {
  const next = checked
    ? [...props.modelValue, accountId]
    : props.modelValue.filter((id) => id !== accountId);
  emit('update:modelValue', next);
}
</script>
