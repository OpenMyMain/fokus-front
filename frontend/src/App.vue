<template>
  <template v-if="authFetched">
    <router-view/>
  </template>
  <AppLoader v-else/>
</template>

<script setup>
import {computed} from "vue";
import {useAuthStore} from "@/stores/auth.js";
import AppLoader from "@/components/Common/AppLoader.vue";

const authStore = useAuthStore();

const authFetched = computed(() => authStore.isFetched);

async function initializeApp() {
  await authStore.refresh();
}

initializeApp();
</script>
