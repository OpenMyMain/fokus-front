<template>
  <div>
    <label class="block font-semibold mb-1">Dimensions :</label>
    <select v-model="selectedFormat" @change="selectSizeFormat"
            class="w-full p-2 border rounded">
      <option v-for="format in cardFormatsArray" :key="format.name" :value="format.name">
        {{ format.name }}
      </option>
      <option value="custom">Personnalisé</option>
    </select>

    <div v-if="selectedFormat === 'custom'" class="mt-4 flex space-x-4">
      <div>
        <label class="block font-semibold mb-1">Largeur (mm) :</label>
        <input type="number" v-model.number="cardStore.width" class="w-full p-2 border rounded"/>
      </div>
      <div>
        <label class="block font-semibold mb-1">Hauteur (mm) :</label>
        <input type="number" v-model.number="cardStore.height" class="w-full p-2 border rounded"/>
      </div>
    </div>

    <!-- Affiche le bouton seulement si les valeurs ont changé -->
    <button v-if="isModified" @click="saveCard"
            class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      Sauvegarder
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useCardStore } from "@/stores/card.js";
import api from "@/plugins/api.js";

const cardStore = useCardStore();

// Conserver une copie des valeurs initiales pour comparer
const initialWidth = ref(cardStore.width);
const initialHeight = ref(cardStore.height);

// Computed qui vérifie si les dimensions ont changé
const isModified = computed(() => {
  return cardStore.width !== initialWidth.value || cardStore.height !== initialHeight.value;
});


// Formats de cartes
const cardFormats = {
  bridge: { name: 'Bridge', width: 57, height: 88 },
  poker: { name: 'Poker', width: 63, height: 88 },
  tarot: { name: 'Tarot', width: 70, height: 121 },
};

const cardFormatsArray = Object.values(cardFormats);

// Format sélectionné
const selectedFormat = ref(getInitialFormat());

// Détermine le format initial en fonction des dimensions actuelles
function getInitialFormat() {
  const match = cardFormatsArray.find(f => f.width === cardStore.width && f.height === cardStore.height);
  return match ? match.name : 'custom';
}

// Quand on change le format
function selectSizeFormat() {
  if (selectedFormat.value === 'custom') return;

  const newFormat = cardFormatsArray.find(f => f.name === selectedFormat.value);
  if (newFormat) {
    cardStore.width = newFormat.width;
    cardStore.height = newFormat.height;
  }
}

// Sauvegarde via API
async function saveCard() {
  try {
    const payload = {
      width: cardStore.width,
      height: cardStore.height,
      radius: 5,
    };
    const response = await api.put('/decks/11/card-config', payload);
    console.log(response);
    // Met à jour les valeurs initiales après sauvegarde
    initialWidth.value = response.data.data.width;
    initialHeight.value = response.data.data.height;
  } catch (err) {
    console.error(err);
    alert('Erreur lors de la sauvegarde');
  }
}
</script>
