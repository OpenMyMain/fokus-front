<template>
  <!-- Sidebar à gauche -->
  <div class="sidebar">
    <button
      v-for="panel in panels"
      :key="panel.name"
      @click="toggle(panel.name)"
      class="sidebar-btn"
    >
      <i v-if="panel.name !== 'style'"
         :class="panel.icon + ' sidebar-icon'">{{ panel.iconText }}</i>
      <svg v-if="panel.name === 'style'" class="sidebar-icon sidebar-svg" viewBox="0 0 23 22"><g fill="none" fill-rule="evenodd"><path d="M-1-3h26v26H-1z"></path><path fill="currentColor" d="M8 .994L2 14.993h3l1.285-3h6.43l1.285 3h3l-6-14H8zm1.5 3.499l1.928 4.5H7.572l1.928-4.5z"></path><g class="icon-animation-1"><path fill="currentColor" d="M17.546.8l-2.49 4.62-3.42 6.35a6.672 6.672 0 001.163 7.93 6.67 6.67 0 004.747 1.965 6.667 6.667 0 004.746-1.966 6.67 6.67 0 001.163-7.93l-3.421-6.35L17.546.8zm0 5.96l3.42 6.35a3.886 3.886 0 11-6.841 0l3.42-6.35z" class="icon-transparent"></path><path fill="currentColor" d="M21.873 12.496l-4.327-8.035-4.328 8.034a4.946 4.946 0 00.85 5.81 4.897 4.897 0 003.478 1.436 4.894 4.894 0 003.475-1.437 4.945 4.945 0 00.852-5.808"></path></g></g></svg>
      <span class="sidebar-label">{{ panel.label }}</span>
    </button>
  </div>

  <!-- Panneau latéral animé -->
  <transition name="slide">
    <div
      v-if="activePanel"
      class="absolute overflow-scroll top-0 left-14 h-full w-1/4 bg-white shadow-lg z-40 p-6"
    >
      <button class="absolute top-2 right-2 text-gray-400" @click="closePanel">
        <i class="fa fa-times text-xl"></i>
      </button>
      <!-- Contenu du panneau selon le panel actif -->
      <PannelConfig v-if="activePanel === 'config'" :deck-id="deckId" />

      <PannelTheme v-else-if="activePanel === 'style'" />

      <PannelBlocks v-else-if="activePanel === 'blocks'"/>

      <PannelVariables v-else-if="activePanel === 'variables'" />
    </div>
  </transition>
</template>

<style>
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s cubic-bezier(.4, 0, .2, 1), opacity 0.3s;
}

.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-enter-to, .slide-leave-from {
  transform: translateX(0);
  opacity: 1;
}


.sidebar {
  position: relative;
  top: 0;
  left: 0;
  height: 100%;
  width: 4rem;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}
.sidebar-btn {
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  background: none;
  border: none;
}
.sidebar-icon {
  font-size: 1.5rem;
  color: #6b7280;
  transition: color 0.2s;
}
.sidebar-btn:hover .sidebar-icon {
  color: #3b82f6;
}
.sidebar-svg {
  width: 1.5rem;
}
.sidebar-label {
  font-size: 0.75rem;
  margin-top: 0.25rem;
}
</style>
<script setup>

// Sidebar panels
import {onBeforeUnmount, onMounted, ref} from "vue";
import PannelConfig from "@/components/Game/Pannel/PannelConfig.vue";
import PannelBlocks from "@/components/Game/Pannel/PannelBlocks.vue";
import PannelTheme from "@/components/Game/Pannel/PannelTheme.vue";
import PannelVariables from "@/components/Game/Pannel/PannelVariables.vue";

const props = defineProps({
  deckId: {
    type: Number,
    required: true
  }
});

const panels = [
  {name: "config", label: "Carte", icon: "fa-solid fa-crop-simple"},
  // {name: "config", label: "Carte", icon: "fa-solid fa-cog"},
  // {name: "config", label: "Config", icon: "fa-solid fa-hammer"},
  {name: "blocks", label: "Blocs", icon: "fa-solid fa-layer-group"},
  {name: "style", label: "Style", icon: "fa-solid fa-paint-brush"},
  {name: "image", label: "Image", icon: "fa-solid fa-image"},
  {name: "variables", label: "Variables", iconText: "{ }"},
  {name: "import", label: "Importer data", icon: "fa-solid fa-bars"}
];
const activePanel = ref(null);

function toggle(name) {
  if (activePanel.value === name) {
    activePanel.value = null;
    return;
  }
  activePanel.value = name;
}

function closePanel() {
  activePanel.value = null;
}

// key press escape to close panel
function handleKeydown(event) {
  if (event.key === 'Escape' && activePanel.value) {
    closePanel();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});

</script>
