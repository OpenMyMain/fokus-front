<template>
  <div class="p-4 space-y-4">
    <section class="p-4 rounded-lg border border-outline-variant dark:border-slate-600 bg-surface dark:bg-slate-800 shadow-sm">
      <h2 class="font-headline-md text-headline-md text-on-surface dark:text-slate-100 mb-1">
        {{ t('notificationLabView.title') }}
      </h2>
      <p class="font-body-md text-body-md text-outline dark:text-slate-400">
        {{ t('notificationLabView.subtitle') }}
      </p>

      <p v-if="!isSupported"
         class="mt-4 p-3 rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm">
        {{ t('notificationLabView.webWarning') }}
      </p>
    </section>

    <!-- Statut -->
    <section class="p-4 rounded-lg border border-outline-variant dark:border-slate-600 bg-surface dark:bg-slate-800 shadow-sm">
      <h3 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100 mb-3">
        {{ t('notificationLabView.statusTitle') }}
      </h3>

      <dl class="space-y-2 font-body-sm text-body-sm">
        <div class="flex justify-between gap-4">
          <dt class="text-outline dark:text-slate-400">{{ t('notificationLabView.platform') }}</dt>
          <dd class="text-on-surface dark:text-slate-100">{{ platform }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-outline dark:text-slate-400">{{ t('notificationLabView.permission') }}</dt>
          <dd :class="permissionGranted ? 'text-primary dark:text-blue-300' : 'text-error dark:text-red-400'">
            {{ permissionGranted ? t('notificationLabView.granted') : t('notificationLabView.denied') }}
          </dd>
        </div>
        <div v-if="lastError" class="flex justify-between gap-4">
          <dt class="text-outline dark:text-slate-400">{{ t('notificationLabView.lastError') }}</dt>
          <dd class="text-error dark:text-red-400 text-right">{{ lastError }}</dd>
        </div>
      </dl>

      <button type="button" class="px-4 py-2 rounded-lg font-label-md text-label-md text-white bg-primary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-4" :disabled="!isSupported" @click="onInitialize">
        {{ t('notificationLabView.initialize') }}
      </button>
    </section>

    <!-- Planification -->
    <section class="p-4 rounded-lg border border-outline-variant dark:border-slate-600 bg-surface dark:bg-slate-800 shadow-sm">
      <h3 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100 mb-3">
        {{ t('notificationLabView.scheduleTitle') }}
      </h3>

      <div class="space-y-3">
        <AppSelect v-model="channelId" :label="t('notificationLabView.channelLabel')" :options="channelOptions"/>
        <AppInput v-model="delaySeconds" type="number" :label="t('notificationLabView.delayLabel')"/>
      </div>

      <p class="mt-3 font-body-sm text-body-sm text-outline dark:text-slate-400">{{ channelHint }}</p>

      <div class="mt-4 flex flex-wrap gap-2">
        <button type="button" class="px-4 py-2 rounded-lg font-label-md text-label-md text-white bg-primary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!isSupported" @click="onSchedule">
          {{ t('notificationLabView.schedule') }}
        </button>
        <button type="button" class="px-4 py-2 rounded-lg font-label-md text-label-md text-primary dark:text-blue-300 border border-primary dark:border-blue-600 hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!isSupported" @click="onRefreshPending">
          {{ t('notificationLabView.refreshPending') }}
        </button>
        <button type="button" class="px-4 py-2 rounded-lg font-label-md text-label-md text-primary dark:text-blue-300 border border-primary dark:border-blue-600 hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!isSupported" @click="onCancel">
          {{ t('notificationLabView.cancel') }}
        </button>
      </div>
    </section>

    <!-- En attente -->
    <section class="p-4 rounded-lg border border-outline-variant dark:border-slate-600 bg-surface dark:bg-slate-800 shadow-sm">
      <h3 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100 mb-3">
        {{ t('notificationLabView.pendingTitle', { count: pending.length }) }}
      </h3>

      <p v-if="pending.length === 0" class="font-body-sm text-body-sm text-outline dark:text-slate-400">
        {{ t('notificationLabView.pendingEmpty') }}
      </p>
      <ul v-else class="space-y-2 font-body-sm text-body-sm">
        <li v-for="notification in pending" :key="notification.id"
            class="p-2 rounded-lg bg-surface-container dark:bg-slate-950">
          <span class="text-on-surface dark:text-slate-100">#{{ notification.id }} — {{ notification.title }}</span>
          <span v-if="notification.schedule?.at" class="block text-outline dark:text-slate-400">
            {{ notification.schedule.at }}
          </span>
        </li>
      </ul>
    </section>

    <!-- Journal des actions : c'est lui qui prouve que « C'est fait » / « Reporter » remontent -->
    <section class="p-4 rounded-lg border border-outline-variant dark:border-slate-600 bg-surface dark:bg-slate-800 shadow-sm">
      <h3 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100 mb-3">
        {{ t('notificationLabView.logTitle') }}
      </h3>

      <p v-if="log.length === 0" class="font-body-sm text-body-sm text-outline dark:text-slate-400">
        {{ t('notificationLabView.logEmpty') }}
      </p>
      <ul v-else class="space-y-1">
        <li v-for="(entry, index) in log" :key="index"
            class="font-mono text-body-sm text-on-surface dark:text-slate-100 break-all">
          {{ entry }}
        </li>
      </ul>
    </section>

    <!-- Protocole : sans ces quatre conditions, un « ça sonne » ne prouve rien -->
    <section class="p-4 rounded-lg border border-outline-variant dark:border-slate-600 bg-surface dark:bg-slate-800 shadow-sm">
      <h3 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100 mb-3">
        {{ t('notificationLabView.protocolTitle') }}
      </h3>
      <ol class="list-decimal list-inside space-y-1 font-body-sm text-body-sm text-outline dark:text-slate-400">
        <li>{{ t('notificationLabView.protocol.locked') }}</li>
        <li>{{ t('notificationLabView.protocol.silent') }}</li>
        <li>{{ t('notificationLabView.protocol.killed') }}</li>
        <li>{{ t('notificationLabView.protocol.doze') }}</li>
      </ol>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Capacitor } from '@capacitor/core';
import AppInput from '@/components/Common/Form/AppInput.vue';
import AppSelect from '@/components/Common/Form/AppSelect.vue';
import { BREAK_ACTIONS, CHANNELS, useLocalNotifications } from '@/composables/useLocalNotifications.js';
import { useToast } from '@/composables/useToast.js';

// Banc d'essai de T-13b : l'alarme native est le seul point techniquement risqué de la V1.
// Le but n'est pas de faire un bel écran, c'est de savoir lequel des canaux disponibles
// réveille vraiment, sur un vrai téléphone, avant de construire la Phase 2 par-dessus.

const { t } = useI18n();
const toast = useToast();
const {
  isSupported,
  permissionGranted,
  lastError,
  initialize,
  checkPermissions,
  onAction,
  scheduleBreakAlarm,
  cancelBreakAlarm,
  listPending,
} = useLocalNotifications();

const platform = Capacitor.getPlatform();
const channelId = ref(CHANNELS.ALARM);
const delaySeconds = ref(30);
const pending = ref([]);
const log = ref([]);

let unsubscribe = null;

const channelOptions = computed(() => [
  { value: CHANNELS.ALARM, label: t('notificationLabView.channels.alarm') },
  { value: CHANNELS.PLUGIN_DEFAULT, label: t('notificationLabView.channels.pluginDefault') },
  { value: CHANNELS.REMINDER, label: t('notificationLabView.channels.reminder') },
]);

const channelHint = computed(() => {
  if (channelId.value === CHANNELS.ALARM) {
    return t('notificationLabView.hints.alarm');
  }
  if (channelId.value === CHANNELS.PLUGIN_DEFAULT) {
    return t('notificationLabView.hints.pluginDefault');
  }

  return t('notificationLabView.hints.reminder');
});

function addLog(message) {
  // Heure locale : c'est l'écart avec l'heure planifiée qui dira si l'alarme a dérivé.
  log.value.unshift(`${new Date().toLocaleTimeString()} — ${message}`);
}

async function onInitialize() {
  const granted = await initialize();
  addLog(granted
    ? 'initialize() → permission accordée, canaux créés'
    : `initialize() → refusé (${lastError.value ?? 'permission refusée'})`);
  await onRefreshPending();
}

async function onSchedule() {
  const seconds = Number(delaySeconds.value) || 30;
  const at = new Date(Date.now() + seconds * 1000);

  const id = await scheduleBreakAlarm(at, { channelId: channelId.value });
  if (id === null) {
    toast.error(lastError.value ?? t('notificationLabView.scheduleFailed'));
    addLog(`schedule() → échec : ${lastError.value}`);

    return;
  }

  addLog(`schedule() → #${id} sur « ${channelId.value} » à ${at.toLocaleTimeString()}`);
  toast.success(t('notificationLabView.scheduled', { time: at.toLocaleTimeString() }));
  await onRefreshPending();
}

async function onCancel() {
  await cancelBreakAlarm();
  addLog('cancel() → alarme de pause annulée');
  await onRefreshPending();
}

async function onRefreshPending() {
  pending.value = await listPending();
}

onMounted(async () => {
  await checkPermissions();
  await onRefreshPending();

  unsubscribe = onAction(({ actionId, notification }) => {
    // `tap` est l'identifiant que le plugin donne au clic sur le corps de la notification.
    const labels = {
      [BREAK_ACTIONS.COMPLETE]: t('notificationLabView.actions.complete'),
      [BREAK_ACTIONS.SNOOZE]: t('notificationLabView.actions.snooze'),
      tap: t('notificationLabView.actions.tap'),
    };

    addLog(`${labels[actionId] ?? t('notificationLabView.actions.unknown', { actionId })} → #${notification.id}`);
    onRefreshPending();
  });
});

onUnmounted(() => {
  unsubscribe?.();
});
</script>

