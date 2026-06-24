import {defineStore} from 'pinia';
import {computed, ref} from 'vue';

export const useEditorStore = defineStore('editor', () => {

  // template block structure for front and back of the card
  const contentFront = ref([]);
  const contentBack = ref([]);

  const selectedBlock = ref(null);

  const editor = computed(() => {
    return {
      contentFront: contentFront.value,
      contentBack: contentBack.value,
    };
  });

  function reset() {
    contentFront.value = [];
    contentBack.value = [];
  }


  return {
    selectedBlock,
    contentFront,
    editor,
    reset,
  };
});
