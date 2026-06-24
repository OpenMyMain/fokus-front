<template>
  <form class="space-y-4 max-w-md mx-auto" @submit.prevent="resetPassword">

    <app-input label="Email" v-model="email" required/>

    <button type="submit">
      Send code
    </button>
  </form>
</template>
<script setup>
import {ref} from 'vue';
import AppInput from "@/components/Common/Form/AppInput.vue";

const email = ref('');

const resetPassword = async () => {
  try {
    // Simulate API call to send password reset email
    console.log(`Sending password reset link to ${email.value}`);
    // Here you would typically call your API service
    // await api.post('/password-reset', { email: email.value });
    alert('Password reset link sent to ' + email.value);
  } catch (error) {
    console.error('Error sending password reset link:', error);
    alert('Failed to send password reset link. Please try again later.');
  }
};
</script>
