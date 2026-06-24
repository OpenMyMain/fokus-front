<template>
<router-link :to="{ name: 'logout' }" class="flex gap-2 items-center hover:underline">
  <icon-logout/> <span>Logout</span>
</router-link>
</template>
<script setup lang="ts">
import IconLogout from "@/components/icons/IconLogout.vue";
</script>
