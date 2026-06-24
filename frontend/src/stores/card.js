import {defineStore} from 'pinia';
import {ref} from 'vue';
import api from "@/plugins/api.js";

export const useCardStore = defineStore('card', () => {

  const width = ref(0);
  const height = ref(0);
  const radius = ref(0);

  async function initialize(deckId) {
    const response = await api.get('/decks/' + deckId + '/card-config');
    width.value = response.data.data.width;
    height.value = response.data.data.height;
    radius.value = response.data.data.radius;
  }

  return {
    width,
    height,
    radius,
    initialize,
  };
});
