<template>
  <header class="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 w-full fixed top-0 z-50 bg-surface dark:bg-slate-950 shadow-sm transition-colors duration-200">
    <div class="flex items-center gap-6">
      <router-link :to="{ name: 'home' }" class="font-headline-sm text-headline-sm md:font-display-lg md:text-display-lg font-bold text-primary dark:text-blue-300 flex items-center gap-2">
        <img :src="logoUrl" alt="Fokus" class="w-8 h-8 object-contain shrink-0" />
        Fokus
      </router-link>
      <!-- Mêmes destinations que la navbar mobile, dans le même ordre : la navigation doit
           raconter la même chose sur les deux tailles d'écran (F-14). -->
      <router-link
        v-for="link in desktopLinks"
        :key="link.name"
        :to="{ name: link.name }"
        class="hidden md:block font-body-md text-body-md transition-colors"
        :class="isCurrent(link)
          ? 'text-primary dark:text-blue-300 font-semibold'
          : 'text-on-surface dark:text-slate-100 hover:text-primary dark:hover:text-blue-300'"
        :aria-current="isCurrent(link) ? 'page' : undefined"
      >
        {{ t(link.label) }}
      </router-link>
    </div>

    <div class="flex items-center gap-3">
      <!-- Focus en cours : visible depuis n'importe quel écran (décision D3) -->
      <router-link
        v-if="focusActive"
        :to="{ name: 'focus' }"
        class="flex items-center gap-1.5 h-9 px-3 rounded-full font-label-md text-label-md tabular-nums transition-colors"
        :class="focusElapsed
          ? 'bg-error-container text-error dark:bg-red-900 dark:text-red-200'
          : 'bg-primary-fixed text-on-primary-fixed dark:bg-blue-800 dark:text-blue-100'"
        :aria-label="t('appHeader.focusRunning')"
      >
        <span class="material-symbols-outlined text-[18px]">
          {{ focusElapsed ? 'notifications_active' : (focusRunning ? 'timer' : 'pause') }}
        </span>
        <span>{{ focusElapsed ? t('appHeader.focusBreak') : focusRemaining }}</span>
      </router-link>

      <!-- Bouton de capture rapide (ajout de tâche) -->
      <button
        type="button"
        class="flex items-center justify-center w-9 h-9 rounded-full accent-gradient text-white shadow-sm hover:opacity-90 transition-opacity"
        :aria-label="t('appHeader.quickAdd')"
        @click="quickAdd.open()"
      >
        <span class="material-symbols-outlined text-[22px]">add</span>
      </button>

      <!-- Photo de profil + menu compte -->
      <div class="relative">
        <button
          type="button"
          class="flex items-center gap-2 rounded-full cursor-pointer transition-colors md:pl-1 md:pr-2.5 md:py-1 profile-menu-btn"
          :aria-expanded="menuOpen"
          aria-haspopup="menu"
          :aria-label="t('appHeader.openAccountMenu')"
          @click="menuOpen = !menuOpen"
        >
          <span class="w-8 h-8 rounded-full overflow-hidden border border-surface-variant dark:border-slate-700 shrink-0 flex items-center justify-center bg-primary-fixed dark:bg-blue-800">
            <img
              v-if="user?.profilePictureUrl"
              :src="user.profilePictureUrl"
              :alt="fullName || t('appHeader.profileAlt')"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-on-primary-fixed dark:text-blue-100 font-bold text-body-sm">{{ initials }}</span>
          </span>
          <span class="hidden md:block font-label-md text-label-md text-on-surface dark:text-slate-100 max-w-[120px] truncate">{{ fullName || t('appHeader.myAccount') }}</span>
          <span class="hidden md:block material-symbols-outlined text-outline dark:text-slate-400 shrink-0" style="font-size: 18px;">expand_more</span>
        </button>

        <!-- Overlay pour fermer au clic extérieur -->
        <div v-if="menuOpen" class="fixed inset-0 z-40" @click="menuOpen = false"></div>

        <!-- Menu déroulant -->
        <div
          v-if="menuOpen"
          role="menu"
          class="absolute right-0 mt-2 w-56 z-50 bg-surface-container-lowest dark:bg-slate-800 rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.12)] border border-surface-variant dark:border-slate-700 overflow-hidden"
        >
          <div class="px-4 py-3 border-b border-surface-variant dark:border-slate-700">
            <p class="font-label-md text-label-md text-on-surface dark:text-slate-100 truncate">{{ fullName || t('appHeader.myAccount') }}</p>
            <p class="font-body-sm text-body-sm text-outline dark:text-slate-400 truncate">{{ user?.email || t('appHeader.manageYourSpace') }}</p>
          </div>
          <nav class="py-1">
            <router-link
              :to="{ name: 'profile' }"
              role="menuitem"
              class="flex items-center gap-3 px-4 py-2.5 font-body-md text-body-md text-on-surface dark:text-slate-100 hover:bg-surface-container-low transition-colors"
              @click="menuOpen = false"
            >
              <span class="material-symbols-outlined text-[20px] text-secondary dark:text-slate-300">person</span> {{ t('appHeader.menuProfile') }}
            </router-link>
          </nav>
          <div class="border-t border-surface-variant dark:border-slate-700 py-1">
            <router-link
              :to="{ name: 'logout' }"
              role="menuitem"
              class="flex items-center gap-3 px-4 py-2.5 font-body-md text-body-md text-error dark:text-red-400 hover:bg-error-container/40 transition-colors"
              @click="menuOpen = false"
            >
              <span class="material-symbols-outlined text-[20px]">logout</span> {{ t('appHeader.menuLogout') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';
import { useQuickAdd } from '@/composables/useQuickAdd';
import { useFocusTimer } from '@/composables/useFocusTimer.js';
import logoUrl from '@/assets/images/logo-only.png';

const { t } = useI18n();
const authStore = useAuthStore();
const quickAdd = useQuickAdd();
const user = computed(() => authStore.user);

const {
  isActive: focusActive,
  isRunning: focusRunning,
  isElapsed: focusElapsed,
  formattedRemaining: focusRemaining,
  restore: restoreFocus,
} = useFocusTimer();

const route = useRoute();

const desktopLinks = [
  { name: 'home', label: 'appHeader.menuToday' },
  { name: 'habits', label: 'appHeader.menuHabits' },
  { name: 'focus', label: 'appHeader.menuFocus' },
  { name: 'planning', label: 'appHeader.menuPlanning' },
  { name: 'appointments', label: 'appHeader.menuAppointments' },
  { name: 'projects', label: 'appHeader.menuProjects', match: ['projects', 'project_show', 'task_show'] },
];

const isCurrent = link => (link.match ?? [link.name]).includes(route.name);

// Menu compte
const menuOpen = ref(false);

const fullName = computed(() => {
  const parts = [user.value?.firstname, user.value?.lastname].filter(Boolean);
  return parts.join(' ').trim();
});

const initials = computed(() => {
  const first = user.value?.firstname?.trim()?.[0] ?? '';
  const last = user.value?.lastname?.trim()?.[0] ?? '';
  const result = `${first}${last}`.toUpperCase();
  return result || '?';
});

function onKeydown(e) {
  if (e.key === 'Escape') menuOpen.value = false;
}
onMounted(() => {
  window.addEventListener('keydown', onKeydown);
  // Le header est monté une fois pour toute la coquille authentifiée : c'est le bon endroit
  // pour reprendre une session de focus au lancement de l'app.
  restoreFocus();
});
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
