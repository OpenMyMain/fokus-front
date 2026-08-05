<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 pointer-events-none flex flex-col gap-4 p-4 md:p-6 justify-end items-start">
      <TransitionGroup name="toast" tag="div" class="flex flex-col gap-4">
        <Toast
          v-for="toast in toasts"
          :key="toast.id"
          :message="toast.message"
          :type="toast.type"
          @close="removeToast(toast.id)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'
import Toast from './Toast.vue'

const { toasts, removeToast } = useToast()
</script>
