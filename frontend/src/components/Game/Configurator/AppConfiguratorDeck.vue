<template>
  <div>
    <label v-if="props.displayLabel" class="block font-semibold mb-1">Decks :</label>
    <template v-for="deck in selectedGame.decks" :key="deck">
      <button
        class="px-3 py-1 mr-2 rounded border"
        :class="{'bg-gray-300 font-bold': selectedDeck === deck, 'bg-gray-100': selectedDeck !== deck}"
        @click="editorStore.setDeck(deck.id)"
      >
        {{ deck.name }}
      </button>
    </template>
    <button class="px-2 py-1 bg-green-400 text-white rounded" @click="newDeckForm.open()">
      +
    </button>
    <AppModal ref="newDeckForm" @validate="addDeck">
      <template #header>
        <h3 class="text-lg font-semibold">Ajouter un nouveau deck</h3>
      </template>
      <template #body>
        <input
          id="newDeckName"
          v-model="newDeckName"
          type="text"
          class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          placeholder="Nom du deck"
          autocomplete="off"
        />
      </template>
      <template #footer>
        <div class="flex gap-2 mt-2">
          <button
            class="flex-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
            @click="addDeck()">
            Ajouter
          </button>
          <button class="flex-1 px-2 py-1 bg-red-400 hover:bg-red-500 text-white rounded transition"
                  @click="resetNewDeck()">
            Annuler
          </button>
        </div>
      </template>
    </AppModal>
  </div>
</template>
<script setup>
import {onMounted, ref} from "vue";
import AppModal from "@/components/Common/AppModal.vue";
import api from "@/plugins/api.js";

const decks = ref({});
const props = defineProps({
  gameId: {
    type: Number,
    required: true
  },
  displayLabel: {
    type: Boolean,
    default: true
  }
});

const newDeckForm = ref(null);
const newDeckName = ref('');

function resetNewDeck() {
  newDeckName.value = '';
  newDeckForm.value.close();
}

function fetchDecks() {
  api.get("/api/games/" + props.gameId + "/decks")
    .then((response) => {
      decks.value = response.data.data ?? {};
    })
    .catch(() => {
      decks.value = {};
    });
}

onMounted(() => {
  fetchDecks();
});
</script>
