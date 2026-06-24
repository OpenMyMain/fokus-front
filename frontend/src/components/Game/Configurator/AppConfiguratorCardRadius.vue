<template>
  <div class="bg-white p-2">
    <label class="block text-gray-700 font-semibold mb-2">Arrondis :</label>
    <select
      v-model="selectedBorder"
      @change="selectSizeFormat"
      class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    >
      <option v-for="(format, idx) in cardFormats" :key="idx" :value="idx">
        {{ format.name }}
      </option>
      <option :value="null">Personnalisé</option>
    </select>
    <template v-if="selectedBorder === null">
      <div class="mt-6 flex flex-col space-y-4">
        <div>
          <label class="block text-gray-700 font-semibold mb-2">Largeur (mm) :</label>
          <input
            type="number"
            v-model="cardStore.radius"
            class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>
    </template>
  </div>
</template>
<script setup>
import {ref} from "vue";
import {useCardStore} from "@/stores/card.js";

const cardStore = useCardStore();
const selectedBorder = ref(0);

const cardFormats = {
  4: {name: '4mm', value: 4},
  7: {name: '7mm', value: 7},
  11: {name: '11mm', value: 11},
};

function selectSizeFormat() {
  cardStore.radius = cardFormats[selectedBorder.value].value;
}
</script>
