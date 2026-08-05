import { ref } from 'vue';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { i18n } from '@/plugins/i18n.js';

// Notifications *locales* : planifiées par l'appareil, sans serveur ni compte Firebase
// (décision D5 du ROADMAP). Le POC de /var/www/AGENCE/POC ne fait que du push serveur
// (FCM) : on en reprend la forme — initialize/setupListeners, permissions, listeners —
// mais pas le plugin, qui ne sait pas planifier une alarme à une heure donnée.
// Le push Firebase viendra en plus, pas à la place (T-22 / T-25 étape 2).

// ⚠️ Android ignore toute modification d'un canal déjà créé (importance, son, vibration).
// Changer un de ces réglages impose donc de changer l'identifiant : d'où le suffixe de
// version. Un `-v2` créera un canal neuf ; l'ancien reste visible dans les réglages
// système jusqu'à réinstallation de l'app.
const ALARM_CHANNEL_ID = 'fokus-alarm-v1';
const REMINDER_CHANNEL_ID = 'fokus-reminder-v1';

// Le canal par défaut du plugin (`default`) est le seul à poser AudioAttributes.USAGE_ALARM,
// mais il est créé en IMPORTANCE_DEFAULT — donc sans heads-up. Un canal créé depuis JS peut
// être en importance MAX mais reste en USAGE_NOTIFICATION. Aucun des deux ne donne
// « MAX + USAGE_ALARM » : c'est exactement le trou natif décrit par T-13b. On expose donc
// les deux pour pouvoir les comparer sur un vrai appareil avant d'écrire du Java.
export const CHANNELS = {
  ALARM: ALARM_CHANNEL_ID,
  REMINDER: REMINDER_CHANNEL_ID,
  PLUGIN_DEFAULT: 'default',
};

const BREAK_ACTION_TYPE_ID = 'FOKUS_BREAK';
const HABIT_ACTION_TYPE_ID = 'FOKUS_HABIT';

export const BREAK_ACTIONS = {
  COMPLETE: 'break_complete',
  SNOOZE: 'break_snooze',
};

// La règle métier de T-15 ne prévoit qu'une seule pause PENDING par journée : un identifiant
// fixe suffit, et il rend l'annulation/reprogrammation triviale (un `schedule` sur un id
// déjà planifié le remplace).
const BREAK_NOTIFICATION_ID = 1;
// Notification persistante affichée pendant une session de focus. Même raisonnement :
// une seule session à la fois, donc un id fixe.
const FOCUS_NOTIFICATION_ID = 2;
const RESERVED_IDS = 10;

const isSupported = Capacitor.isNativePlatform();

const permissionGranted = ref(false);
const lastError = ref(null);

let initialized = false;
let listenersReady = false;
const actionHandlers = new Set();

// Le plugin exige un identifiant entier, or les occurrences sont identifiées par UUID côté
// backend. On dérive un entier stable de la chaîne pour pouvoir annuler un rappel plus tard
// sans tenir de table de correspondance. Deux clés distinctes peuvent théoriquement collider ;
// avec quelques dizaines de rappels planifiés à la fois, le risque est négligeable.
export function stableNotificationId(prefix, key) {
  const input = `${prefix}:${key}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }

  return (Math.abs(hash) % 2_000_000_000) + RESERVED_IDS;
}

function t(key, params) {
  return i18n.global.t(`localNotifications.${key}`, params ?? {});
}

async function createChannels() {
  await LocalNotifications.createChannel({
    id: ALARM_CHANNEL_ID,
    name: t('channels.alarm.name'),
    description: t('channels.alarm.description'),
    importance: 5, // MAX — heads-up plein écran réduit, la seule valeur qui interrompt
    visibility: 1, // PUBLIC — lisible sur l'écran verrouillé
    vibration: true,
    lights: true,
  });

  await LocalNotifications.createChannel({
    id: REMINDER_CHANNEL_ID,
    name: t('channels.reminder.name'),
    description: t('channels.reminder.description'),
    importance: 4, // HIGH — visible mais sans prétendre réveiller
    visibility: 1,
    vibration: true,
  });
}

async function registerActionTypes() {
  await LocalNotifications.registerActionTypes({
    types: [
      {
        id: BREAK_ACTION_TYPE_ID,
        actions: [
          { id: BREAK_ACTIONS.COMPLETE, title: t('breakActions.complete') },
          { id: BREAK_ACTIONS.SNOOZE, title: t('breakActions.snooze') },
        ],
      },
      {
        id: HABIT_ACTION_TYPE_ID,
        actions: [
          { id: BREAK_ACTIONS.COMPLETE, title: t('habitActions.complete') },
        ],
      },
    ],
  });
}

export function useLocalNotifications() {
  async function checkPermissions() {
    if (!isSupported) {
      return false;
    }

    try {
      const status = await LocalNotifications.checkPermissions();
      permissionGranted.value = status.display === 'granted';
    } catch (err) {
      lastError.value = err.message;
      permissionGranted.value = false;
    }

    return permissionGranted.value;
  }

  async function requestPermissions() {
    if (!isSupported) {
      return false;
    }

    try {
      const status = await LocalNotifications.requestPermissions();
      permissionGranted.value = status.display === 'granted';
    } catch (err) {
      lastError.value = err.message;
      permissionGranted.value = false;
    }

    return permissionGranted.value;
  }

  // À appeler une fois au démarrage de l'app authentifiée. Idempotent : les canaux et les
  // types d'action peuvent être réenregistrés sans effet de bord.
  async function initialize() {
    if (!isSupported || initialized) {
      return permissionGranted.value;
    }

    try {
      await requestPermissions();
      if (!permissionGranted.value) {
        return false;
      }

      await createChannels();
      await registerActionTypes();
      await setupListeners();
      initialized = true;
    } catch (err) {
      lastError.value = err.message;
      return false;
    }

    return true;
  }

  // ⚠️ App tuée : Android délivre l'action au prochain lancement, ce qui relance l'app pour
  // un simple « Reporter ». Répondre sans ouvrir l'app demandera un BroadcastReceiver natif —
  // même chantier que l'affichage plein écran de T-13b.
  async function setupListeners() {
    if (!isSupported || listenersReady) {
      return;
    }

    await LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
      actionHandlers.forEach(handler => handler(event));
    });

    listenersReady = true;
  }

  function onAction(handler) {
    actionHandlers.add(handler);

    return () => actionHandlers.delete(handler);
  }

  // `at` est une Date absolue : c'est le backend (DayLog.breakIntervalMinutes) qui décide
  // quand, le composable ne fait que poser l'alarme.
  async function scheduleBreakAlarm(at, options = {}) {
    if (!isSupported) {
      return null;
    }

    const { channelId = ALARM_CHANNEL_ID, snoozeCount = 0, focusMinutes = null, extra = {} } = options;

    // `largeBody` et `summaryText` donnent le style BigText d'Android : la notification
    // dépliée affiche une phrase complète au lieu d'une ligne tronquée.
    const largeBody = focusMinutes
      ? t('break.largeBodyWithFocus', { minutes: focusMinutes })
      : t('break.largeBody');

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: BREAK_NOTIFICATION_ID,
            channelId,
            title: t('break.title'),
            body: snoozeCount > 0 ? t('break.bodySnoozed', { count: snoozeCount }) : t('break.body'),
            largeBody,
            summaryText: t('break.summary'),
            actionTypeId: BREAK_ACTION_TYPE_ID,
            // Une alarme ne doit pas disparaître parce qu'on a balayé l'écran de
            // notifications : elle attend une réponse explicite.
            autoCancel: false,
            ongoing: false,
            schedule: {
              at,
              // Sans ce drapeau, le mode Doze repousse l'alarme au prochain réveil du
              // système — une pause annoncée à 10 h 30 pourrait sonner à 11 h.
              allowWhileIdle: true,
            },
            extra: { kind: 'break', snoozeCount, ...extra },
          },
        ],
      });
    } catch (err) {
      lastError.value = err.message;
      return null;
    }

    return BREAK_NOTIFICATION_ID;
  }

  async function cancelBreakAlarm() {
    if (!isSupported) {
      return;
    }

    try {
      await LocalNotifications.cancel({ notifications: [{ id: BREAK_NOTIFICATION_ID }] });
    } catch (err) {
      lastError.value = err.message;
    }
  }

  // Reprogrammation après un « Reporter » : même id, nouvelle heure.
  async function snoozeBreakAlarm(minutes, snoozeCount = 1) {
    const at = new Date(Date.now() + minutes * 60_000);

    return scheduleBreakAlarm(at, { snoozeCount });
  }

  // Notification persistante pendant le focus : elle rappelle l'heure de fin sans faire de
  // bruit. `ongoing` la rend non balayable, pour qu'un focus en cours reste visible.
  async function showFocusRunning({ endsAt, durationMinutes }) {
    if (!isSupported) {
      return;
    }

    const endsAtLabel = endsAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: FOCUS_NOTIFICATION_ID,
            channelId: REMINDER_CHANNEL_ID,
            title: t('focus.title', { minutes: durationMinutes }),
            body: t('focus.body', { time: endsAtLabel }),
            silent: true,
            ongoing: true,
            autoCancel: false,
            extra: { kind: 'focus' },
          },
        ],
      });
    } catch (err) {
      lastError.value = err.message;
    }
  }

  async function cancelFocusRunning() {
    if (!isSupported) {
      return;
    }

    try {
      await LocalNotifications.cancel({ notifications: [{ id: FOCUS_NOTIFICATION_ID }] });
    } catch (err) {
      lastError.value = err.message;
    }
  }

  async function scheduleHabitReminder({ id, title, at, body = null }) {
    if (!isSupported) {
      return null;
    }

    const notificationId = stableNotificationId('habit', id);

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId,
            channelId: REMINDER_CHANNEL_ID,
            title,
            body: body ?? t('habit.body'),
            actionTypeId: HABIT_ACTION_TYPE_ID,
            autoCancel: true,
            schedule: { at, allowWhileIdle: true },
            extra: { kind: 'habit', habitOccurrenceId: id },
          },
        ],
      });
    } catch (err) {
      lastError.value = err.message;
      return null;
    }

    return notificationId;
  }

  async function cancelHabitReminder(id) {
    if (!isSupported) {
      return;
    }

    try {
      await LocalNotifications.cancel({
        notifications: [{ id: stableNotificationId('habit', id) }],
      });
    } catch (err) {
      lastError.value = err.message;
    }
  }

  async function listPending() {
    if (!isSupported) {
      return [];
    }

    try {
      const result = await LocalNotifications.getPending();

      return result.notifications ?? [];
    } catch (err) {
      lastError.value = err.message;

      return [];
    }
  }

  // Au logout : ne laisser aucune alarme derrière soi, elles ne concernent plus personne.
  async function cancelAll() {
    const pending = await listPending();
    if (pending.length === 0) {
      return;
    }

    try {
      await LocalNotifications.cancel({
        notifications: pending.map(({ id }) => ({ id })),
      });
    } catch (err) {
      lastError.value = err.message;
    }
  }

  return {
    isSupported,
    permissionGranted,
    lastError,
    initialize,
    checkPermissions,
    requestPermissions,
    setupListeners,
    onAction,
    scheduleBreakAlarm,
    snoozeBreakAlarm,
    cancelBreakAlarm,
    showFocusRunning,
    cancelFocusRunning,
    scheduleHabitReminder,
    cancelHabitReminder,
    listPending,
    cancelAll,
  };
}
