<template>
  <AppLoader message="Déconnexion en cours..." />
</template>
<script setup>
import { onMounted } from 'vue';
import api from "@/plugins/api.js";
import AppLoader from "@/components/Common/AppLoader.vue";

onMounted(async () => {
  await api.get('logout')
  window.location.href = '/';
});
</script>
