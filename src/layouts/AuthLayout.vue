<template>
  <template v-if="user">
    <app-header/>

    <div class="pt-16 pb-24 md:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen bg-background dark:bg-slate-950">
      <router-view/>
    </div>

    <app-navbar/>

    <quick-add-task-modal/>
  </template>
</template>

<script setup>
import { useRouter } from "vue-router";
import { computed, watchEffect } from "vue";
import { useAuthStore } from "@/stores/auth.js";
import AppHeader from "@/components/Common/AppHeader.vue";
import AppNavbar from "@/components/Common/AppNavbar.vue";
import QuickAddTaskModal from "@/components/Common/QuickAddTaskModal.vue";

const router = useRouter();
const authStore = useAuthStore();

const user = computed(() => authStore.user);
const fetched = computed(() => authStore.isFetched);

// La garde d'entrée est désormais dans `router.beforeEach` (T-40). Ce `watchEffect` reste
// pour le cas qu'une garde de navigation ne couvre pas : la session qui tombe *pendant*
// qu'on est sur un écran (compte désactivé, refresh token expiré → `authStore.reset()`).
// Sans lui, `v-if="user"` laisserait une page vide.
watchEffect(() => {
  if (fetched.value && user.value) return;
  router.replace({ name: 'auth' });
});
</script>
