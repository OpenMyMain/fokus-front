import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { Capacitor } from "@capacitor/core";

import App from './App.vue'
import router from './router'
import { i18n } from './plugins/i18n.js'

const app = createApp(App)

if (Capacitor.isNativePlatform()) {
  // on importe dynamiquement pour éviter d’inclure le module natif dans le bundle web
  import('@capacitor/status-bar').then(async ({ StatusBar }) => {
    try {
      await StatusBar.hide()
    } catch (err) {
      console.warn('Impossible de cacher la status bar:', err)
    }
  })
}

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
