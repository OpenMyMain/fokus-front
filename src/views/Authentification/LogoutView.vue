<template>
  <AppLoader :message="t('logoutView.message')" />
</template>
<script setup>
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import api from "@/plugins/api.js";
import { useAuthStore } from "@/stores/auth.js";
import AppLoader from "@/components/Common/AppLoader.vue";

const { t } = useI18n();
const authStore = useAuthStore();

onMounted(async () => {
  // Le try/catch garantit qu'on se déconnecte localement même si l'appel échoue
  // (API injoignable, session déjà expirée côté serveur) : sinon l'exception
  // interrompt le handler et l'utilisateur reste bloqué sur l'écran de chargement.
  try {
    await api.get('logout');
  } catch {
    // Rien à faire : la déconnexion locale ci-dessous suffit.
  }
  // Indispensable sur mobile : le firewall JWT est stateless, /api/logout n'invalide
  // rien côté serveur. Sans reset() (qui vide le SecureStorage), le rechargement
  // rappellerait loadTokens() et l'utilisateur repartirait connecté avec ses jetons.
  await authStore.reset();
  window.location.href = '/';
});
</script>
