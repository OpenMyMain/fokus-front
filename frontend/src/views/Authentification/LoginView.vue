<template>
  <login-layout>
    <div class="overflow-scroll flex-grow  max-w-lg flex flex-col justify-center">
      <app-logo-icon class="mx-auto" />
      <h1 class="text-center mt-4 text-[18px]">Hello, Welcome back !</h1>
      <login-form/>
      <template v-if="tierces.length > 0">
        <div class="flex items-center my-4 mx-8">
          <div class="flex-grow border-t border-gray-300"/>
          <div class="px-4">OR</div>
          <div class="flex-grow border-t border-gray-300"/>
        </div>
        <div class="flex justify-center mt-4 gap-4">
          <login-with-tierce :app="tierce.app" v-for="tierce in tierces" :key="tierce.app"/>
        </div>
      </template>
      <div class="flex gap-2 mt-4 justify-center">
        <span>Don't have an account?</span>
        <router-link :to="{ name: 'register_methods' }" class="text-blue-500 hover:underline">Create
          account
        </router-link>
      </div>
    </div>
  </login-layout>
</template>
<script setup>
import LoginForm from "@/components/Authentification/Login/LoginForm.vue";
import LoginWithTierce from "@/components/Authentification/Login/LoginWithTierce.vue";
import LoginLayout from "@/components/Authentification/Layout/LoginLayout.vue";
import AppLogoIcon from "@/components/AppLogoIcon.vue";

const tierces = JSON.parse(import.meta.env.VITE_APP_TIERCE);

</script>
