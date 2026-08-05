<template>
  <nav
    class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface dark:bg-slate-950 border-t border-surface-variant dark:border-slate-800 shadow-[0_-2px_12px_rgba(15,23,42,0.06)]"
    :style="{ paddingBottom: 'env(safe-area-inset-bottom)' }"
    :aria-label="t('appNavbar.label')"
  >
    <div class="relative flex items-stretch h-16">
      <router-link
        v-for="item in leftItems"
        :key="item.name"
        :to="{ name: item.name }"
        class="flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors"
        :class="linkClass(item)"
        :aria-current="isActive(item) ? 'page' : undefined"
      >
        <span class="material-symbols-outlined text-[24px]" :style="iconStyle(item)">{{ item.icon }}</span>
        <span class="font-label-md text-[11px] leading-none">{{ t(item.label) }}</span>
      </router-link>

      <!-- Réservation de la place du bouton central : sans elle, les entrées se répartiraient
           sous le bouton et la moitié de leur surface tactile deviendrait inatteignable. -->
      <div class="w-20 shrink-0" aria-hidden="true"></div>

      <router-link
        v-for="item in rightItems"
        :key="item.name"
        :to="{ name: item.name }"
        class="flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors"
        :class="linkClass(item)"
        :aria-current="isActive(item) ? 'page' : undefined"
      >
        <span class="material-symbols-outlined text-[24px]" :style="iconStyle(item)">{{ item.icon }}</span>
        <span class="font-label-md text-[11px] leading-none">{{ t(item.label) }}</span>
      </router-link>

      <!-- Focus, surélevé au centre : c'est la raison d'être de l'app (décision D5), il doit
           rester atteignable d'un pouce depuis n'importe quel écran. Quand une session tourne,
           le bouton devient le compte à rebours. -->
      <router-link
        :to="{ name: 'focus' }"
        class="absolute left-1/2 -translate-x-1/2 -top-5 flex flex-col items-center"
        :aria-current="isFocusRoute ? 'page' : undefined"
        :aria-label="focusAriaLabel"
      >
        <span
          class="flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg ring-4 ring-surface dark:ring-slate-950 transition-transform active:scale-95"
          :class="focusElapsed ? 'bg-error dark:bg-red-900 animate-pulse' : 'accent-gradient'"
        >
          <span v-if="focusActive && !focusElapsed" class="font-label-md text-[11px] tabular-nums leading-none">
            {{ focusRemaining }}
          </span>
          <span v-else class="material-symbols-outlined text-[26px]" style="font-variation-settings: 'FILL' 1;">
            {{ focusElapsed ? 'notifications_active' : 'timer' }}
          </span>
        </span>
        <span
          class="mt-0.5 font-label-md text-[11px] leading-none"
          :class="isFocusRoute ? 'text-primary dark:text-blue-300' : 'text-outline dark:text-slate-400'"
        >
          {{ t('appNavbar.focus') }}
        </span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useFocusTimer } from '@/composables/useFocusTimer.js'

const { t } = useI18n()
const route = useRoute()

const {
  isActive: focusActive,
  isElapsed: focusElapsed,
  formattedRemaining: focusRemaining,
  restore: restoreFocus,
} = useFocusTimer()

// Les quatre domaines réels de l'app, deux de chaque côté du bouton focus. « Santé » et
// « Stats » de T-42 arriveront avec les phases 2 et 4 : pas d'onglet vers un écran inexistant.
const leftItems = [
  { name: 'home', icon: 'today', label: 'appNavbar.today' },
  { name: 'habits', icon: 'favorite', label: 'appNavbar.habits' },
]

const rightItems = [
  {
    name: 'planning',
    icon: 'calendar_month',
    label: 'appNavbar.planning',
    // Les RDV n'ont pas d'onglet propre : ils relèvent du même domaine « temps », et
    // l'onglet Planning doit rester actif pendant qu'on les consulte.
    match: ['planning', 'appointments'],
  },
  {
    name: 'projects',
    icon: 'folder_open',
    label: 'appNavbar.projects',
    match: ['projects', 'project_show', 'task_show'],
  },
]

const isActive = item => (item.match ?? [item.name]).includes(route.name)
const isFocusRoute = computed(() => route.name === 'focus')

const linkClass = item => (
  isActive(item)
    ? 'text-primary dark:text-blue-300'
    : 'text-outline dark:text-slate-400 hover:text-on-surface dark:hover:text-slate-200'
)

const iconStyle = item => (isActive(item) ? { fontVariationSettings: `'FILL' 1` } : {})

const focusAriaLabel = computed(() => {
  if (focusElapsed.value) {
    return t('appNavbar.focusElapsedAria')
  }

  return focusActive.value
    ? t('appNavbar.focusRunningAria', { time: focusRemaining.value })
    : t('appNavbar.focusStartAria')
})

onMounted(() => {
  restoreFocus()
})
</script>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
