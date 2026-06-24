<template>
  <div>
    <label v-if="props.label" :for="id" class="app-label">{{ props.label }} {{ required ? '*' : ''}}</label>
    <input
      :id="id"
      :name="id"
      :type="props.type"
      :value="modelValue"
      @input="emit('update:modelValue', $event.target.value)"
      class="app-input"
      :required="required"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
    />
  </div>
</template>
<script setup>
import { defineProps, defineEmits } from 'vue'

const modelValue = defineModel();
const props = defineProps({
  type: {
    type: String,
    default: 'text',
    validator: value => ['text', 'password', 'email'].includes(value),
  },
  label: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  autocomplete: {
    type: String,
    default: 'off',
  },
  placeholder: {
    type: String,
    default: '',
  },
});

const id = `app-input-${Math.random().toString(36).substring(2, 9)}`;

const emit = defineEmits(['update:modelValue']);
</script>

