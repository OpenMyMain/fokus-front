<template>
  <router-link :to="target">
    <span>{{ t('loginLink.label') }}</span>
  </router-link>
</template>
<script setup>
import {computed} from 'vue';
import {useI18n} from 'vue-i18n';
import {useRoute} from 'vue-router';

const {t} = useI18n();
const route = useRoute();

// La garde du routeur dépose `?redirect=` sur /auth quand elle intercepte une URL protégée.
// Sans ce relais, la destination serait perdue en passant par l'écran de choix (T-40).
const target = computed(() => ({
  name: 'login',
  query: route.query.redirect ? {redirect: route.query.redirect} : {},
}));
</script>
