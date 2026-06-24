<template>
  <div
    class="fixed bottom-0 left-0 w-full shadow-lg bg-gray-900 border-t border-gray-700"
    :style="{ zIndex: 50, height: showBottomPanel ? '40vh' : 'auto' }"
  >
    <div class="flex flex-col h-full">
      <div class="flex items-center justify-between px-6 py-3 border-b border-gray-800">
        <div v-if="showBottomPanel" class="flex space-x-2">
          <button
            class="text-lg font-mono text-gray-200 border-r px-4 focus:outline-none hover:bg-gray-800 transition"
            :class="{ 'bg-gray-800': varSelected === 'all' }"
            @click="varSelected = 'all'"
          >
            All
          </button>
          <button
            class="text-lg font-mono text-gray-200 border-r px-4 focus:outline-none hover:bg-gray-800 transition"
            :class="{ 'bg-gray-800': varSelected === 'blockSelected' }"
            @click="varSelected = 'blockSelected'"
          >
            Select block
          </button>
          <button
            class="text-lg font-mono text-gray-200 px-4 focus:outline-none hover:bg-gray-800 transition"
            :class="{ 'bg-gray-800': varSelected === 'templateValues' }"
            @click="varSelected = 'templateValues'"
          >
            Values template
          </button>
        </div>
        <button
          @click="showBottomPanel = !showBottomPanel"
          class="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition"
        >
          {{ showBottomPanel ? 'Fermer le débugger' : 'Ouvrir le débugger' }}
        </button>
      </div>

      <div v-if="showBottomPanel" class="flex-1 overflow-auto p-6 bg-gray-950">
            <pre
              v-if="varSelected === 'all'"
              class="text-green-400 font-mono whitespace-pre break-words"
            >{{ JSON.stringify(templateBlocks, null, 2) }}</pre>
        <pre
          v-else-if="varSelected === 'blockSelected'"
          class="text-green-400 font-mono whitespace-pre break-words"
        >{{ JSON.stringify(selectedBlock, null, 2) }}</pre>
        <pre
          v-else-if="varSelected === 'templateValues'"
          class="text-green-400 font-mono whitespace-pre break-words"
        >{{ JSON.stringify(templateValues, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>
<script setup>

import {ref} from "vue";

const showBottomPanel = ref(false);
const varSelected = ref('all');
</script>
