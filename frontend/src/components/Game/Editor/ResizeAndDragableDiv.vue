<template>
  <pre>
    IsActive: {{ isActive }}
    Position: {{ dragPos }}
    Taille: {{ size }}
  </pre>

  <div
    @click.self="isActive = true"
    ref="box"
    :class="['box', { active: isActive }]"
    :style="{
      left: dragPos.x + 'px',
      top: dragPos.y + 'px',
      width: size.width + 'px',
      height: size.height + 'px'
    }"
    @mousedown="startDrag"
  >
    Div redimensionnable et déplaçable
  </div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, computed} from "vue";

const isActive = ref(false);

const dragPos = ref({x: 50, y: 50});
const size = ref({width: 200, height: 150});

const isDragging = ref(false);
const dragOffset = ref({x: 0, y: 0});

const box = ref(null);

// 🟦 DRAG
function startDrag(e) {
  // si on clique sur la zone de resize, ne pas déplacer
  if (
    e.offsetX > size.value.width - 20 &&
    e.offsetY > size.value.height - 20
  )
    return;

  isDragging.value = true;
  dragOffset.value = {
    x: e.clientX - dragPos.value.x,
    y: e.clientY - dragPos.value.y
  };

  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
}

const parentRect = computed(() => {
  const parent = box.value?.parentElement;
  return parent ? parent.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
});

function onDrag(e) {
  if (!isDragging.value) return;

  dragPos.value = {
    x: Math.min(
      Math.max(e.clientX - dragOffset.value.x, 0),
      parentRect.value.width - size.value.width
    ),
    y: Math.min(
      Math.max(e.clientY - dragOffset.value.y, 0),
      parentRect.value.height - size.value.height
    )
  };
}

function stopDrag() {
  isDragging.value = false;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
}

function onClickOutside(e) {
  if (!box.value) return;

  // Si l'élément cliqué N'EST PAS dans la div
  if (!box.value.contains(e.target)) {
    isActive.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", onClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onClickOutside);
});

// 🟩 RESIZE OBSERVER
let resizeObserver;

onMounted(() => {
  resizeObserver = new ResizeObserver(entries => {


    if (entries.length > 0) {
      const rect = entries[0].contentRect;
      const parent = box.value?.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        // Vérifie si la nouvelle taille dépasse le parent
        const maxWidth = parentRect.width - dragPos.value.x;
        const maxHeight = parentRect.height - dragPos.value.y;
        size.value = {
          width: Math.round(Math.min(rect.width, maxWidth)),
          height: Math.round(Math.min(rect.height, maxHeight))
        };
      }
    }
  });

  if (box.value) {
    resizeObserver.observe(box.value);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect();
});

// 🟨 KEYBOARD MOVE
window.addEventListener("keydown", e => {
  if (!isActive.value) return;
  if (
    ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
  ) {
    // si MAJ enfoncée, déplacer de 10px
    const step = e.shiftKey ? 10 : 1;
    e.preventDefault();

    let newX = dragPos.value.x;
    let newY = dragPos.value.y;

    if (e.key === "ArrowLeft") newX -= step;
    if (e.key === "ArrowRight") newX += step;
    if (e.key === "ArrowUp") newY -= step;
    if (e.key === "ArrowDown") newY += step;

    newX = Math.max(
      0,
      Math.min(
        newX,
        parentRect.value.width - size.value.width
      )
    );
    newY = Math.max(
      0,
      Math.min(
        newY,
        parentRect.value.height - size.value.height
      )
    );

    dragPos.value = { x: newX, y: newY };
  }

  if (e.key === "Escape") {
    isActive.value = false;
  }
});
</script>

<style>
.box {
  position: absolute;
  resize: both;
  overflow: auto;
  min-width: 100px;
  min-height: 100px;
  border: 2px dashed #3b82f6;
  background: #f0f9ff;
  cursor: move;
  border-radius: 6px;
}

.box.active {
  border: 2px solid #22c55e;
  background: #e6ffed;
  box-shadow: 0 0 8px #22c55e;
}
</style>
