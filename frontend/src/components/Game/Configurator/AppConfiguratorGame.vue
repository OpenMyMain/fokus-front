<template>
  <div>
    <label v-if="props.displayLabel" class="block font-semibold mb-1">Jeux :</label>
    <select v-model="editorStore.game" class="w-full p-2 border rounded">
      <option v-for="game in games" :key="game" :value="game">
        {{ game.name }}
      </option>
    </select>
  </div>
</template>
<script setup>

import {onMounted, ref} from "vue";
import api from "@/plugins/api.js";

const games = ref({})
const props = defineProps({
  displayLabel: {
    type: Boolean,
    default: true
  }
});

function fetchGames() {
  api.get('games').then((response) => {
    games.value = response.data.data ?? {};
  }).catch(() => {
    games.value = {};
  });
}

onMounted(() => {
  fetchGames();
});
</script>
