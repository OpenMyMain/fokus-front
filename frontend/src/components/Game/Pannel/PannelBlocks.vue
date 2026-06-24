<template>
  <div>
    <h2> Ajouter un élément </h2>
    <div class="flex flex-col gap-4 mt-4">
      <div class="flex flex-wrap gap-4">
        <div
          v-for="block in blockTypes"
          :key="block.type"
          @click="addBlock(block.type)"
          class="cursor-pointer flex flex-col gap-1 items-center justify-center w-[calc(50%_-_8px)] border border-gray-300 h-30 rounded-md shadow">
          <i class="fa-solid text-4xl" v-bind:class="block.icon"></i>
          <div>{{ block.label }}</div>
        </div>
      </div>
    </div>
  </div>
<pre>{{ store.blocks }}</pre>
</template>
<script setup>
import {computed} from "vue";
import {useEditorStore} from "@/stores/editor.js";
import {useBlockEditorStore} from "@/stores/blockEditor.js";

const editorStore = useEditorStore();
const store = useBlockEditorStore();

const blockTypes = [
  {type: "div", icon: "fa-box", label: "Block"},
  {type: "title", icon: "fa-t", label: "Title"},
  {type: "text", icon: "fa-paragraph", label: "Paragraphe"},
  {type: "image", icon: "fa-image", label: "Image"},
  {type: "table", icon: "fa-table", label: "Table"},
  {type: "icon", icon: "fa-icons", label: "Icon / svg"},
  {type: "shape", icon: "fa-shapes", label: "Blob / Shape"},
  {type: "mask", icon: "fa-mask", label: "Mask"},
];

function addBlock(type) {
  store.createBlock(type);
}
</script>
