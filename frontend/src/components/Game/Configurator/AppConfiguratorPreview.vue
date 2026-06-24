<template>
  <!-- ⭐ Rendu dynamique du JSON -->
<!--  <pre> blocks {{ blocks }}</pre>-->
  <div v-if="templateValues" class="relative group" style="width: 100%; height: 100%; padding: 8px">
    <div
      v-for="block in blocks"
      :key="block.id"
    >
      <component
        :is="renderBlock(block)"
        @click="(e) => selectBlock(block, e)"
        v-bind:class="{active : modelValue === block}"
        class="cursor-pointer hover:bg-gray-200 hover:border-[3px] border-dashed border-blue-900"
      />
    </div>
    <button
      class="mx-auto opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow"
      @click.stop="addDiv"
      title="Ajouter un élément"
    >
      +
    </button>
  </div>
</template>
<style>
.active {
  border: 3px solid blue !important;
  background-color: rgba(0, 0, 120, 0.1) !important;
}
</style>
<script setup>
import {computed, h, onBeforeUnmount, onMounted, ref} from "vue";
import {useTemplateValueStore} from "@/stores/templateValues.js";
import {useEditorStore} from "@/stores/editor.js";
import {useBlockEditorStore} from "@/stores/blockEditor.js";


const store = useBlockEditorStore();
const blocks = computed(() => store.blocks);
// const blocks = ref([
//   {
//     id: 1,
//     type: "div",
//     attrs: {
//       class: "bg-[{{ color }}] p-4 rounded text-{{ size }}",
//       style: "color: {{ textColor }};"
//     },
//     content: {
//       type: "title",
//       level: "h1",
//       content: "Bonjour {{ name }} !",
//       attrs: {
//         class: "font-bold text-3xl",
//         style: "color: {{ textColor }};"
//       }
//     }
//   }
// ]);
const emit = defineEmits(['update:template-blocks', 'update:select-block']);

const templateValueStore = useTemplateValueStore();
const templateValues = computed(() => templateValueStore.templatesValues);
//
// const templateValues = ref({
//   name: "John Doe",
//   color: "red",
//   size: "xl",
//   textColor: "blue"
// });

const editorStore = useEditorStore();
const templateBlocks = computed(() => editorStore.contentFront);


const modelValue = defineModel({
  type: Object,
  default: null
});

function selectBlock(block, event) {
  event.stopPropagation();
  modelValue.value = block;
  emit('update:select-block', block);
}


function interpolate(text, values) {
  console.log("interpolate", text, values);
  if (typeof text !== "string") return text;

  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    return values[key] !== undefined ? values[key] : match;
  });
}


function interpolateAttrs(attrs, values) {
  if (!attrs) return {};

  const result = {};

  for (const key in attrs) {
    const value = attrs[key];

    // Si c'est une string → interpolation
    if (typeof value === "string") {
      result[key] = interpolate(value, values);
    }
    // Si c'est un object (style objet), on boucle dessus
    else if (typeof value === "object") {
      result[key] = interpolateAttrs(value, values);
    } else {
      result[key] = value;
    }
  }

  return result;
}

function evalCondition(condition, values) {
  console.log("Eval condition :", condition, values);
  if (!condition) return true; // pas de condition → afficher

  try {
    return new Function(
      ...Object.keys(values),
      `return (${condition});`
    )(...Object.values(values));
  } catch (e) {
    console.warn("Erreur condition :", condition, e);
    return false;
  }
}


/**
 * ⭐ Fonction de rendu dynamique
 * Elle prend un bloc JSON et retourne un VNode <component>
 */
const renderBlock = (block) => {
  console.log("Render Block", block);
  if (!block) return null;
  if (block.if && !evalCondition(block.if, templateValues.value)) {
    return null;
  }

  const attrs = interpolateAttrs(block.attrs, templateValues.value);

  // ---- Titre dynamique ----
  if (block.type === "title") {
    const level = block.level || block.content.level || "h1";

    const rawText = block.content?.content || block.content;
    const rawAttr = block.content?.attrs || block.attrs;
    const finalText = interpolate(rawText, templateValues.value);
    const finalAttrs = interpolateAttrs(rawAttr, templateValues.value);

    return h(level, { ...finalAttrs, onClick: (e) => selectBlock(block, e) }, finalText);
  }

  // ---- Div ----
  if (block.type === "div") {
    console.log("ici", attrs);

    return h(
      "div",
      { ...attrs, onClick: (e) => selectBlock(block, e) },
      [
        renderBlock(block.content)
      ]
    );
  }

  // ---- Texte ----
  if (block.type === "text") {
    return h(
      "p",
      { ...attrs, onClick: (e) => selectBlock(block, e) },
      interpolate(block.content, templateValues.value)
    );
  }

  return h("div", {onClick: (e) => selectBlock(block, e)}, "Type non supporté");
};

function addDiv() {
  // Ajouter la div a la fin de la liste
  // Ajouter la div à la fin de la liste sans muter la prop
  const newValue = [
    ...props.templateBlocks,
    {
      id: Date.now(),
      type: "div",
      attrs: {
        class: "p-4 bg-gray-100 rounded"
      },
      content: {
        type: "text",
        content: "Contenu du bloc"
      }
    }
  ];
  console.log(newValue);
  emit('update:template-blocks', newValue);
}

function handleKeydown(e) {
  if (e.key === 'Escape' && modelValue.value !== null) {
    modelValue.value = null;
    emit('update:select-block', null);
  }
}

//ket press echap if modelValue is not null, set it to null

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
});


</script>
