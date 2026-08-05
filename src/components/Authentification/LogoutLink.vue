<template>
<router-link :to="{ name: 'logout' }" class="flex gap-2 items-center hover:underline">
  <icon-logout/> <span>{{ t('logoutLink.label') }}</span>
</router-link>
</template>
<script setup lang="ts">
import {useI18n} from 'vue-i18n';
import IconLogout from "@/components/icons/IconLogout.vue";

const {t} = useI18n();
</script>
