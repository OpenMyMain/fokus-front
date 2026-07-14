<template>
  <div>
    <label v-if="props.label" :for="id" class="app-label">{{ props.label }}</label>
    <select
      :id="id"
      :name="id"
      :value="modelValue"
      @change="emit('update:modelValue', $event.target.value)"
      class="app-input cursor-pointer"
    >
      <option v-for="option in props.options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

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

