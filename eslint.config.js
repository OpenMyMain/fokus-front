import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
  },

  // `android/` est un projet Capacitor généré : il embarque une copie buildée de `dist/`
  // (donc du code déjà linté, mais figé à la dernière synchro) et le `native-bridge.js`
  // de Capacitor. Le linter n'a rien à y dire.
  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', 'android/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  {
    name: 'app/no-native-dialogs',
    rules: {
      // Les dialogues natifs s'affichent sur Android dans une popup système intitulée
      // « localhost » (F-11). Utiliser useConfirm() / useToast() / AppModal à la place.
      // Le `confirm` de useConfirm() est une variable locale : la règle ne le vise pas.
      'no-alert': 'error',
    },
  },
])
