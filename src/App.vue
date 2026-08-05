<template>
  <template v-if="authFetched">
    <router-view/>
  </template>
  <AppLoader v-else/>
  <ToastContainer />
  <AppConfirmModal />
</template>

<script setup>
import {computed} from "vue";
import {useAuthStore} from "@/stores/auth.js";
import {useDarkMode} from "@/composables/useDarkMode.js";
import AppLoader from "@/components/Common/AppLoader.vue";
import ToastContainer from "@/components/Common/ToastContainer.vue";
import AppConfirmModal from "@/components/Common/AppConfirmModal.vue";

const authStore = useAuthStore();
const { loadDarkMode } = useDarkMode();

const authFetched = computed(() => authStore.isFetched);

async function initializeApp() {
  loadDarkMode();
  // `ensureFetched` et non `refresh` : la garde du routeur demande la même chose au même
  // moment, la promesse est partagée et l'appel à /api/me n'a lieu qu'une fois.
  await authStore.ensureFetched();
}

initializeApp();
</script>
