<template>
    <button
      class="w-full bg-gray-200 shadow flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
      @click="registerWith">
      <img :src="logoImg" :alt="'logo ' + app" class="w-5 h-5"/>
      <span class="mx-auto"> {{ label }}</span>
    </button>
</template>
<script setup>
const props = defineProps({
  app: {
    type: String,
    required: true
  }
});
const registerWith = () => {
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
}

import {computed} from 'vue';

const images = import.meta.glob('@/assets/images/app-tierce/*.png', {eager: true});
const logoImg = computed(() => {
  return images[`/src/assets/images/app-tierce/${props.app}.png`]?.default || '';
});

const label = computed(() => {
  return "S'inscrire avec " + props.app.charAt(0).toUpperCase() + props.app.slice(1);
});
</script>
