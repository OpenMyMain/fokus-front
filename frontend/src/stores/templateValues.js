import {defineStore} from 'pinia';
import {computed, ref} from 'vue';
import api from "@/plugins/api.js";

export const useTemplateValueStore = defineStore('templateValue', () => {

  // values in database
  const fields = ref([]);

  const templatesValues = computed(() => {
    if (!fields.value) {
      return [];
    }
    // map pour retourner uniquement la key et la value et si elle n'est pas renseignée on prends default ?


    return fields.value.reduce((acc, field) => {
      acc[field.label] = field.default_value;
      return acc;
    }, {});
  })

  async function fetchValues() {
    try {
      const response = await api.get('studio/tpl-values');
      fields.value = response.data.values ?? [];
    } catch {
      fields.value = [];
    }
  }

  function initializeEditor() {
    fetchValues();
  }

  return {
    fields,
    templatesValues,
    initializeEditor,
  };
});
