import { computed, ref } from 'vue';
import { BREAK_ACTIONS, useLocalNotifications } from '@/composables/useLocalNotifications.js';
import { useWebNotifications } from '@/composables/useWebNotifications.js';
import { i18n } from '@/plugins/i18n.js';

// Timer de focus (pomodoro) — décision D3 : le mode focus est un état, pas un bloqueur.
// Il ne filtre aucune notification, il affiche un compte à rebours et arme l'alarme de pause.
//
// Trois principes tiennent tout le fichier :
//
// 1. **La source de vérité est `endsAt`, un horodatage absolu**, jamais un compteur qu'on
//    décrémente. Un `setInterval` est suspendu dès que la WebView passe en arrière-plan :
//    un compteur décrémenté aurait dérivé de tout le temps passé hors de l'app. Ici le tick
//    ne sert qu'à rafraîchir l'affichage, et le temps restant est toujours recalculé.
// 2. **C'est Android qui réveille, pas le JavaScript.** L'alarme est planifiée auprès du
//    système au démarrage de la session. Même app fermée, elle sonnera à l'heure.
// 3. **Sur le web, il n'y a pas d'équivalent** : aucune API ne planifie une notification
//    future. Le repli (`useWebNotifications`) sonne depuis l'onglet, qui doit rester ouvert.

const STORAGE_KEY = 'fokus.focusSession';

export const FOCUS_PRESETS = [15, 25, 45, 60];
export const DEFAULT_FOCUS_MINUTES = 25;
export const MIN_FOCUS_MINUTES = 1;
export const MAX_FOCUS_MINUTES = 240;
export const SNOOZE_MINUTES = 10;

export const FOCUS_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  ELAPSED: 'elapsed',
};

// État partagé : le header, l'accueil et l'écran de focus regardent tous la même session.
const status = ref(FOCUS_STATUS.IDLE);
const durationMinutes = ref(DEFAULT_FOCUS_MINUTES);
const endsAt = ref(null);
const startedAt = ref(null);
const remainingWhenPausedMs = ref(0);
const snoozeCount = ref(0);
const now = ref(Date.now());

let tickHandle = null;
let restored = false;
let listenersBound = false;

function persist() {
  if (status.value === FOCUS_STATUS.IDLE) {
    localStorage.removeItem(STORAGE_KEY);

    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    status: status.value,
    durationMinutes: durationMinutes.value,
    endsAt: endsAt.value,
    startedAt: startedAt.value,
    remainingWhenPausedMs: remainingWhenPausedMs.value,
    snoozeCount: snoozeCount.value,
  }));
}

// Le tick reçoit `onTick` plutôt que de se contenter d'avancer l'horloge : c'est lui qui doit
// constater l'échéance quand l'écran est sous les yeux, sinon le compte à rebours afficherait
// 00:00 en restant en état RUNNING jusqu'au prochain passage en arrière-plan.
function startTicking(onTick) {
  if (tickHandle !== null) {
    return;
  }

  tickHandle = setInterval(onTick, 1000);
}

function stopTicking() {
  if (tickHandle === null) {
    return;
  }

  clearInterval(tickHandle);
  tickHandle = null;
}

export function useFocusTimer() {
  const {
    initialize,
    setupListeners,
    onAction,
    scheduleBreakAlarm,
    snoozeBreakAlarm,
    cancelBreakAlarm,
    showFocusRunning,
    cancelFocusRunning,
    isSupported: hasNativeNotifications,
  } = useLocalNotifications();

  const {
    isSupported: hasWebNotifications,
    permission: webPermission,
    isRinging: isWebAlarmRinging,
    unlockAudio,
    requestPermission: requestWebPermission,
    startAlarm: startWebAlarm,
    stopAlarm: stopWebAlarm,
  } = useWebNotifications();

  // Sur mobile, Android tient l'alarme même app fermée : le repli navigateur ferait double
  // emploi. Il ne sert donc que hors app native.
  const usesWebAlarm = !hasNativeNotifications;

  const remainingMs = computed(() => {
    if (status.value === FOCUS_STATUS.PAUSED) {
      return remainingWhenPausedMs.value;
    }
    if (status.value !== FOCUS_STATUS.RUNNING || endsAt.value === null) {
      return 0;
    }

    return Math.max(0, endsAt.value - now.value);
  });

  const remainingSeconds = computed(() => Math.ceil(remainingMs.value / 1000));

  const formattedRemaining = computed(() => {
    const total = remainingSeconds.value;
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    const pad = value => String(value).padStart(2, '0');

    return hours > 0
      ? `${hours}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;
  });

  // 0 → 1, pour l'anneau de progression.
  const progress = computed(() => {
    const totalMs = durationMinutes.value * 60_000;
    if (totalMs === 0) {
      return 0;
    }
    if (status.value === FOCUS_STATUS.ELAPSED) {
      return 1;
    }

    return Math.min(1, Math.max(0, 1 - remainingMs.value / totalMs));
  });

  const isActive = computed(() => status.value === FOCUS_STATUS.RUNNING || status.value === FOCUS_STATUS.PAUSED);
  const isRunning = computed(() => status.value === FOCUS_STATUS.RUNNING);
  const isElapsed = computed(() => status.value === FOCUS_STATUS.ELAPSED);

  const endsAtLabel = computed(() => (
    endsAt.value === null
      ? null
      : new Date(endsAt.value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  ));

  // Une session dont l'heure de fin est dépassée passe `ELAPSED` : c'est ce qui fait qu'au
  // retour dans l'app on tombe sur l'écran « C'est fait / Reporter » et non sur un compte à
  // rebours figé à 00:00.
  function syncElapsed() {
    now.value = Date.now();

    if (status.value === FOCUS_STATUS.RUNNING && endsAt.value !== null && endsAt.value <= now.value) {
      status.value = FOCUS_STATUS.ELAPSED;
      stopTicking();
      persist();
      cancelFocusRunning();

      if (usesWebAlarm) {
        startWebAlarm({
          title: i18n.global.t('localNotifications.break.title'),
          body: i18n.global.t('localNotifications.break.largeBodyWithFocus', { minutes: durationMinutes.value }),
        });
      }
    }
  }

  function bindListeners() {
    if (listenersBound || typeof document === 'undefined') {
      return;
    }

    // Au retour au premier plan, le tick a pu être gelé plusieurs minutes : on resynchronise
    // sur l'horloge plutôt que de faire confiance au compteur.
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        syncElapsed();
      }
    });

    // Les deux boutons de l'alarme doivent faire exactement ce que font les deux boutons de
    // l'écran. L'abonnement est posé ici, et pas seulement dans `initialize()`, parce qu'une
    // action peut arriver au tout premier rendu : app fermée, la personne appuie sur
    // « Reporter », Android relance l'app et délivre l'événement au démarrage.
    setupListeners();
    onAction(({ actionId }) => {
      if (actionId === BREAK_ACTIONS.COMPLETE) {
        completeBreak();

        return;
      }

      if (actionId === BREAK_ACTIONS.SNOOZE) {
        snoozeBreak();
      }
    });

    listenersBound = true;
  }

  // À appeler au montage de tout écran qui affiche le timer : recharge la session en cours
  // après un changement d'écran, un rechargement du web, ou un redémarrage de l'app.
  function restore() {
    bindListeners();

    if (restored) {
      syncElapsed();

      return;
    }
    restored = true;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Aucune session : nettoyer une éventuelle notification « focus en cours » laissée
      // par un arrêt brutal de l'app, sinon elle resterait épinglée indéfiniment.
      cancelFocusRunning();

      return;
    }

    try {
      const saved = JSON.parse(raw);
      status.value = saved.status ?? FOCUS_STATUS.IDLE;
      durationMinutes.value = saved.durationMinutes ?? DEFAULT_FOCUS_MINUTES;
      endsAt.value = saved.endsAt ?? null;
      startedAt.value = saved.startedAt ?? null;
      remainingWhenPausedMs.value = saved.remainingWhenPausedMs ?? 0;
      snoozeCount.value = saved.snoozeCount ?? 0;
    } catch {
      // Entrée illisible (écriture interrompue, bidouille manuelle) : on repart de zéro
      // plutôt que de laisser l'app dans un état à moitié restauré.
      localStorage.removeItem(STORAGE_KEY);
      status.value = FOCUS_STATUS.IDLE;

      return;
    }

    syncElapsed();

    if (status.value === FOCUS_STATUS.RUNNING) {
      startTicking(syncElapsed);
    }
  }

  function clampMinutes(minutes) {
    const parsed = Math.round(Number(minutes));
    if (!Number.isFinite(parsed)) {
      return DEFAULT_FOCUS_MINUTES;
    }

    return Math.min(MAX_FOCUS_MINUTES, Math.max(MIN_FOCUS_MINUTES, parsed));
  }

  async function start(minutes = DEFAULT_FOCUS_MINUTES) {
    const safeMinutes = clampMinutes(minutes);

    // La permission peut avoir été refusée ou révoquée : on demande maintenant, au moment où
    // la personne exprime le besoin — c'est le seul moment où la demande a du sens.
    await initialize();

    if (usesWebAlarm) {
      // Ce `start()` est appelé depuis un clic : c'est l'unique fenêtre où la politique
      // d'autoplay autorise à réveiller le contexte audio. Le faire à l'échéance serait
      // trop tard, l'alarme resterait muette.
      await unlockAudio();
      await requestWebPermission();
    }

    // Une alarme encore en train de sonner n'a plus de raison d'être : on relance une session.
    stopWebAlarm();

    const startTime = Date.now();
    durationMinutes.value = safeMinutes;
    startedAt.value = startTime;
    endsAt.value = startTime + safeMinutes * 60_000;
    remainingWhenPausedMs.value = 0;
    snoozeCount.value = 0;
    status.value = FOCUS_STATUS.RUNNING;
    now.value = startTime;

    persist();
    startTicking(syncElapsed);

    await scheduleBreakAlarm(new Date(endsAt.value), { focusMinutes: safeMinutes });
    await showFocusRunning({ endsAt: new Date(endsAt.value), durationMinutes: safeMinutes });

    return safeMinutes;
  }

  async function pause() {
    if (status.value !== FOCUS_STATUS.RUNNING) {
      return;
    }

    remainingWhenPausedMs.value = remainingMs.value;
    status.value = FOCUS_STATUS.PAUSED;
    stopTicking();
    persist();

    // L'alarme est annulée, sinon elle sonnerait à l'heure initiale pendant la pause.
    stopWebAlarm();
    await cancelBreakAlarm();
    await cancelFocusRunning();
  }

  async function resume() {
    if (status.value !== FOCUS_STATUS.PAUSED) {
      return;
    }

    now.value = Date.now();
    endsAt.value = now.value + remainingWhenPausedMs.value;
    status.value = FOCUS_STATUS.RUNNING;
    persist();
    startTicking(syncElapsed);

    await scheduleBreakAlarm(new Date(endsAt.value), { focusMinutes: durationMinutes.value });
    await showFocusRunning({ endsAt: new Date(endsAt.value), durationMinutes: durationMinutes.value });
  }

  async function reset() {
    status.value = FOCUS_STATUS.IDLE;
    endsAt.value = null;
    startedAt.value = null;
    remainingWhenPausedMs.value = 0;
    snoozeCount.value = 0;
    stopTicking();
    persist();

    stopWebAlarm();
    await cancelBreakAlarm();
    await cancelFocusRunning();
  }

  // « C'est fait » : la pause a été prise, la session est close.
  async function completeBreak() {
    await reset();
  }

  // « Reporter » : l'alarme est reprogrammée, la session reste ouverte pour ne pas perdre
  // le compte des reports.
  async function snoozeBreak(minutes = SNOOZE_MINUTES) {
    snoozeCount.value += 1;
    status.value = FOCUS_STATUS.RUNNING;
    now.value = Date.now();
    endsAt.value = now.value + minutes * 60_000;
    persist();
    startTicking(syncElapsed);

    // Le son doit s'arrêter net : c'est la réponse attendue par l'alarme.
    stopWebAlarm();
    await snoozeBreakAlarm(minutes, snoozeCount.value);

    return minutes;
  }

  return {
    // état
    status,
    durationMinutes,
    snoozeCount,
    isActive,
    isRunning,
    isElapsed,
    remainingMs,
    remainingSeconds,
    formattedRemaining,
    progress,
    endsAtLabel,
    // repli navigateur
    usesWebAlarm,
    hasWebNotifications,
    webPermission,
    isWebAlarmRinging,
    // actions
    restore,
    start,
    pause,
    resume,
    reset,
    completeBreak,
    snoozeBreak,
    stopWebAlarm,
  };
}
