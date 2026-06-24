<template>
  <div class="flex items-center">
    <div class="card-container " :style="{
    width: cardWidth + 'mm',
    height: cardHeight + 'mm',
    transform: 'rotate(' + rotate + 'deg)'
  }">
      <div class="card " :class="{ flipped: isFlipped }" :style="carteSize()">
        <div class="card-face card-front bg-white" :style="carteSize()">
          <slot name="front"></slot>
        </div>

        <div class="card-face card-back bg-[#2a2a72]" :style="carteSize()">
          <slot name="back"></slot>
        </div>
      </div>
    </div>
  </div>
  <div class="flex justify-center mt-4 space-x-2">
    <button @click="isFlipped = false"
            :class="{'bg-blue-500 text-white': !isFlipped, 'bg-gray-200': isFlipped}"
            class="px-4 py-2 rounded">
      Front
    </button>
    <button @click="isFlipped = true"
            :class="{'bg-blue-500 text-white': isFlipped, 'bg-gray-200': !isFlipped}"
            class="px-4 py-2 rounded">
      Back
    </button>
  </div>


</template>
<style scoped>
.card-container {
  cursor: pointer;
  perspective: 1000px;
}

.card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.card.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden; /* Cache la face arrière */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

@media print {
  .card-face {
    box-shadow: none !important;
  }
}

.card-front {
  color: black;
}

.card-back {
  color: white;
  transform: rotateY(180deg);
  z-index: 1000;
}
</style>

<script setup>
import {computed, ref} from "vue";
import {useCardStore} from "@/stores/card.js";


const cardStore = useCardStore();

const cardWidth = computed(() => cardStore.width ?? 52);
const cardHeight = computed(() => cardStore.height ?? 88);
const cardRadius = computed(() => cardStore.radius ?? 4);

const rotate = ref(0);

function carteSize() {
  return {
    width: cardWidth.value + 'mm',
    height: cardHeight.value + 'mm',
    borderRadius: cardRadius.value + 'mm',
  }
}

function styleFrontCard() {
  return {
    width: cardWidth.value + 'mm',
    height: cardHeight.value + 'mm',
    backgroundColor: 'white',
    borderRadius: cardRadius.value + 'mm',
  }
}

function styleBackCard() {
  return {
    width: cardWidth.value + 'mm',
    height: cardHeight.value + 'mm',
    backgroundColor: '#2a2a72',
    borderRadius: cardRadius.value + 'mm',
  }
}

const margeCard = computed(() => {
  // if (!props.parameters?.border?.display) {
  return 0;
  // }
  // return props.parameters?.border?.padding ?? 0
});

function calcInnerRadius() {
  return Math.max(Math.sqrt(Math.abs(cardRadius.value ^ 2 - margeCard.value ^ 2)), cardRadius.value - margeCard.value);
}

const isFlipped = ref(false);
</script>
