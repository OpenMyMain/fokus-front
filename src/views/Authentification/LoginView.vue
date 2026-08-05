<template>
  <login-layout>
    <div class="overflow-scroll flex-grow max-w-[32rem] flex flex-col justify-center">
      <app-logo-icon class="mx-auto" />
      <h1 class="text-center mt-4 text-[18px] text-on-background dark:text-slate-100">{{ t('loginView.greeting') }}</h1>
      <login-form/>
      <template v-if="tierces.length > 0">
        <div class="flex items-center my-4 mx-8">
          <div class="flex-grow border-t border-gray-300 dark:border-slate-700"/>
          <div class="px-4 text-on-surface-variant dark:text-slate-400">{{ t('loginView.or') }}</div>
          <div class="flex-grow border-t border-gray-300 dark:border-slate-700"/>
        </div>
        <div class="flex justify-center mt-4 gap-4">
          <login-with-tierce :app="tierce.app" v-for="tierce in tierces" :key="tierce.app"/>
        </div>
      </template>
      <div class="flex gap-2 mt-4 justify-center text-on-surface-variant dark:text-slate-300">
        <span>{{ t('loginView.noAccount') }}</span>
        <router-link :to="{ name: 'register_methods' }" class="text-blue-500 dark:text-blue-400 hover:underline">
          {{ t('loginView.createAccount') }}
        </router-link>
      </div>
    </div>
  </login-layout>
</template>
<script setup>
import {useI18n} from 'vue-i18n';
import LoginForm from "@/components/Authentification/Login/LoginForm.vue";
import LoginWithTierce from "@/components/Authentification/Login/LoginWithTierce.vue";
import LoginLayout from "@/components/Authentification/Layout/LoginLayout.vue";
import AppLogoIcon from "@/components/AppLogoIcon.vue";
import {oauthProviders} from "@/utils/oauthProviders.js";

const {t} = useI18n();

const tierces = oauthProviders;

</script>
