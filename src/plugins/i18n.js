import {createI18n} from 'vue-i18n';

export const SUPPORTED_LOCALES = ['fr', 'en'];
const DEFAULT_LOCALE = 'fr';
const STORAGE_KEY = 'locale';

// Chaque vue/composant a son propre fichier de traduction sous locales/{locale}/...
// (mêmes chemins que src/views et src/components). Ajouter une traduction ne demande
// donc jamais de toucher ce fichier : il suffit de déposer le nouveau json au bon
// endroit, `import.meta.glob` le ramasse automatiquement au build suivant.
const frModules = import.meta.glob('../locales/fr/**/*.json', {eager: true});
const enModules = import.meta.glob('../locales/en/**/*.json', {eager: true});

function mergeMessages(modules) {
  return Object.values(modules).reduce((acc, mod) => ({...acc, ...(mod.default ?? mod)}), {});
}

function detectLocale() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (SUPPORTED_LOCALES.includes(saved)) {
    return saved;
  }

  const browserLocale = navigator.language?.slice(0, 2);
  return SUPPORTED_LOCALES.includes(browserLocale) ? browserLocale : DEFAULT_LOCALE;
}

export const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    fr: mergeMessages(frModules),
    en: mergeMessages(enModules),
  },
});

document.documentElement.setAttribute('lang', i18n.global.locale.value);

export function setLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) return;
  i18n.global.locale.value = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.setAttribute('lang', locale);
}

export function getLocale() {
  return i18n.global.locale.value;
}
