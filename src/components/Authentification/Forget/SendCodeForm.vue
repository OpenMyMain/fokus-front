<template>
  <form class="space-y-4 max-w-[28rem] mx-auto" @submit.prevent="sendResetLink">

    <app-input :label="t('sendCodeForm.emailLabel')" type="email" v-model="email" required autocomplete="email"/>

    <button type="submit" class="primary-btn" :disabled="sending">
      {{ sending ? t('sendCodeForm.submitting') : t('sendCodeForm.submit') }}
    </button>
  </form>
</template>
<script setup>
import {ref} from 'vue';
import {useI18n} from 'vue-i18n';
import AppInput from "@/components/Common/Form/AppInput.vue";
import api from "@/plugins/api.js";
import {useToast} from "@/composables/useToast.js";

const {t} = useI18n();
const toast = useToast();

const email = ref('');
const sending = ref(false);

const sendResetLink = async () => {
  sending.value = true;
  try {
    await api.post('reset-password-tokens', { email: email.value });
    toast.success(t('sendCodeForm.successMessage'));
    email.value = '';
  } catch (error) {
    toast.error(error.response?.data?.detail || error.response?.data?.message || t('sendCodeForm.genericError'));
  } finally {
    sending.value = false;
  }
};
</script>
