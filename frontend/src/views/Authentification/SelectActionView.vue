<template>
  <login-layout
    :display-picture="true"
    :back-button="false"
  >
    <div class="min-h-fit p-5 rounded-t-3xl relative mt-[-60px] bg-[#f4f4f4]">
      <app-logo-icon class="mx-auto mb-2"/>

      <h1 class="text-center">Welcome to Magnum</h1>

      <p class="text-center py-5 text-sm text-[#888888]">
        Lorem ipsum dolor sit amet, consectetur
        adipiscing elit. Nulla eget elementum tortor. Morbi viverra, sem sit amet ullamcorper
        convallis, nibh massa interdum urna, quis facilisis justo sapien nec massa.
      </p>

      <div class="flex flex-col gap-4 w-full">
        <login-link class="primary-btn"/>
        <register-link class="secondary-btn"/>
      </div>
    </div>
  </login-layout>
</template>
<script setup>
import LoginLayout from "@/components/Authentification/Layout/LoginLayout.vue";

import LoginLink from "@/components/Authentification/Login/LoginLink.vue";
import RegisterLink from "@/components/Authentification/Register/RegisterLink.vue";
import AppLogoIcon from "@/components/AppLogoIcon.vue";
</script>
