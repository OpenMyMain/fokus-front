<template>
  <login-layout>
    <div class="w-full max-w-[36rem]">

      <app-logo-icon class="mx-auto mt-8"/>

      <main class="px-6 pt-4">
        <template v-if="token && email">
          <h1 class="text-on-background dark:text-slate-100">{{ t('resetPasswordView.title', {email}) }}</h1>

          <reset-password-form :email="email" :token="token"/>
        </template>

        <template v-else>
          <h1 class="text-on-background dark:text-slate-100">{{ t('resetPasswordView.invalidTitle') }}</h1>
          <i18n-t keypath="resetPasswordView.invalidMessage" tag="p" class="text-sm text-neutral-500 dark:text-slate-400 mt-2">
            <template #link>
              <router-link :to="{ name: 'forgot_password' }" class="text-blue-500 dark:text-blue-400 hover:underline">
                {{ t('resetPasswordView.requestNewLink') }}
              </router-link>
            </template>
          </i18n-t>
        </template>
      </main>
    </div>
  </login-layout>
</template>
<script setup>
import {computed} from 'vue';
import {useRoute} from 'vue-router';
import {useI18n} from 'vue-i18n';
import ResetPasswordForm from "@/components/Authentification/Forget/ResetPasswordForm.vue";
import LoginLayout from "@/components/Authentification/Layout/LoginLayout.vue";
import AppLogoIcon from "@/components/AppLogoIcon.vue";

const {t} = useI18n();
const route = useRoute();
const token = computed(() => typeof route.query.token === 'string' ? route.query.token : '');
const email = computed(() => typeof route.query.email === 'string' ? route.query.email : '');
</script>
