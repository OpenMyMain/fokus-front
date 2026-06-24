<template>
  <form class="app-form-container" @submit.prevent="handleSubmit">
    <div v-if="errorMsg" class="error-msg-box">
      {{ errorMsg }}
    </div>

    <AppInput type="text" label="Firstname" v-model="firstname" required/>

    <AppInput type="text" label="Lastname" v-model="lastname" required/>

    <AppInput type="text" label="Email" v-model="email" required/>

    <AppInput type="password" label="Password" v-model="password" required/>

    <AppInput type="password" label="Confirm password" v-model="confirmPassword" required/>

    <div class="mt-2">
      <button type="submit">Register</button>
    </div>
  </form>
</template>
<script setup>
import {ref} from 'vue';
import {useRouter} from "vue-router";
import api from "@/plugins/api.js";

import AppInput from "@/components/Common/Form/AppInput.vue";

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
    errorMsg.value = "Passwords do not match!";
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
    errorMsg.value = error.response.data.error.message || 'Registration failed.';
  }
};
</script>
