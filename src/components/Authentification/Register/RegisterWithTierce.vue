<template>
    <button
      class="w-full bg-gray-200 dark:bg-slate-800 shadow flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition"
      @click="registerWith">
      <img :src="logoImg" :alt="'logo ' + app" class="w-5 h-5"/>
      <span class="mx-auto text-on-background dark:text-slate-100"> {{ label }}</span>
    </button>
</template>
<script setup>
import {computed} from 'vue';
import {useI18n} from 'vue-i18n';

const {t} = useI18n();

const props = defineProps({
  app: {
    type: String,
    required: true
  }
});
const registerWith = () => {
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
}

const images = import.meta.glob('@/assets/images/app-tierce/*.png', {eager: true});
const logoImg = computed(() => {
  return images[`/src/assets/images/app-tierce/${props.app}.png`]?.default || '';
});

const label = computed(() => {
  const network = props.app.charAt(0).toUpperCase() + props.app.slice(1);
  return t('registerWithTierce.signUpWith', {network});
});
</script>
