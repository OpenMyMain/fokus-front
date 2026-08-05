import { ref } from 'vue'

// État partagé de la modale de capture rapide, ouverte depuis le bouton "+" du header
// et montée une seule fois globalement dans AuthLayout.
const isOpen = ref(false)

export function useQuickAdd() {
  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  return { isOpen, open, close }
}
