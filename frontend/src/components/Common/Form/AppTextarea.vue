<template>
  <div>
    <label v-if="props.label" :for="id" class="app-label">{{ props.label }} {{ required ? '*' : ''}}</label>
    <textarea
      :id="id"
      :name="id"
      :value="modelValue"
      @input="emit('update:modelValue', $event.target.value)"
      class="app-input"
      :rows="rows"
      :required="required"
      :placeholder="placeholder"
    ></textarea>
  </div>
</template>
<script setup>
const modelValue = defineModel();
const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '',
  },
  rows: {
    type: [String, Number],
    default: 4,
  },
});

const id = `app-textarea-${Math.random().toString(36).substring(2, 9)}`;

const emit = defineEmits(['update:modelValue']);
</script>
