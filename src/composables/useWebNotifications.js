import { ref } from 'vue';

// Repli navigateur de l'alarme de pause. Ce n'est pas l'équivalent d'Android, et ça ne peut
// pas l'être :
//
// - il n'existe **aucune** API pour planifier une notification à une heure future dans le
//   navigateur. La proposition `Notification Triggers` (`showTrigger` / `TimestampTrigger`)
//   a été expérimentée par Chrome puis abandonnée, jamais standardisée. Une notification web
//   sans onglet ouvert impose donc un serveur de Web Push (T-22 / T-23) ;
// - les notifications web n'ont ni son personnalisable (le champ `sound` a été retiré des
//   specs) ni contournement du mode silencieux.
//
// D'où ce choix : la notification sert à l'affichage, et c'est **Web Audio** qui fait le
// bruit. Pour quelqu'un assis devant son écran, un son en boucle est plus efficace qu'une
// notification muette. L'onglet doit rester ouvert (arrière-plan accepté, fermé non).

const BEEP_FREQUENCY_HZ = 880;
const BEEP_DURATION_S = 0.18;
const BEEP_GAP_S = 0.12;
const PATTERN_INTERVAL_MS = 1400;
const BEEP_GAIN = 0.12;
// Garde-fou : personne devant l'écran, on ne sonne pas indéfiniment.
const MAX_RINGING_MS = 2 * 60 * 1000;
const NOTIFICATION_TAG = 'fokus-break';

const isSupported = typeof window !== 'undefined' && 'Notification' in window;
const canPlaySound = typeof window !== 'undefined'
  && (typeof window.AudioContext !== 'undefined' || typeof window.webkitAudioContext !== 'undefined');

const permission = ref(isSupported ? Notification.permission : 'unsupported');
const isRinging = ref(false);

let audioContext = null;
let patternHandle = null;
let stopHandle = null;
let activeNotification = null;

function getAudioContext() {
  if (!canPlaySound) {
    return null;
  }

  if (audioContext === null) {
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    audioContext = new AudioContextClass();
  }

  return audioContext;
}

function scheduleBeep(context, startAt) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'square';
  oscillator.frequency.value = BEEP_FREQUENCY_HZ;

  // Rampes très courtes en début et fin : sans elles, la coupure nette du signal produit un
  // clic audible désagréable.
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(BEEP_GAIN, startAt + 0.01);
  gain.gain.setValueAtTime(BEEP_GAIN, startAt + BEEP_DURATION_S - 0.01);
  gain.gain.linearRampToValueAtTime(0, startAt + BEEP_DURATION_S);

  oscillator.connect(gain).connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + BEEP_DURATION_S);
}

// Deux bips rapprochés, répétés : le motif classique d'un réveil, plus reconnaissable qu'un
// bip continu.
function playPattern() {
  const context = getAudioContext();
  if (context === null) {
    return;
  }

  const start = context.currentTime;
  scheduleBeep(context, start);
  scheduleBeep(context, start + BEEP_DURATION_S + BEEP_GAP_S);
}

export function useWebNotifications() {
  // À appeler sur un geste utilisateur (le clic « Démarrer » du focus). La politique
  // d'autoplay interdit de créer ou reprendre un contexte audio autrement : sans cet appel,
  // l'alarme resterait muette à l'échéance.
  async function unlockAudio() {
    const context = getAudioContext();
    if (context === null) {
      return false;
    }

    if (context.state === 'suspended') {
      try {
        await context.resume();
      } catch {
        return false;
      }
    }

    return context.state === 'running';
  }

  async function requestPermission() {
    if (!isSupported) {
      return false;
    }

    if (Notification.permission === 'granted') {
      permission.value = 'granted';

      return true;
    }

    // Un refus est définitif jusqu'à ce que la personne le change dans les réglages du
    // navigateur : redemander ne ferait qu'échouer silencieusement.
    if (Notification.permission === 'denied') {
      permission.value = 'denied';

      return false;
    }

    try {
      permission.value = await Notification.requestPermission();
    } catch {
      return false;
    }

    return permission.value === 'granted';
  }

  function showNotification({ title, body }) {
    if (!isSupported || Notification.permission !== 'granted') {
      return;
    }

    try {
      // `requireInteraction` garde la notification affichée jusqu'à une réponse au lieu de la
      // faire disparaître au bout de quelques secondes (respecté sur Chrome desktop).
      // `silent` coupe le son du système : c'est Web Audio qui s'en charge, sinon les deux
      // se superposent.
      activeNotification = new Notification(title, {
        body,
        tag: NOTIFICATION_TAG,
        requireInteraction: true,
        silent: true,
      });

      activeNotification.onclick = () => {
        window.focus();
        activeNotification?.close();
      };
    } catch {
      // Certains navigateurs interdisent le constructeur `Notification` hors service worker
      // (Chrome Android, notamment). L'alarme sonore reste, elle, opérationnelle.
      activeNotification = null;
    }
  }

  function stopAlarm() {
    if (patternHandle !== null) {
      clearInterval(patternHandle);
      patternHandle = null;
    }

    if (stopHandle !== null) {
      clearTimeout(stopHandle);
      stopHandle = null;
    }

    if (activeNotification !== null) {
      activeNotification.close();
      activeNotification = null;
    }

    isRinging.value = false;
  }

  function startAlarm({ title, body }) {
    // Une alarme déjà en cours ne doit pas se dédoubler (deux motifs décalés = cacophonie).
    stopAlarm();

    showNotification({ title, body });

    if (canPlaySound) {
      const context = getAudioContext();
      // Le contexte a pu être suspendu pendant la session : on tente de le relancer, sans
      // attendre — un `await` retarderait le premier bip.
      if (context?.state === 'suspended') {
        context.resume().catch(() => {});
      }

      playPattern();
      patternHandle = setInterval(playPattern, PATTERN_INTERVAL_MS);
      stopHandle = setTimeout(stopAlarm, MAX_RINGING_MS);
    }

    isRinging.value = true;
  }

  return {
    isSupported,
    canPlaySound,
    permission,
    isRinging,
    unlockAudio,
    requestPermission,
    startAlarm,
    stopAlarm,
  };
}
