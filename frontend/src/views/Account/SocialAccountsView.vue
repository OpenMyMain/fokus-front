<template>
  <main class="max-w-[800px] mx-auto space-y-6">
    <!-- User/Brand Profile Section -->
    <section class="glass-card rounded-[24px] p-6 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
      <div class="relative">
        <img
          class="w-24 h-24 rounded-full object-cover shadow-sm ring-4 ring-white"
          :src="user?.logo || 'https://via.placeholder.com/96'"
          :alt="user?.company_name || 'Logo'"
        />
        <button
          class="absolute bottom-0 right-0 bg-surface-container-lowest h-8 w-8 rounded-full flex items-center justify-center shadow hover:bg-surface-container-low transition-colors"
        >
          <span class="material-symbols-outlined text-[16px] text-primary">edit</span>
        </button>
      </div>
      <div class="flex-1 space-y-2">
        <div class="flex items-center justify-center md:justify-start gap-2">
          <h2 class="font-headline-md md:font-display-lg md:text-display-lg text-on-surface">
            {{ user?.company_name || 'Acme Studio' }}
          </h2>
          <span class="material-symbols-outlined text-primary text-[20px]" style="font-variation-settings: 'FILL' 1;">verified</span>
        </div>
        <p class="font-body-lg text-body-lg text-outline">
          {{ user?.description || 'Premium creative agency specializing in digital experiences.' }}
        </p>
        <div v-if="user?.tags" class="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
          <span
            v-for="tag in user.tags"
            :key="tag"
            class="px-3 py-1 bg-surface-container text-on-surface-variant rounded-full font-label-md text-label-md"
          >
            {{ tag }}
          </span>
        </div>
      </div>
      <button class="accent-gradient text-white px-6 py-2 rounded-lg font-label-md text-label-md shadow hover:opacity-90 transition-opacity">
        Edit Profile
      </button>
    </section>

    <!-- Connected Accounts Section -->
    <section class="space-y-md">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">group_work</span>
          <h3 class="font-headline-sm text-headline-sm text-on-surface">Comptes connectés</h3>
        </div>
        <button
          @click="showAddConnection = true"
          class="text-primary font-label-md text-label-md flex items-center gap-1 hover:text-primary-fixed-dim transition-colors"
        >
          <span class="material-symbols-outlined text-[18px]">add</span> Ajouter
        </button>
      </div>

      <!-- Main Brand Group -->
      <div v-if="providers.length > 0" class="glass-card rounded-[24px] p-6 space-y-4">
        <div class="flex justify-between items-center border-b border-surface-variant pb-2">
          <h4 class="font-headline-sm text-headline-sm text-on-surface">{{ user?.company_name || 'Acme Studio' }} (Main)</h4>
          <span class="px-2 py-1 bg-primary-container text-on-primary-container rounded font-label-md text-label-md">Default</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <social-account-card
            v-for="provider in providers"
            :key="provider.slug"
            :provider="provider"
            :loading="loadingSlug === provider.slug"
            @connect="connect(provider.slug)"
            @disconnect="(accountId) => disconnect(provider.slug, accountId)"
          />
        </div>
      </div>

      <p v-if="error" class="text-error text-sm">{{ error }}</p>
    </section>
  </main>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/auth.js';
import { useSocialAccountsStore } from '@/stores/socialAccounts.js';
import SocialAccountCard from '@/components/Accounts/SocialAccountCard.vue';
import { useSocialConnect } from '@/composables/useSocialConnect.js';

const authStore = useAuthStore();
const socialAccountsStore = useSocialAccountsStore();
const { providers } = storeToRefs(socialAccountsStore);

const user = computed(() => authStore.user);
const showAddConnection = ref(false);

const { loadingSlug, error, connect } = useSocialConnect();

function disconnect(slug, accountId) {
  socialAccountsStore.disconnect(slug, accountId);
}
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);
}

.accent-gradient {
  background: linear-gradient(135deg, #4f46e5 0%, #3525cd 100%);
}
</style>
