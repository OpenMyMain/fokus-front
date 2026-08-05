<template>
  <form @submit.prevent="resetPassword" class="space-y-4">
    <app-input type="password" :label="t('resetPasswordForm.newPasswordLabel')" required v-model="password" autocomplete="new-password"/>

    <app-input type="password" :label="t('resetPasswordForm.confirmPasswordLabel')" required v-model="password2" autocomplete="new-password"/>

    <button type="submit" class="primary-btn" :disabled="saving">
      {{ saving ? t('resetPasswordForm.submitting') : t('resetPasswordForm.submit') }}
    </button>
  </form>
</template>
<script setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {useI18n} from 'vue-i18n';
import AppInput from "@/components/Common/Form/AppInput.vue";
import api from "@/plugins/api.js";
import {useToast} from "@/composables/useToast.js";

const {t} = useI18n();

const props = defineProps({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
});

const router = useRouter();
const toast = useToast();

const password = ref('');
const password2 = ref('');
const saving = ref(false);

const resetPassword = async () => {
  if (password.value !== password2.value) {
    toast.error(t('resetPasswordForm.mismatchError'));
    return;
  }

  saving.value = true;
  try {
    await api.put('reset-password-tokens', {
      email: props.email,
      token: props.token,
      password: password.value,
    });
    toast.success(t('resetPasswordForm.successMessage'));
    await router.push({name: 'login'});
  } catch (error) {
    toast.error(error.response?.data?.detail || error.response?.data?.message || t('resetPasswordForm.genericError'));
  } finally {
    saving.value = false;
  }
};
</script>
