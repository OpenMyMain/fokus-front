<template>
<component :is="isLink ? 'router-link' : 'button'" :to="isLink ? to : null" class="fixed bottom-22 right-6">
  <button class="w-12 h-12 flex items-center justify-center bg-[#192D40] text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition">
    <span class="text-3xl"><slot>+</slot></span>
  </button>
</component>
</template>
<script setup>
const props = defineProps({
  to: {
    type: [String, Object],
  },
});

const isLink = !!props.to;
</script>
