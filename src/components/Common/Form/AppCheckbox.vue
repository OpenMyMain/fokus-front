<template>
  <div class="flex items-center">
    <input
      :id="id"
      type="checkbox"
      :checked="modelValue"
      @change="emit('update:modelValue', $event.target.checked)"
      class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
    />
    <label v-if="props.label" :for="id" class="ml-2 block text-sm text-gray-900">
      {{ props.label }}
    </label>
  </div>
</template>
<script setup>
import {defineProps, defineEmits} from 'vue'

const modelValue = defineModel();
const props = defineProps({
  label: {
    type: String,
    default: '',
  },
});
const id = `app-checkbox-${Math.random().toString(36).substring(2, 9)}`;
const emit = defineEmits(['update:modelValue']);
</script>
