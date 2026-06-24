<template>
  <form @submit.prevent="resetPassword" class="space-y-4">
    <app-input type="password" label="New password" required v-model="password"/>

    <app-input type="password" label="Confirm password" required v-model="password2"/>

    <button type="submit">
      Change password
    </button>
  </form>
</template>
<script setup>
import {ref} from 'vue';
import AppInput from "@/components/Common/Form/AppInput.vue";

const password = ref('');
const password2 = ref('');

const resetPassword = () => {
  if (password.value !== password2.value) {
    alert('Passwords do not match');
    return;
  }
  // Here you would typically make an API call to reset the password
  console.log('Password reset for:', password.value);
  alert('Password has been changed successfully!');

  window.location.href = '/login';
};
</script>
