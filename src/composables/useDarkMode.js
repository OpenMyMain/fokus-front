import { ref, watch, onMounted } from 'vue'

const isDark = ref(false)

export function useDarkMode() {
  const loadDarkMode = () => {
    // Vérifier la préférence sauvegardée
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      isDark.value = JSON.parse(saved)
    } else {
      // Vérifier la préférence système
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyDarkMode()
  }

  const applyDarkMode = () => {
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('dark')
      html.setAttribute('data-theme', 'dark')
    } else {
      html.classList.remove('dark')
      html.setAttribute('data-theme', 'light')
    }
    localStorage.setItem('darkMode', JSON.stringify(isDark.value))
  }

  const toggleDarkMode = () => {
    isDark.value = !isDark.value
  }

  // Watcher pour appliquer les changements
  watch(isDark, applyDarkMode)

  return {
    isDark,
    loadDarkMode,
    toggleDarkMode,
    applyDarkMode,
  }
}
