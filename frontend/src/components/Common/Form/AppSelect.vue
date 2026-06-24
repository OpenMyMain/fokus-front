<template>
  <div>
    <label v-if="props.label" :for="id" class="app-label">{{ props.label }}</label>
    <select
      :id="id"
      :name="id"
      :value="modelValue"
      @change="emit('update:modelValue', $event.target.value)"
      class="app-input"
    >
      <option v-for="option in props.options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.app-label {
  margin-bottom: 0.5rem;
  display: block;
  font-weight: 500;
  color: #374151; /* gray-700 */
}

.app-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db; /* gray-300 */
  border-radius: 0.375rem; /* rounded-md */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); /* shadow-sm */
  transition: border-color 0.2s, box-shadow 0.2s;
}
</style>

<script setup>
import {defineProps, defineEmits} from 'vue'

const modelValue = defineModel();
const props = defineProps({
  options: {
    type: Array,
    required: true,
    default: () => [],
  },
  label: {
    type: String,
    default: '',
  },
});

const id = `app-input-${Math.random().toString(36).substring(2, 9)}`;

const emit = defineEmits(['update:modelValue']);
</script>

