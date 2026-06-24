<template>
        <transition-group name="fade" tag="div" class="max-w-md mx-auto space-y-4 overflow-hidden">
          <div
            class="relative overflow-hidden select-none"
            @touchstart.stop="startSwipe"
            @touchmove.stop="moveSwipe"
            @touchend.stop="endSwipe"
            :style="{ transform: `translateX(${offset}px)` }"
          >
            <div
              class="absolute inset-0 flex items-center justify-end bg-red-500 text-white pr-4 font-medium"
              :class="{ 'opacity-100': offset < -50, 'opacity-0': offset >= -50 }"
            >
              Supprimé
            </div>
            <div
              class="absolute inset-0 flex items-center justify-end bg-green-500 text-white pr-4 font-medium"
              :class="{ 'opacity-100': offset > 50, 'opacity-0': offset <= 50 }"
            >
              Archivé
            </div>
            <div class="relative z-10">
              <slot/>
            </div>
          </div>
        </transition-group>
</template>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}
</style>
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

const startX = ref(0);
const offset = ref(0);

function startSwipe(e) {
  startX.value = e.touches[0].clientX;
}

function moveSwipe(e) {
  const currentX = e.touches[0].clientX
  offset.value = currentX - startX.value;
}

const emit = defineEmits(['swipeLeft', 'swipeRight']);
function endSwipe() {
  if (offset.value < -100) {
    emit('swipeLeft');
  } else if (offset.value > 100) {
    emit('swipeRight');
  }
  offset.value = 0;
}

</script>
