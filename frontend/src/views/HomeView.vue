<template>
  <main class="p-6">
    <router-link
      :to="{ name: 'social_accounts' }"
      class="flex items-center justify-between gap-3 p-4 bg-white rounded-xl shadow hover:shadow-md transition"
    >
      <div class="flex items-center gap-3">
        <div class="flex -space-x-2">
          <span
            v-for="provider in socialAccountsStore.providers"
            :key="provider.slug"
            class="flex items-center justify-center w-8 h-8 rounded-full text-white ring-2 ring-white"
            :style="{ backgroundColor: provider.color }"
          >
            <component :is="provider.icon" class="w-4 h-4" />
          </span>
        </div>
        <div>
          <p class="font-medium text-gray-900">Réseaux sociaux</p>
          <p class="text-sm text-gray-500">{{ summary }}</p>
        </div>
      </div>

      <svg class="w-5 h-5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
      </svg>
    </router-link>

    <router-link
      :to="{ name: 'create_post' }"
      class="flex items-center justify-between gap-3 p-4 mt-4 bg-white rounded-xl shadow hover:shadow-md transition"
    >
      <div class="flex items-center gap-3">
        <span class="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
        </span>
        <div>
          <p class="font-medium text-gray-900">Créer un post</p>
          <p class="text-sm text-gray-500">Rédiger et diffuser sur mes réseaux</p>
        </div>
      </div>

      <svg class="w-5 h-5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
      </svg>
    </router-link>

    <router-link
      :to="{ name: 'posts_list' }"
      class="flex items-center justify-between gap-3 p-4 mt-4 bg-white rounded-xl shadow hover:shadow-md transition"
    >
      <div class="flex items-center gap-3">
        <span class="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/>
          </svg>
        </span>
        <div>
          <p class="font-medium text-gray-900">Mes posts</p>
          <p class="text-sm text-gray-500">Historique des posts créés</p>
        </div>
      </div>

      <svg class="w-5 h-5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
      </svg>
    </router-link>

    <router-link
      :to="{ name: 'calendar' }"
      class="flex items-center justify-between gap-3 p-4 mt-4 bg-white rounded-xl shadow hover:shadow-md transition"
    >
      <div class="flex items-center gap-3">
        <span class="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </span>
        <div>
          <p class="font-medium text-gray-900">Calendrier</p>
          <p class="text-sm text-gray-500">Voir les publications du mois</p>
        </div>
      </div>

      <svg class="w-5 h-5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
      </svg>
    </router-link>
  </main>
</template>

<script setup>
import { computed } from 'vue';
import { useSocialAccountsStore } from '@/stores/socialAccounts.js';

const socialAccountsStore = useSocialAccountsStore();

const summary = computed(() =>
  socialAccountsStore.totalConnected
    ? `${socialAccountsStore.totalConnected} compte${socialAccountsStore.totalConnected > 1 ? 's' : ''} connecté${socialAccountsStore.totalConnected > 1 ? 's' : ''}`
    : 'Gérer mes comptes connectés'
);
</script>
