<template>
  <div class="max-w-xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Paramètres</h1>

    <div class="gap-2 mb-6">
      <div class="px-4 py-2 rounded-md my-2 text-lg bg-gray-200 hover:bg-gray-300 font-semibold">Général</div>
      <div class="px-4 py-2 rounded-md my-2 text-lg bg-gray-200 hover:bg-gray-300 font-semibold">Habitude</div>
      <div class="px-4 py-2 rounded-md my-2 text-lg bg-gray-200 hover:bg-gray-300 font-semibold">Thèmes</div>
      <div class="px-4 py-2 rounded-md my-2 text-lg bg-gray-200 hover:bg-gray-300 font-semibold">Sécurité</div>
      <div class="px-4 py-2 rounded-md my-2 text-lg bg-gray-200 hover:bg-gray-300 font-semibold">Rappels</div>
      <div class="px-4 py-2 rounded-md my-2 text-lg bg-gray-200 hover:bg-gray-300 font-semibold">Backup & Export</div>
    </div>
    <!-- Thème -->
    <div class="mb-4">
      <label class="block font-semibold mb-1">Thème</label>
      <select v-model="theme" @change="applyTheme" class="w-full p-2 border rounded">
        <option value="system">Système</option>
        <option value="light">Clair</option>
        <option value="dark">Sombre</option>
      </select>
    </div>

    <!-- Langue -->
    <div class="mb-4">
      <label class="block font-semibold mb-1">Langue</label>
      <select v-model="language" @change="changeLanguage" class="w-full p-2 border rounded">
        <option value="fr">Français</option>
        <option value="en">English</option>
      </select>
    </div>

    <!-- Notifications (placeholder) -->
    <div class="mb-4">
      <label class="block font-semibold mb-1">Notifications</label>
      <p class="text-sm text-gray-500">(Bientôt disponible)</p>
    </div>

    <!-- Bouton -->
    <button
      class="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      @click="saveSettings"
    >
      Sauvegarder
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
// import { useI18n } from 'vue-i18n';

const theme = ref(localStorage.getItem('theme') || 'system')
const language = ref(localStorage.getItem('lang') || 'fr')

// const { locale } = useI18n()

const applyTheme = () => {
  document.documentElement.classList.remove('dark')
  if (theme.value === 'dark') {
    document.documentElement.classList.add('dark')
  } else if (theme.value === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) document.documentElement.classList.add('dark')
  }
  localStorage.setItem('theme', theme.value)
}

const changeLanguage = () => {
  // locale.value = language.value
  // localStorage.setItem('lang', language.value)
}

const saveSettings = () => {
  // Ici tu peux appeler ton API si tu veux stocker côté serveur
  console.log('Paramètres sauvegardés :', {
    theme: theme.value,
    // lang: language.value,
  })
}
</script>
