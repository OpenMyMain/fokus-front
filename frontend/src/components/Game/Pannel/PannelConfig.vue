<template>
  <div>
    <h1 class="text-xl font-bold mb-4">Configuration du format</h1>
    <!-- Sélection du format -->
    <div class="mb-4">
      <label class="block font-semibold mb-1">Dimensions :</label>
      <select v-model="selectedFormat" @change="selectSizeFormat"
              class="w-full p-2 border rounded">
        <option v-for="format in cardFormatsArray" :key="format.name" :value="format.name">
          {{ format.name }}
        </option>
        <option value="custom">Personnalisé</option>
      </select>
    </div>

    <!-- Dimensions personnalisées -->
    <div v-if="selectedFormat === 'custom'" class="mb-4 flex space-x-4">
      <div class="flex-1">
        <label class="block font-semibold mb-1">Largeur (mm) :</label>
        <input type="number" v-model.number="cardStore.width" class="w-full p-2 border rounded"/>
      </div>
      <div class="flex-1">
        <label class="block font-semibold mb-1">Hauteur (mm) :</label>
        <input type="number" v-model.number="cardStore.height" class="w-full p-2 border rounded"/>
      </div>
    </div>

    <!-- Rayon des coins -->
    <div class="mb-4">
      <label class="block font-semibold mb-1">Arrondis en (mm) :</label>
      <input
        type="number"
        v-model.number="cardStore.radius"
        min="0"
        class="w-full p-2 border rounded"
      />
    </div>

    <!-- Bouton sauvegarder seulement si modifié -->
    <button v-if="isModified" @click="saveCard"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      Sauvegarder
    </button>
  </div>
</template>

<script setup>
import {ref, computed, watch} from "vue";
import {useCardStore} from "@/stores/card.js";
import api from "@/plugins/api.js";

const props = defineProps({
  deckId: {
    type: [String, Number],
    required: true
  }
});

const cardStore = useCardStore();

// Copie des valeurs initiales pour comparer
const initialWidth = ref(cardStore.width);
const initialHeight = ref(cardStore.height);
const initialRadius = ref(cardStore.radius);

// Computed qui indique si les valeurs ont changé
const isModified = computed(() => {
  return cardStore.width !== initialWidth.value ||
    cardStore.height !== initialHeight.value ||
    cardStore.radius !== initialRadius.value;
});

// Formats de cartes
const cardFormats = {
  bridge: {name: 'Bridge', width: 57, height: 88},
  poker: {name: 'Poker', width: 63, height: 88},
  tarot: {name: 'Tarot', width: 70, height: 121},
};
const cardFormatsArray = Object.values(cardFormats);

// Format sélectionné
const selectedFormat = ref(getInitialFormat());

// Détermine le format initial
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

// Sauvegarde via API avec deckId dynamique
async function saveCard() {
  try {
    const payload = {
      width: cardStore.width,
      height: cardStore.height,
      radius: cardStore.radius,
    };

    const response = await api.put(`/decks/${props.deckId}/card-config`, payload);

    // Met à jour les valeurs initiales après sauvegarde
    initialWidth.value = response.data.data.width;
    initialHeight.value = response.data.data.height;
    initialRadius.value = response.data.data.radius;
  } catch (err) {
    console.error(err);
    alert('Erreur lors de la sauvegarde');
  }
}

// Optionnel : mettre à jour le format sélectionné si l'utilisateur modifie directement width/height
watch([() => cardStore.width, () => cardStore.height], () => {
  selectedFormat.value = getInitialFormat();
});
</script>
