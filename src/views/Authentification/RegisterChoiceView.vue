<template>
  <login-layout>
    <div class="w-full max-w-[32rem] mx-auto my-2">

      <app-logo-icon class="mx-auto mt-2"/>

      <div class="p-4">
        <h1 class="mb-2 text-center text-on-background dark:text-slate-100">{{ t('registerChoiceView.title') }}</h1>
        <p class="text-sm text-neutral-500 dark:text-slate-400 mb-4">{{ t('registerChoiceView.description') }}</p>

        <template v-if="tierces && tierces.length">
          <div class="flex flex-col gap-2 mb-4">
            <register-with-tierce
              :app="tierce.app" v-for="tierce in tierces"
              v-bind:key="tierce.app"/>
          </div>

          <div class="flex items-center my-4">
            <div class="flex-grow border-t border-gray-300 dark:border-slate-700"/>
            <div class="px-4 text-on-surface-variant dark:text-slate-400">{{ t('registerChoiceView.or') }}</div>
            <div class="flex-grow border-t border-gray-300 dark:border-slate-700"/>
          </div>
        </template>

        <router-link :to="{name: 'register_email'}" type="submit" class="block w-full bg-[#181818] dark:bg-slate-100 rounded text-white dark:text-slate-900 text-center py-2">
          <span class="mx-auto">{{ t('registerChoiceView.signUpWithEmail') }}</span>
        </router-link>
<!--        <register-form/>-->

        <i18n-t keypath="registerChoiceView.termsNotice" tag="p" class="text-sm text-neutral-700 dark:text-slate-300 my-4 text-center">
          <template #terms>
            <router-link class="text-neutral-900 dark:text-slate-100 underline" to="#">{{ t('registerChoiceView.termsOfService') }}</router-link>
          </template>
          <template #privacy>
            <router-link class="text-neutral-900 dark:text-slate-100 underline" to="#">{{ t('registerChoiceView.privacyPolicy') }}</router-link>
          </template>
        </i18n-t>

        <p class="text-center text-on-surface-variant dark:text-slate-300">{{ t('registerChoiceView.alreadyMember') }}
          <router-link class="underline" :to="{name: 'login'}">{{ t('registerChoiceView.login') }}</router-link>
        </p>
      </div>
    </div>
  </login-layout>


</template>
<script setup>
import {useI18n} from 'vue-i18n';
import RegisterForm from "@/components/Authentification/Register/RegisterForm.vue";
import RegisterWithTierce from "@/components/Authentification/Register/RegisterWithTierce.vue";
import AppLogoIcon from "@/components/AppLogoIcon.vue";
import LoginLayout from "@/components/Authentification/Layout/LoginLayout.vue";
import IconBack from "@/components/icons/IconBack.vue";
import IconClose from "@/components/icons/IconClose.vue";
import {oauthProviders} from "@/utils/oauthProviders.js";

const {t} = useI18n();

const tierces = oauthProviders;
</script>
