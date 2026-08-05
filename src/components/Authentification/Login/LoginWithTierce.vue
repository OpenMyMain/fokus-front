<template>
  <button @click="loginWith" type="button" class="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 shadow-sm border p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700" >
    <img :src="logoImg" :alt="'logo ' + app" class="w-6 h-6" />
  </button>
</template>
<script setup>
const props = defineProps({
  app: {
    type: String,
    required: true
  }
});
const loginWith = () => {
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
}

import { computed } from 'vue';

const images = import.meta.glob('@/assets/images/app-tierce/*.png', { eager: true });
const logoImg = computed(() => {
  return images[`/src/assets/images/app-tierce/${props.app}.png`]?.default || '';
});

</script>
