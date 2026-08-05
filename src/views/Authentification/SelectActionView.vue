<template>
  <login-layout
    :display-picture="true"
    :back-button="false"
  >
    <div class="min-h-fit p-6 rounded-t-3xl relative mt-[-60px] bg-background dark:bg-slate-900 max-w-[32rem] w-full mx-auto shadow-[0_-4px_20px_rgba(15,23,42,0.08)] xl:shadow-none">
      <app-logo-icon class="mx-auto mb-2"/>

      <h1 class="text-center font-headline-md text-headline-md font-bold text-on-background dark:text-slate-100">
        {{ t('selectActionView.title') }}
      </h1>

      <p class="text-center py-5 font-body-md text-body-md text-on-surface-variant dark:text-slate-300">
        {{ t('selectActionView.subtitle') }}
      </p>

      <div class="flex flex-col gap-4 w-full">
        <login-link class="primary-btn"/>
        <register-link class="secondary-btn"/>
      </div>
    </div>
  </login-layout>
</template>
<script setup>
import {useI18n} from 'vue-i18n';
import LoginLayout from "@/components/Authentification/Layout/LoginLayout.vue";

import LoginLink from "@/components/Authentification/Login/LoginLink.vue";
import RegisterLink from "@/components/Authentification/Register/RegisterLink.vue";
import AppLogoIcon from "@/components/AppLogoIcon.vue";

const {t} = useI18n();
</script>
