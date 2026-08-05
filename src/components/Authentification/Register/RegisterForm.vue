<template>
  <form class="app-form-container" @submit.prevent="handleSubmit">
    <div v-if="errorMsg" class="error-msg-box">
      {{ errorMsg }}
    </div>

    <AppInput type="text" :label="t('registerForm.firstnameLabel')" v-model="firstname" required/>

    <AppInput type="text" :label="t('registerForm.lastnameLabel')" v-model="lastname" required/>

    <AppInput type="email" :label="t('registerForm.emailLabel')" v-model="email" required autocomplete="email"/>

    <AppInput type="password" :label="t('registerForm.passwordLabel')" v-model="password" required/>

    <AppInput type="password" :label="t('registerForm.confirmPasswordLabel')" v-model="confirmPassword" required/>

    <div class="mt-2">
      <button type="submit" class="primary-btn">{{ t('registerForm.submit') }}</button>
    </div>
  </form>
</template>
<script setup>
import {ref} from 'vue';
import {useRouter} from "vue-router";
import {useI18n} from 'vue-i18n';
import api from "@/plugins/api.js";

import AppInput from "@/components/Common/Form/AppInput.vue";

const {t} = useI18n();
const router = useRouter();

const errorMsg = ref(null);

const firstname = ref('');
const lastname = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const handleSubmit = async (event) => {
  errorMsg.value = null;
  event.preventDefault();
  if (password.value !== confirmPassword.value) {
    errorMsg.value = t('registerForm.passwordMismatch');
    return;
  }
  try {
    await api.post('/users', {
      firstname: firstname.value,
      lastname: lastname.value,
      email: email.value,
      password: password.value,
    });
    await router.push('/login');
  } catch (error) {
    // Optional chaining : sur une erreur réseau ou un 500 sans corps structuré, l'accès
    // direct à error.response.data.error.message lèverait un TypeError et l'utilisateur
    // n'aurait aucun message affiché.
    errorMsg.value = error.response?.data?.error?.message || t('registerForm.genericError');
  }
};
</script>
