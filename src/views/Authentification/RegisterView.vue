<template>
  <login-layout>
    <div class="w-full max-w-[32rem] mx-auto my-2">

      <app-logo-icon class="mx-auto mt-2"/>

      <div class="px-4 py-2">
        <h1 class="mb-2 text-center text-on-background dark:text-slate-100">{{ t('registerView.title') }}</h1>
        <p class="text-sm text-neutral-500 dark:text-slate-400 mb-4">{{ t('registerView.description') }}</p>

        <register-form/>

        <i18n-t keypath="registerView.termsNotice" tag="p" class="text-sm text-neutral-700 dark:text-slate-300 my-4 text-center">
          <template #terms>
            <router-link class="text-neutral-900 dark:text-slate-100 underline" to="#">{{ t('registerView.termsOfService') }}</router-link>
          </template>
          <template #privacy>
            <router-link class="text-neutral-900 dark:text-slate-100 underline" to="#">{{ t('registerView.privacyPolicy') }}</router-link>
          </template>
        </i18n-t>

        <p class="text-center text-on-surface-variant dark:text-slate-300">{{ t('registerView.alreadyMember') }}
          <router-link class="underline" :to="{name: 'login'}">{{ t('registerView.login') }}</router-link>
        </p>
      </div>
    </div>
  </login-layout>
</template>
<script setup>
import {useI18n} from 'vue-i18n';
import AppLogoIcon from "@/components/AppLogoIcon.vue";
import LoginLayout from "@/components/Authentification/Layout/LoginLayout.vue";
import RegisterForm from "@/components/Authentification/Register/RegisterForm.vue";

const {t} = useI18n();
</script>
