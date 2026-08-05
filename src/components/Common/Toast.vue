<template>
  <Transition
    name="toast"
    @enter="onEnter"
    @leave="onLeave"
  >
    <div
      v-if="visible"
      class="w-full md:w-96 px-4 py-3 rounded-lg shadow-lg flex flex-row items-start gap-3 pointer-events-auto"
      :class="colorClasses"
      role="alert"
      :aria-live="type === 'error' ? 'assertive' : 'polite'"
    >
      <!-- Icon -->
      <span class="material-symbols-outlined flex-shrink-0 text-xl mt-0.5">
        {{ icon }}
      </span>

      <!-- Message -->
      <div class="flex-1">
        <p class="font-body-sm text-body-sm break-words">{{ message }}</p>
      </div>

      <!-- Close Button -->
      <button
        @click="visible = false"
        class="flex-shrink-0 p-0.5 hover:opacity-70 transition-opacity rounded"
        :aria-label="t('common.close')"
      >
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['success', 'error', 'info', 'warning'],
    default: 'info',
  },
})

const emit = defineEmits(['close'])

const visible = ref(true)

const colorClasses = computed(() => {
  const classes = {
    success: 'bg-primary-container text-on-primary-container',
    error: 'bg-error-container text-on-error-container',
    info: 'bg-surface-container text-on-surface',
    warning: 'bg-warning-container text-on-warning-container',
  }
  return classes[props.type] || classes.info
})

const icon = computed(() => {
  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
    warning: 'warning',
  }
  return icons[props.type] || icons.info
})

const onEnter = (el) => {
  el.style.opacity = '0'
  el.style.transform = 'translateY(100%)'
  setTimeout(() => {
    el.style.transition = 'all 0.3s ease-out'
    el.style.opacity = '1'
    el.style.transform = 'translateY(0)'
  }, 10)
}

const onLeave = (el) => {
  el.style.transition = 'all 0.3s ease-in'
  el.style.opacity = '0'
  el.style.transform = 'translateY(100%)'
}

watch(visible, (newVal) => {
  if (!newVal) {
    emit('close')
  }
}, { immediate: false })
</script>

<script>
import { watch } from 'vue'
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
