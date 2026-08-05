<template>
    <login-layout>
      <div class="w-full max-w-[36rem]">

        <app-logo-icon class="mx-auto mt-6"/>

        <main class="px-6 pt-4">
          <h1 class="mb-2 text-on-background dark:text-slate-100">{{ t('forgetPasswordView.title') }}</h1>

          <p class="text-sm text-neutral-500 dark:text-slate-400 mb-4">
            {{ t('forgetPasswordView.description') }}
          </p>

          <send-code />

        </main>
      </div>
    </login-layout>
  </template>
<script setup>
import {useI18n} from 'vue-i18n';
import SendCode from "@/components/Authentification/Forget/SendCodeForm.vue";
import LoginLayout from "@/components/Authentification/Layout/LoginLayout.vue";
import AppLogoIcon from "@/components/AppLogoIcon.vue";

const {t} = useI18n();
</script>
