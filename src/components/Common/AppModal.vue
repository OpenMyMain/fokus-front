<template>
  <Teleport v-if="isOpen" to="body">
    <Transition name="modal">
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="close">
        <div class="glass-card rounded-xl p-4 md:p-6 w-full sm:w-96 space-y-4">
          <!-- Slot HEADER -->
          <header v-if="$slots.header" class="modal-header font-headline-sm text-on-surface dark:text-slate-100">
            <slot name="header" />
          </header>

          <!-- Slot BODY -->
          <main class="modal-body">
            <slot name="body" />
          </main>

          <!-- Slot FOOTER -->
          <footer v-if="$slots.footer" class="modal-footer flex justify-end gap-2">
            <slot name="footer" />
          </footer>

          <!-- Bouton par défaut si aucun footer -->
          <button
            v-if="!$slots.footer"
            @click="close"
            class="w-full px-4 py-2 rounded-lg font-label-md text-label-md border border-outline-variant dark:border-slate-600 text-on-surface dark:text-slate-100 hover:bg-surface-container transition-colors"
          >
            {{ t('common.close') }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from 'vue'
import {useI18n} from 'vue-i18n'

const {t} = useI18n()
const isOpen = ref(false)
// `close` est émis à *chaque* fermeture, quelle qu'en soit la cause (croix implicite via
// le clic sur le fond, Échap, bouton du footer). Sans lui, un parent qui pilote la modale
// depuis son propre état — `AppConfirmModal` et sa promesse — ne saurait pas qu'elle s'est
// refermée par un clic sur le fond, et resterait désynchronisé.
const emit = defineEmits(['validate', 'reset', 'close'])

function open() {
  isOpen.value = true
}

function close() {
  if (!isOpen.value) return

  isOpen.value = false
  emit('close')
}
function handleKeydown(event) {
  if (event.key === 'Escape' && isOpen.value) {
    emit('reset');
    close();
  }
  if (event.key === 'Enter' && isOpen.value) {
    // Émettre un événement de validation lorsque la touche "Entrée" est pressée
    // L'événement peut être capturé par le composant parent
    emit('validate')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
});

defineExpose({ open, close })
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-header h2 {
  margin: 0;
}
</style>
