<template>
  <div :class="block.attrs.class" class="border p-2 my-1">
    <!-- Affichage selon type -->
    <template v-if="block.type==='text'">
      <input v-model="block.content" @input="updateBlock" placeholder="Texte"/>
    </template>
    <template v-else-if="block.type==='title'">
      <input v-model="block.content" @input="updateBlock" placeholder="Titre"/>
    </template>
    <template v-else-if="block.type==='image'">
      <input v-model="block.attrs.src" @input="updateBlock" placeholder="URL Image"/>
    </template>
    <template v-else-if="block.type==='div'">
      <div class="flex flex-col">
        <slot></slot>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue";
// import draggable from "vuedraggable";
import { useEditorStore } from "@/stores/editor.js";
import Block from "./Block.vue";

const props = defineProps({
  block: Object,
  children: { type: Array, default: () => [] }
});

const store = useEditorStore();

function updateBlock() {
  store.updateBlock(props.block);
}

function onDragEnd(evt) {
  // evt contient oldIndex, newIndex
  store.moveBlock(evt.item.id, props.block.id, evt.newIndex);
}
</script>
