<template>
  <main class="max-w-xl mx-auto py-lg space-y-lg">
    <div class="space-y-1">
      <h1 class="font-headline-md text-headline-md md:font-display-lg md:text-display-lg text-on-surface dark:text-slate-100">
        {{ t('focusView.title') }}
      </h1>
      <p class="font-body-lg text-body-lg text-outline dark:text-slate-400">
        {{ t('focusView.subtitle') }}
      </p>
    </div>

    <!-- Choix de la durée -->
    <section v-if="!isActive && !isElapsed" class="glass-card rounded-xl p-4 md:p-6 space-y-4">
      <h2 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100">
        {{ t('focusView.durationTitle') }}
      </h2>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          v-for="preset in FOCUS_PRESETS"
          :key="preset"
          type="button"
          class="flex flex-col items-center justify-center py-4 rounded-xl border transition-colors"
          :class="selectedMinutes === preset
            ? 'border-primary bg-primary text-white'
            : 'border-outline-variant dark:border-slate-600 text-on-surface dark:text-slate-100 hover:bg-surface-container-low dark:hover:bg-slate-800/60'"
          @click="selectPreset(preset)"
        >
          <span class="font-headline-sm text-headline-sm">{{ preset }}</span>
          <span class="font-label-md text-label-md opacity-80">{{ t('focusView.minutesShort') }}</span>
        </button>
      </div>

      <div class="flex items-end gap-2">
        <div class="flex-1">
          <AppInput
            v-model="customMinutes"
            type="number"
            :label="t('focusView.customLabel')"
            :placeholder="String(DEFAULT_FOCUS_MINUTES)"
          />
        </div>
        <button
          type="button"
          class="px-4 py-2 rounded-lg font-label-md text-label-md text-primary dark:text-blue-300 border border-primary dark:border-blue-600 hover:bg-primary-container/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!isCustomValid"
          @click="applyCustom"
        >
          {{ t('focusView.useCustom') }}
        </button>
      </div>
      <p v-if="customMinutes !== '' && !isCustomValid" class="font-body-sm text-body-sm text-error dark:text-red-400">
        {{ t('focusView.customInvalid', { min: MIN_FOCUS_MINUTES, max: MAX_FOCUS_MINUTES }) }}
      </p>

      <button
        type="button"
        class="w-full flex items-center justify-center gap-2 py-3 rounded-xl accent-gradient text-white font-label-md text-label-md shadow-lg hover:opacity-90 transition-opacity"
        @click="onStart"
      >
        <span class="material-symbols-outlined text-[20px]">play_arrow</span>
        {{ t('focusView.start', { minutes: selectedMinutes }) }}
      </button>

      <p v-if="usesWebAlarm" class="font-body-sm text-body-sm text-outline dark:text-slate-400">
        {{ t('focusView.webNotice') }}
      </p>
      <p v-if="usesWebAlarm && webPermission === 'denied'" class="font-body-sm text-body-sm text-error dark:text-red-400">
        {{ t('focusView.webPermissionDenied') }}
      </p>
    </section>

    <!-- Session en cours -->
    <section v-else class="glass-card rounded-xl p-4 md:p-6 space-y-6">
      <div class="flex flex-col items-center gap-2">
        <div class="relative w-56 h-56">
          <svg class="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100" cy="100" :r="RING_RADIUS"
              fill="none" stroke-width="12"
              class="stroke-surface-container dark:stroke-slate-700"
            />
            <circle
              cx="100" cy="100" :r="RING_RADIUS"
              fill="none" stroke-width="12" stroke-linecap="round"
              :class="isElapsed ? 'stroke-error dark:stroke-red-400' : 'stroke-primary dark:stroke-blue-400'"
              :stroke-dasharray="RING_CIRCUMFERENCE"
              :stroke-dashoffset="RING_CIRCUMFERENCE * (1 - progress)"
              class="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>

          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <p v-if="isElapsed" class="font-headline-md text-headline-md text-error dark:text-red-400">
              {{ t('focusView.elapsedTitle') }}
            </p>
            <template v-else>
              <p class="font-display-lg text-display-lg tabular-nums text-on-surface dark:text-slate-100">
                {{ formattedRemaining }}
              </p>
              <p class="font-label-md text-label-md text-outline dark:text-slate-400">
                {{ isRunning ? t('focusView.endsAt', { time: endsAtLabel }) : t('focusView.paused') }}
              </p>
            </template>
          </div>
        </div>

        <p v-if="snoozeCount > 0" class="font-body-sm text-body-sm text-outline dark:text-slate-400">
          {{ t('focusView.snoozedCount', snoozeCount) }}
        </p>
      </div>

      <!-- Fin de session : les deux seules réponses possibles (décision D2) -->
      <div v-if="isElapsed" class="space-y-3">
        <button
          v-if="isWebAlarmRinging"
          type="button"
          class="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-outline-variant dark:border-slate-600 text-on-surface dark:text-slate-100 font-label-md text-label-md hover:bg-surface-container transition-colors"
          @click="stopWebAlarm"
        >
          <span class="material-symbols-outlined text-[20px]">volume_off</span>
          {{ t('focusView.muteAlarm') }}
        </button>
        <p class="font-body-md text-body-md text-on-surface dark:text-slate-100 text-center">
          {{ t('focusView.elapsedHint') }}
        </p>
        <div class="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl accent-gradient text-white font-label-md text-label-md shadow-lg hover:opacity-90 transition-opacity"
            @click="onComplete"
          >
            <span class="material-symbols-outlined text-[20px]">check_circle</span>
            {{ t('focusView.breakDone') }}
          </button>
          <button
            type="button"
            class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-primary dark:border-blue-600 text-primary dark:text-blue-300 font-label-md text-label-md hover:bg-primary-container/30 transition-colors"
            @click="onSnooze"
          >
            <span class="material-symbols-outlined text-[20px]">snooze</span>
            {{ t('focusView.breakSnooze', { minutes: SNOOZE_MINUTES }) }}
          </button>
        </div>
      </div>

      <!-- Session active : pause / reprise / arrêt -->
      <div v-else class="flex flex-col sm:flex-row gap-2">
        <button
          v-if="isRunning"
          type="button"
          class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-primary dark:border-blue-600 text-primary dark:text-blue-300 font-label-md text-label-md hover:bg-primary-container/30 transition-colors"
          @click="pause"
        >
          <span class="material-symbols-outlined text-[20px]">pause</span>
          {{ t('focusView.pause') }}
        </button>
        <button
          v-else
          type="button"
          class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl accent-gradient text-white font-label-md text-label-md shadow-lg hover:opacity-90 transition-opacity"
          @click="resume"
        >
          <span class="material-symbols-outlined text-[20px]">play_arrow</span>
          {{ t('focusView.resume') }}
        </button>

        <button
          type="button"
          class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-error dark:border-red-900 text-error dark:text-red-400 font-label-md text-label-md hover:bg-error-container/40 transition-colors"
          @click="onStop"
        >
          <span class="material-symbols-outlined text-[20px]">stop</span>
          {{ t('focusView.stop') }}
        </button>
      </div>
    </section>

  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import AppInput from '@/components/Common/Form/AppInput.vue';
import { useToast } from '@/composables/useToast.js';
import { useConfirm } from '@/composables/useConfirm.js';
import {
  DEFAULT_FOCUS_MINUTES,
  FOCUS_PRESETS,
  MAX_FOCUS_MINUTES,
  MIN_FOCUS_MINUTES,
  SNOOZE_MINUTES,
  useFocusTimer,
} from '@/composables/useFocusTimer.js';

const { t } = useI18n();
const toast = useToast();
const { confirm } = useConfirm();
const {
  isActive,
  isRunning,
  isElapsed,
  formattedRemaining,
  progress,
  endsAtLabel,
  snoozeCount,
  usesWebAlarm,
  webPermission,
  isWebAlarmRinging,
  restore,
  start,
  pause,
  resume,
  reset,
  completeBreak,
  snoozeBreak,
  stopWebAlarm,
} = useFocusTimer();

const RING_RADIUS = 88;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const selectedMinutes = ref(DEFAULT_FOCUS_MINUTES);
const customMinutes = ref('');

const isCustomValid = computed(() => {
  const value = Number(customMinutes.value);

  return Number.isInteger(value) && value >= MIN_FOCUS_MINUTES && value <= MAX_FOCUS_MINUTES;
});

function selectPreset(minutes) {
  selectedMinutes.value = minutes;
  customMinutes.value = '';
}

function applyCustom() {
  if (!isCustomValid.value) {
    return;
  }

  selectedMinutes.value = Number(customMinutes.value);
}

async function onStart() {
  // Si un temps personnalisé valide est saisi mais pas encore appliqué, on le prend :
  // taper « 30 » puis « Démarrer » doit lancer 30 minutes, pas le preset resté sélectionné.
  if (isCustomValid.value) {
    selectedMinutes.value = Number(customMinutes.value);
  }

  const minutes = await start(selectedMinutes.value);
  toast.success(t('focusView.started', { minutes }));
}

async function onStop() {
  const confirmed = await confirm({
    title: t('focusView.confirmStopTitle'),
    body: t('focusView.confirmStopBody'),
    confirmLabel: t('focusView.confirmStopConfirm'),
    cancelLabel: t('focusView.confirmStopCancel'),
    danger: true,
  });

  if (!confirmed) {
    return;
  }

  await reset();
  toast.info(t('focusView.stopped'));
}

async function onComplete() {
  await completeBreak();
  toast.success(t('focusView.breakDoneToast'));
}

async function onSnooze() {
  const minutes = await snoozeBreak();
  toast.info(t('focusView.breakSnoozedToast', { minutes }));
}

onMounted(() => {
  restore();
});
</script>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
