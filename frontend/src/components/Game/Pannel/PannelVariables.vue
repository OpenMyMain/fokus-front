<template>
  <h1>Variables du template</h1>
  <template v-for="field in fields" :key="field.label">
    <label class="block font-semibold mt-2">
      {{ field.label }} <span v-if="field.required" class="text-red-500">*</span>
    </label>
    <input
      v-if="field.type === 'string' || field.type === 'number'"
      :type="field.type === 'number' ? 'number' : 'text'"
      v-model="field.default_value"
      :placeholder="field.default_value"
      class="w-full p-2 border rounded mb-2"
      :required="field.required"
    >
    <input
      v-else-if="field.type === 'checkbox'"
      type="checkbox"
      v-model="field.default_value"
      class="mr-2"
      :required="field.required"
    >
    <select
      v-else-if="field.type === 'enum'"
      v-model="field.default_value"
      class="w-full p-2 border rounded mb-2"
      :required="field.required"
    >
      <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
    </select>
    <input
      v-else-if="field.type === 'color'"
      type="color"
      v-model="field.default_value"
      class="w-12 h-8 p-1 border rounded mb-2"
      :required="field.required"
    >
  </template>
</template>
<script setup>
import {useTemplateValueStore} from "@/stores/templateValues.js";
import {computed} from "vue";

const templateValueStore = useTemplateValueStore();
const fields = computed(() => templateValueStore.fields);
</script>
