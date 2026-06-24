<template>
  <login-layout>
    <div class="w-full max-w-xl">

      <app-logo-icon class="mx-auto mt-8"/>

      <main class="px-6 pt-4">
        <h1>Change password for @</h1>

        <reset-password-form/>
      </main>
    </div>
  </login-layout>
</template>
<script setup>
import ResetPasswordForm from "@/components/Authentification/Forget/ResetPasswordForm.vue";
import LoginLayout from "@/components/Authentification/Layout/LoginLayout.vue";
import AppLogoIcon from "@/components/AppLogoIcon.vue";
</script>
