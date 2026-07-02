<template>
  <div class="bg-background text-on-background min-h-screen font-body-md pt-16 pb-24 md:pb-8">
    <!-- TopAppBar -->
    <header class="flex justify-between items-center px-margin-mobile h-16 w-full fixed top-0 z-50 bg-surface shadow-sm">
      <button class="text-primary hover:bg-surface-container-low p-2 rounded-full transition-colors duration-200">
        <span class="material-symbols-outlined">hub</span>
      </button>
      <h1 class="font-display-lg text-display-lg font-bold text-primary">Magnum</h1>
      <button class="text-outline hover:bg-surface-container-low p-2 rounded-full transition-colors duration-200">
        <span class="material-symbols-outlined">notifications</span>
      </button>
    </header>

    <main class="max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop space-y-xl mt-lg">
      <!-- User/Brand Profile Section -->
      <section class="glass-card rounded-[24px] p-6 flex flex-col md:flex-row items-center md:items-start gap-lg text-center md:text-left">
        <div class="relative">
          <img
            class="w-24 h-24 rounded-full object-cover shadow-sm ring-4 ring-white"
            :src="user?.logo || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7fX1P98sLBPSP6rdcW63uRO4p0ZNzsPZB-IOzCeWX3NA7OGUjFVqognvk1Dy8UKpyhRea9nLY6Gx4jeX-4IUFi-o79xZK49_JBw8dm-ZBO4I_mZ1KizsPV1vPj6162lz93u8Rv3-KOl64OdUlV5WGuxr6f5gHIYWWMeNawIYm1dokEg0HSmhtw97Wfe1BP2yi7MwpBIXzhyZOwUciocaqTchi9DLvc2OKNlWCRCEUBx8Sb-udM2pS'"
            :alt="user?.company_name || 'Logo'"
          />
          <button class="absolute bottom-0 right-0 bg-surface-container h-8 w-8 rounded-full flex items-center justify-center shadow hover:bg-surface-container-high transition-colors">
            <span class="material-symbols-outlined text-[16px] text-primary">edit</span>
          </button>
        </div>
        <div class="flex-1 space-y-xs">
          <div class="flex items-center justify-center md:justify-start gap-2">
            <h2 class="font-headline-md text-headline-md md:font-display-lg md:text-display-lg text-on-surface">
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

      <!-- Brand Identity Section (Bento Grid) -->
      <section class="space-y-md">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">fingerprint</span>
          <h3 class="font-headline-sm text-headline-sm text-on-surface">Brand Identity</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
          <!-- Brand Voice -->
          <div class="glass-card rounded-[24px] p-6 space-y-4">
            <h4 class="font-label-md text-label-md text-outline uppercase tracking-wider">Voice &amp; Tone</h4>
            <p class="font-body-md text-body-md text-on-surface">Authoritative yet accessible. We speak with clarity, avoiding jargon where possible, and aim to inspire confidence through our expertise.</p>
            <div class="flex gap-2">
              <span class="px-2 py-1 bg-surface-container-lowest border border-outline-variant text-on-surface rounded font-label-md text-label-md">Professional</span>
              <span class="px-2 py-1 bg-surface-container-lowest border border-outline-variant text-on-surface rounded font-label-md text-label-md">Clear</span>
            </div>
          </div>
          <!-- Target Audience -->
          <div class="glass-card rounded-[24px] p-6 space-y-4">
            <h4 class="font-label-md text-label-md text-outline uppercase tracking-wider">Target Audience</h4>
            <p class="font-body-md text-body-md text-on-surface">Mid-to-large enterprise marketing teams and startup founders looking for scalable design solutions.</p>
          </div>
          <!-- Brand Colors & Typography -->
          <div class="glass-card rounded-[24px] p-6 space-y-4 md:col-span-2 flex flex-col md:flex-row gap-6">
            <div class="flex-1 space-y-2">
              <h4 class="font-label-md text-label-md text-outline uppercase tracking-wider">Primary Colors</h4>
              <div class="flex gap-3 mt-2">
                <div class="w-10 h-10 rounded-full bg-[#0b1c30] shadow-sm border border-outline-variant relative group cursor-pointer">
                  <span class="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Deep Slate</span>
                </div>
                <div class="w-10 h-10 rounded-full bg-[#3525cd] shadow-sm border border-outline-variant relative group cursor-pointer">
                  <span class="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Electric Indigo</span>
                </div>
                <div class="w-10 h-10 rounded-full bg-[#f8f9ff] shadow-sm border border-outline-variant relative group cursor-pointer">
                  <span class="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Pure White</span>
                </div>
              </div>
            </div>
            <div class="w-px bg-outline-variant hidden md:block"></div>
            <div class="flex-1 space-y-2">
              <h4 class="font-label-md text-label-md text-outline uppercase tracking-wider">Typography</h4>
              <div class="flex items-baseline gap-4 mt-2">
                <span class="font-display-lg text-[24px] text-on-surface font-bold">Inter</span>
                <span class="font-body-sm text-body-sm text-outline">Primary Typeface</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Connected Accounts Section -->
      <section class="space-y-md">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">group_work</span>
            <h3 class="font-headline-sm text-headline-sm text-on-surface">Connected Accounts</h3>
          </div>
          <button
            @click="showAddConnection = true"
            class="text-primary font-label-md text-label-md flex items-center gap-1 hover:text-primary-fixed-dim transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">add</span> Add Connection
          </button>
        </div>

        <!-- Brand Groups -->
        <div v-for="group in accountGroups" :key="group.id" class="glass-card rounded-[24px] p-6 space-y-4">
          <div class="flex justify-between items-center border-b border-surface-variant pb-2">
            <h4 class="font-headline-sm text-headline-sm text-on-surface">{{ group.name }} {{ group.label }}</h4>
            <span v-if="group.label === '(Main)'" class="px-2 py-1 bg-primary-container text-on-primary-container rounded font-label-md text-label-md">Default</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <social-connected-card
              v-for="slug in group.providers"
              :key="slug"
              :provider="getProviderBySlug(slug)"
              :loading="loadingSlug === slug"
              @connect="connect(slug)"
              @disconnect="(accountId) => disconnect(slug, accountId)"
            />
          </div>
        </div>

        <p v-if="error" class="text-error text-sm">{{ error }}</p>
      </section>
    </main>

    <!-- BottomNavBar (Mobile Only) -->
    <nav class="fixed bottom-0 w-full z-50 flex justify-around items-center px-sm pb-4 pt-2 bg-surface shadow-[0_-4px_20px_rgba(15,23,42,0.05)] rounded-t-xl md:hidden">
      <router-link :to="{ name: 'calendar' }" class="flex flex-col items-center justify-center text-outline py-1 hover:text-primary transition-transform duration-150 active:scale-90 scale-95">
        <span class="material-symbols-outlined">calendar_month</span>
        <span class="font-label-md text-label-md">Plan</span>
      </router-link>
      <router-link :to="{ name: 'create_post' }" class="flex flex-col items-center justify-center text-outline py-1 hover:text-primary transition-transform duration-150 active:scale-90 scale-95">
        <span class="material-symbols-outlined">add_circle</span>
        <span class="font-label-md text-label-md">Create</span>
      </router-link>
      <a href="#" class="flex flex-col items-center justify-center text-outline py-1 hover:text-primary transition-transform duration-150 active:scale-90 scale-95">
        <span class="material-symbols-outlined">auto_awesome</span>
        <span class="font-label-md text-label-md">AI Hub</span>
      </a>
      <router-link :to="{ name: 'social_accounts' }" class="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 transition-transform duration-150 active:scale-90 scale-95">
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">manage_accounts</span>
        <span class="font-label-md text-label-md">Social</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/auth.js';
import { useSocialAccountsStore } from '@/stores/socialAccounts.js';
import SocialConnectedCard from '@/components/Accounts/SocialConnectedCard.vue';
import { useSocialConnect } from '@/composables/useSocialConnect.js';
import { accountGroups } from '@/config/mockConnectedAccounts.js';

const authStore = useAuthStore();
const socialAccountsStore = useSocialAccountsStore();
const { providers } = storeToRefs(socialAccountsStore);

const user = computed(() => authStore.user);
const showAddConnection = ref(false);

const { loadingSlug, error, connect } = useSocialConnect();

function getProviderBySlug(slug) {
  return providers.value.find(p => p.slug === slug);
}

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
