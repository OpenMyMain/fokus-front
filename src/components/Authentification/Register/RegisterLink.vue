<template>
  <router-link :to="{name: 'register_methods'}">
    <span>{{ t('registerLink.label') }}</span>
  </router-link>
</template>
<script setup>
import {useI18n} from 'vue-i18n';

const {t} = useI18n();
</script>
