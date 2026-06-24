<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <!-- Slot HEADER -->
      <header v-if="$slots.header" class="modal-header mb-4">
        <slot name="header" />
      </header>

      <!-- Slot BODY -->
      <main class="modal-body mb-4">
        <slot name="body" />
      </main>

      <!-- Slot FOOTER -->
      <footer v-if="$slots.footer" class="modal-footer flex justify-end gap-2">
        <slot name="footer" />
      </footer>

      <!-- Bouton par défaut si aucun footer -->
      <button
        v-if="!$slots.footer"
        class="px-4 py-2 bg-gray-300 rounded"
        @click="close"
      >
        Fermer
      </button>
    </div>
  </div>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from 'vue'

const isOpen = ref(false)
const emit = defineEmits(['validate', 'reset'])

function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
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
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  min-width: 400px;
  max-width: 90%;
  max-height: 100svh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}
</style>
