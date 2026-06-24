<template>
  <div @touchstart.stop @touchend.stop class="relative w-full h-[500px] flex items-center justify-center overflow-hidden">
    <div
      v-for="card in cards"
      :key="card.id"
      class="absolute overflow-hidden w-64 h-96 bg-white rounded-2xl shadow-lg flex items-center justify-center text-xl font-semibold select-none transition-transform duration-300"
      :style="{
        transform: `translate(${card.x}px, ${card.y}px) rotate(${card.rotate}deg)`,
        zIndex: card.z,
      }"
      @mousedown.stop="startDrag($event, card)"
      @mousemove.stop="onDrag($event, card)"
      @mouseup.stop="endDrag(card)"
      @touchstart.stop="startDrag($event.touches[0], card)"
      @touchmove.stop="onDrag($event.touches[0], card)"
      @touchend.stop="endDrag(card)"
    >
      {{ card.text }}
      <div
        class="absolute inset-0 flex items-center justify-center bg-red-500 text-white pr-4 font-medium"
        :class="{ 'opacity-100': card.x < -25, 'opacity-0': card.x >= -25, zIndex: card.z }"
      >
        Nope !
      </div>
      <div
        class="absolute w-64 h-96 inset-0 flex items-center justify-center bg-green-500 text-white pr-4 font-medium"
        :class="{ 'opacity-100': card.x > 25, 'opacity-0': card.x <= 25, zIndex: card.z }"
      >
        Yes !
      </div>
    </div>
    <div v-if="cards.length === 0" class="text-gray-500 italic">
      Plus de cartes à afficher
    </div>
  </div>

</template>
<style scoped>
.swipe-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
</style>
<script setup>
import {ref} from "vue";

const cards = ref([
  { id: 1, text: 'Alice 💫', x: 0, y: 0, rotate: 0, z: 3 },
  { id: 2, text: 'Bob 🌻', x: 0, y: 0, rotate: 0, z: 2 },
  { id: 3, text: 'Charlie 🚀', x: 0, y: 0, rotate: 0, z: 1 },
])

let activeCard = null
let startX = 0
let startY = 0

function startDrag(e, card) {
  activeCard = card
  startX = e.clientX - card.x
  startY = e.clientY - card.y
}

function onDrag(e, card) {
  if (activeCard !== card) return
  card.x = e.clientX - startX
  card.y = e.clientY - startY
  card.rotate = card.x / 10
}

function endDrag(card) {
  if (!activeCard) return
  // Si la carte sort à droite ou à gauche
  if (Math.abs(card.x) > 150) {
    const direction = card.x > 0 ? 1 : -1
    card.x += direction * 300
    card.rotate += direction * 30
    setTimeout(() => {
      cards.value = cards.value.filter(c => c.id !== card.id)
    }, 300)
  } else {
    // Retour au centre
    card.x = 0
    card.y = 0
    card.rotate = 0
  }
  activeCard = null
}

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 3s ease;
}
.fade-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}
</style>
