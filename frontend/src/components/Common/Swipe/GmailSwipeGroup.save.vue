<template>
      <div class="max-w-md mx-auto mt-10 space-y-4 overflow-hidden">
        <transition-group name="fade" tag="div">
          <div
            v-for="item in items"
            :key="item.id"
            class="relative overflow-hidden bg-white rounded-xl shadow p-4 select-none"
            @touchstart.stop="startSwipe($event, item.id)"
            @touchmove.stop="moveSwipe($event, item.id)"
            @touchend.stop="endSwipe(item.id)"
            :style="{ transform: `translateX(${item.offset}px)` }"
          >
            <div
              class="absolute inset-0 flex items-center justify-end text-white pr-4 font-medium"
              :class="{ 'opacity-100': item.offset < -50, 'opacity-0': item.offset >= -50 }"
            >
              Supprimé
            </div>
            <div
              class="absolute inset-0 flex items-center justify-end text-white pr-4 font-medium"
              :class="{ 'opacity-100': item.offset > 50, 'opacity-0': item.offset <= 50 }"
            >
              Archivé
            </div>
            <div class="relative z-10">
              {{ item.text }} {{ item .offset }}
            </div>
          </div>
        </transition-group>
      </div>

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

const items = ref([
  { id: 1, text: 'Email 1', offset: 0 },
  { id: 2, text: 'Email 2', offset: 0 },
  { id: 3, text: 'Email 3', offset: 0 },
])

let startX = 0

function startSwipe(e, id) {
  startX = e.touches[0].clientX
}

function moveSwipe(e, id) {
  const item = items.value.find(i => i.id === id)
  const currentX = e.touches[0].clientX
  item.offset = currentX - startX
}

function endSwipe(id) {
  const item = items.value.find(i => i.id === id)
  if (item.offset < -100) {
    // Supprimer avec animation
    alert('supprimer')
    items.value = items.value.filter(i => i.id !== id)
  } else {
    // Supprimer avec animation
    alert('archiver')
    items.value = items.value.filter(i => i.id !== id)
  }
}

</script>
