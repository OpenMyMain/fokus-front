<template>
  <div>
    <h2>Ajouter un block</h2>
    <div class="flex gap-2">
      <button @click="addBlock('div')">Div</button>
      <button @click="addBlock('title')">Titre</button>
      <button @click="addBlock('text')">Texte</button>
      <button @click="addBlock('image')">Image</button>
    </div>

<!--    <draggable v-model="blocksTree" group="blocks" item-key="id" @end="onDragEnd">-->
<!--      <template #item="{element}">-->
<!--        <Block :block="element" :children="element.children"/>-->
<!--      </template>-->
<!--    </draggable>-->

    <button @click="saveChanges" class="mt-4 bg-blue-500 text-white p-2 rounded">Sauvegarder</button>
  </div>
</template>

<script setup>
import { computed } from "vue";
// import draggable from "vuedraggable";
import Block from "./Block.vue";
import {useBlockEditorStore} from "@/stores/blockEditor.js";

const store = useBlockEditorStore();

const blocksTree = computed(() => store.buildTree);

function addBlock(type) {
  store.createBlock(type);
}

function saveChanges() {
  store.saveAllChanges();
}

function onDragEnd(evt) {
  // evt contient item, oldIndex, newIndex
  // On peut laisser la logique gérée dans le Block.vue récursif
}
</script>
