<template>
    <login-layout>
      <div class="w-full max-w-xl">

        <app-logo-icon class="mx-auto mt-6"/>

        <main class="px-6 pt-4">
          <h1 class="mb-2">Reset your password</h1>

          <p class="text-sm text-neutral-500 mb-4">
            Enter your user account's verified email address and we will send you a password reset link.
          </p>

          <send-code />

        </main>
      </div>
    </login-layout>
  </template>
<script setup>
import SendCode from "@/components/Authentification/Forget/SendCodeForm.vue";
import LoginLayout from "@/components/Authentification/Layout/LoginLayout.vue";
import AppLogoIcon from "@/components/AppLogoIcon.vue";
</script>
