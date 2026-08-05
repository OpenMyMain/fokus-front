<template>
  <main class="max-w-3xl mx-auto py-lg space-y-lg">
    <!-- En-tête : salutation + date du jour -->
    <div class="space-y-1">
      <p class="font-label-md text-label-md text-outline dark:text-slate-400 uppercase">{{ todayLabel }}</p>
      <h1 class="font-headline-md text-headline-md md:font-display-lg md:text-display-lg text-on-surface dark:text-slate-100">
        {{ t(greetingKey, { name: user?.firstname || '' }) }}
      </h1>
      <p class="font-body-lg text-body-lg text-outline dark:text-slate-400">{{ summary }}</p>
    </div>

    <!-- Mode focus : l'action principale de l'écran -->
    <router-link
      :to="{ name: 'focus' }"
      class="block rounded-xl p-4 md:p-6 shadow-lg transition-transform active:scale-[0.99]"
      :class="focusElapsed ? 'bg-error dark:bg-red-900 text-white' : 'accent-gradient text-white'"
    >
      <div class="flex items-center gap-4">
        <span class="material-symbols-outlined text-[36px] shrink-0" style="font-variation-settings: 'FILL' 1;">
          {{ focusElapsed ? 'notifications_active' : (focusActive ? 'timer' : 'play_circle') }}
        </span>
        <div class="flex-1 min-w-0">
          <p class="font-headline-sm text-headline-sm">
            {{ focusElapsed ? t('homeView.focusElapsed') : t('homeView.focusTitle') }}
          </p>
          <p class="font-body-sm text-body-sm opacity-90">{{ focusSubtitle }}</p>
        </div>
        <p v-if="focusActive && !focusElapsed" class="font-display-lg text-display-lg tabular-nums shrink-0">
          {{ focusRemaining }}
        </p>
        <span v-else class="material-symbols-outlined shrink-0">chevron_right</span>
      </div>
    </router-link>

    <!-- Habitudes du jour : la seule progression réellement mesurable aujourd'hui -->
    <section class="glass-card rounded-xl p-4 md:p-6 space-y-4">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <span class="material-symbols-outlined text-primary dark:text-blue-300 text-[26px]">favorite</span>
          <h2 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100 truncate">
            {{ t('homeView.habitsTitle') }}
          </h2>
        </div>
        <span v-if="occurrences.length" class="font-label-md text-label-md text-outline dark:text-slate-400 shrink-0">
          {{ t('homeView.progress', { done: doneCount, total: occurrences.length }) }}
        </span>
      </div>

      <div v-if="occurrences.length" class="h-2 rounded-full bg-surface-container dark:bg-slate-700 overflow-hidden">
        <div
          class="h-full accent-gradient transition-all duration-300"
          :style="{ width: `${progressPercent}%` }"
        ></div>
      </div>

      <!-- Chargement : un squelette plutôt qu'un spinner (esprit de T-43) -->
      <ul v-if="occurrencesLoading && !occurrences.length" class="space-y-2">
        <li v-for="n in 3" :key="n" class="h-14 rounded-lg bg-surface-container dark:bg-slate-800/60 animate-pulse"></li>
      </ul>

      <p v-else-if="occurrencesError" class="font-body-sm text-body-sm text-error dark:text-red-400">
        {{ t('homeView.habitsError') }}
      </p>

      <!-- État vide : on propose l'action qui le résout, plutôt qu'un simple constat -->
      <div v-else-if="!occurrences.length" class="text-center py-4 space-y-3">
        <span class="material-symbols-outlined text-[40px] text-outline dark:text-slate-500">self_improvement</span>
        <p class="font-body-md text-body-md text-outline dark:text-slate-400">{{ t('homeView.habitsEmpty') }}</p>
        <router-link
          :to="{ name: 'habits' }"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-label-md text-primary dark:text-blue-300 border border-primary dark:border-blue-600 hover:bg-primary-container/30 transition-colors"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>
          {{ t('homeView.habitsEmptyCta') }}
        </router-link>
      </div>

      <ul v-else class="space-y-2">
        <li
          v-for="occurrence in sortedOccurrences"
          :key="occurrence.id"
          class="flex items-start gap-3 p-3 rounded-lg transition-colors"
          :class="isPending(occurrence)
            ? 'bg-surface-container-low dark:bg-slate-800/60'
            : 'bg-surface-container-low/50 dark:bg-slate-800/30'"
        >
          <button
            type="button"
            class="mt-0.5 shrink-0 transition-colors disabled:opacity-50"
            :class="occurrence.status === OCCURRENCE_STATUS.DONE
              ? 'text-primary dark:text-blue-300'
              : 'text-outline dark:text-slate-400 hover:text-primary dark:hover:text-blue-300'"
            :disabled="pendingIds.has(occurrence.id)"
            :aria-label="isPending(occurrence) ? t('homeView.markDone') : t('homeView.markPending')"
            @click="onToggle(occurrence)"
          >
            <span
              class="material-symbols-outlined text-[24px]"
              :style="occurrence.status === OCCURRENCE_STATUS.DONE ? { fontVariationSettings: `'FILL' 1` } : {}"
            >
              {{ statusIcon(occurrence) }}
            </span>
          </button>

          <div class="flex-1 min-w-0 space-y-1">
            <p
              class="font-body-md text-body-md text-on-surface dark:text-slate-100"
              :class="{ 'line-through text-outline dark:text-slate-500': !isPending(occurrence) }"
            >
              {{ occurrence.habit?.name ?? t('homeView.untitledHabit') }}
            </p>
            <div class="flex flex-wrap items-center gap-2">
              <span
                v-if="occurrence.habit?.reminderTime"
                class="flex items-center gap-1 font-body-sm text-body-sm text-outline dark:text-slate-400"
              >
                <span class="material-symbols-outlined text-[14px]">schedule</span>
                {{ formatTime(occurrence.habit.reminderTime) }}
              </span>
              <span
                v-if="occurrence.status === OCCURRENCE_STATUS.SKIPPED"
                class="inline-block px-2 py-0.5 rounded font-label-md text-[11px] bg-surface-container text-on-surface-variant dark:bg-slate-700 dark:text-slate-300"
              >
                {{ t('homeView.skipped') }}
              </span>
            </div>
          </div>

          <!-- « Passer » n'est proposé que sur une habitude encore à faire -->
          <button
            v-if="isPending(occurrence)"
            type="button"
            class="shrink-0 mt-0.5 text-outline dark:text-slate-400 hover:text-on-surface dark:hover:text-slate-200 transition-colors disabled:opacity-50"
            :disabled="pendingIds.has(occurrence.id)"
            :aria-label="t('homeView.skip')"
            :title="t('homeView.skip')"
            @click="onSkip(occurrence)"
          >
            <span class="material-symbols-outlined text-[20px]">block</span>
          </button>
        </li>
      </ul>
    </section>

    <!-- Créneaux du jour -->
    <section class="glass-card rounded-xl p-4 md:p-6 space-y-4">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <span class="material-symbols-outlined text-primary dark:text-blue-300 text-[26px]">calendar_month</span>
          <h2 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100 truncate">
            {{ t('homeView.slotsTitle') }}
          </h2>
        </div>
        <router-link
          :to="{ name: 'planning' }"
          class="font-label-md text-label-md text-primary dark:text-blue-300 shrink-0 hover:underline"
        >
          {{ t('homeView.seePlanning') }}
        </router-link>
      </div>

      <ul v-if="slotsLoading && !todaySlots.length" class="space-y-2">
        <li v-for="n in 2" :key="n" class="h-12 rounded-lg bg-surface-container dark:bg-slate-800/60 animate-pulse"></li>
      </ul>

      <p v-else-if="slotsError" class="font-body-sm text-body-sm text-error dark:text-red-400">
        {{ t('homeView.slotsError') }}
      </p>

      <p v-else-if="!todaySlots.length" class="font-body-md text-body-md text-outline dark:text-slate-400 text-center py-2">
        {{ t('homeView.slotsEmpty') }}
      </p>

      <ul v-else class="space-y-2">
        <li
          v-for="slot in todaySlots"
          :key="slot.id"
          class="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low dark:bg-slate-800/60"
        >
          <span
            class="w-2 h-10 rounded-full shrink-0"
            :style="{ backgroundColor: slot.timeSlot?.bgColor || DEFAULT_SLOT_COLOR }"
          ></span>
          <div class="flex-1 min-w-0">
            <p class="font-body-md text-body-md text-on-surface dark:text-slate-100 truncate">
              {{ slot.timeSlot?.name ?? t('homeView.untitledSlot') }}
            </p>
            <p class="font-body-sm text-body-sm text-outline dark:text-slate-400">
              {{ quarterToTime(slot.startQuarter) }} – {{ quarterToTime(slot.startQuarter + slot.durationQuarters) }}
            </p>
          </div>
          <span
            v-if="isSlotNow(slot)"
            class="shrink-0 px-2 py-0.5 rounded font-label-md text-[11px] bg-primary-fixed text-on-primary-fixed dark:bg-blue-800 dark:text-blue-100"
          >
            {{ t('homeView.slotNow') }}
          </span>
        </li>
      </ul>
    </section>

    <!--
      Les tâches dues n'apparaissent pas encore : le backend n'expose les tâches que projet par
      projet (`GET /api/projects/{project}/tasks`). Les lister ici demanderait une requête par
      projet. C'est l'objet de l'endpoint agrégé T-09.
    -->
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.js'
import { OCCURRENCE_STATUS, useHabitOccurrencesStore } from '@/stores/habitOccurrences.js'
import { useTimeSlotsStore } from '@/stores/timeSlots.js'
import { useFocusTimer } from '@/composables/useFocusTimer.js'
import { useToast } from '@/composables/useToast.js'

const DEFAULT_SLOT_COLOR = '#ad1edd'

const { t, locale } = useI18n()
const toast = useToast()
const authStore = useAuthStore()
const occurrencesStore = useHabitOccurrencesStore()
const timeSlotsStore = useTimeSlotsStore()

const user = computed(() => authStore.user)

const {
  isActive: focusActive,
  isElapsed: focusElapsed,
  isRunning: focusRunning,
  formattedRemaining: focusRemaining,
  endsAtLabel: focusEndsAt,
  restore: restoreFocus,
} = useFocusTimer()

const occurrences = computed(() => occurrencesStore.occurrences)
const occurrencesLoading = computed(() => occurrencesStore.loading)
const occurrencesError = ref(false)
const slotsLoading = ref(false)
const slotsError = ref(false)
const todaySlots = ref([])
// Identifiants en cours d'envoi : évite le double clic pendant l'aller-retour réseau.
const pendingIds = ref(new Set())

const todayLabel = computed(() => new Date().toLocaleDateString(locale.value, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
}))

// La salutation suit l'heure : « Bonjour » à 22 h sonnerait faux.
const greetingKey = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return 'homeView.greetingNight'
  if (hour < 12) return 'homeView.greetingMorning'
  if (hour < 18) return 'homeView.greetingAfternoon'

  return 'homeView.greetingEvening'
})

const doneCount = computed(() => occurrences.value.filter(o => o.status === OCCURRENCE_STATUS.DONE).length)
const remainingCount = computed(() => occurrences.value.filter(o => o.status === OCCURRENCE_STATUS.PENDING).length)

const progressPercent = computed(() => {
  if (!occurrences.value.length) {
    return 0
  }
  // Une habitude passée compte comme traitée : la barre mesure ce qui reste à décider,
  // sinon elle resterait bloquée à cause d'une habitude volontairement sautée.
  const handled = occurrences.value.filter(o => o.status !== OCCURRENCE_STATUS.PENDING).length

  return Math.round((handled / occurrences.value.length) * 100)
})

const summary = computed(() => {
  if (occurrencesLoading.value && !occurrences.value.length) {
    return t('homeView.summaryLoading')
  }
  if (!occurrences.value.length) {
    return t('homeView.summaryNoHabits')
  }
  if (remainingCount.value === 0) {
    return t('homeView.summaryAllDone')
  }

  return t('homeView.summaryRemaining', remainingCount.value)
})

const focusSubtitle = computed(() => {
  if (focusElapsed.value) {
    return t('homeView.focusElapsedHint')
  }
  if (focusRunning.value) {
    return t('homeView.focusRunning', { time: focusEndsAt.value })
  }
  if (focusActive.value) {
    return t('homeView.focusPaused')
  }

  return t('homeView.focusHint')
})

// Les habitudes encore à faire remontent en tête, puis on garde l'ordre de l'API.
const sortedOccurrences = computed(() => {
  const rank = { [OCCURRENCE_STATUS.PENDING]: 0, [OCCURRENCE_STATUS.DONE]: 1, [OCCURRENCE_STATUS.SKIPPED]: 2 }

  return [...occurrences.value].sort((a, b) => (rank[a.status] ?? 3) - (rank[b.status] ?? 3))
})

const isPending = occurrence => occurrence.status === OCCURRENCE_STATUS.PENDING

const statusIcon = (occurrence) => {
  if (occurrence.status === OCCURRENCE_STATUS.DONE) return 'check_circle'
  if (occurrence.status === OCCURRENCE_STATUS.SKIPPED) return 'do_not_disturb_on'

  return 'radio_button_unchecked'
}

function formatTime(value) {
  // `reminderTime` arrive en ISO complet : on n'en garde que l'heure.
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return String(value).slice(11, 16) || String(value)
  }

  return parsed.toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit' })
}

// Le planning est découpé en quarts d'heure : 0 = minuit, 4 = 1 h, 96 = minuit suivant.
function quarterToTime(quarter) {
  const clamped = Math.max(0, Math.min(96, quarter))
  const hours = String(Math.floor(clamped / 4)).padStart(2, '0')
  const minutes = String((clamped % 4) * 15).padStart(2, '0')

  return `${hours}:${minutes}`
}

function isSlotNow(slot) {
  const now = new Date()
  const currentQuarter = now.getHours() * 4 + Math.floor(now.getMinutes() / 15)

  return currentQuarter >= slot.startQuarter && currentQuarter < slot.startQuarter + slot.durationQuarters
}

async function withPending(id, action) {
  const next = new Set(pendingIds.value)
  next.add(id)
  pendingIds.value = next

  try {
    await action()
  } catch {
    toast.error(t('homeView.updateError'))
  } finally {
    const done = new Set(pendingIds.value)
    done.delete(id)
    pendingIds.value = done
  }
}

// Cocher / décocher. Le retour à PENDING est possible depuis le 2026-07-26 côté API : sans lui,
// un clic malencontreux aurait été définitif.
function onToggle(occurrence) {
  const target = isPending(occurrence) ? OCCURRENCE_STATUS.DONE : OCCURRENCE_STATUS.PENDING

  return withPending(occurrence.id, () => occurrencesStore.setStatus(occurrence.id, target))
}

function onSkip(occurrence) {
  return withPending(occurrence.id, () => occurrencesStore.skip(occurrence.id))
}

async function loadOccurrences() {
  occurrencesError.value = false
  try {
    await occurrencesStore.fetchForDate(new Date())
  } catch {
    occurrencesError.value = true
  }
}

async function loadTodaySlots() {
  slotsError.value = false
  slotsLoading.value = true
  try {
    todaySlots.value = await timeSlotsStore.fetchOccurrencesForDate(new Date())
  } catch {
    slotsError.value = true
  } finally {
    slotsLoading.value = false
  }
}

onMounted(() => {
  restoreFocus()
  // Les deux appels sont indépendants : les lancer en parallèle évite d'attendre deux
  // aller-retours à la suite, et une section en erreur n'empêche pas l'autre de s'afficher.
  loadOccurrences()
  loadTodaySlots()
})
</script>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
