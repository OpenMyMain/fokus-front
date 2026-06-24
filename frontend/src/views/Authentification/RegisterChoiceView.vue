<template>
  <login-layout>
    <div class="w-full max-w-lg mx-auto my-2">

      <app-logo-icon class="mx-auto mt-2"/>

      <div class="p-4">
        <h1 class="mb-2 text-center">S'inscrire gratuitement</h1>
        <p class="text-sm text-neutral-500 mb-4">Lorem ipsum dolor sit amet, consectetur adipisicing
          elit. Dolorem expedita facilis laborum
          minus quasi unde ut voluptate.</p>

        <template v-if="tierces && tierces.length">
          <div class="flex flex-col gap-2 mb-4">
            <register-with-tierce
              :app="tierce.app" v-for="tierce in tierces"
              v-bind:key="tierce.app"/>
          </div>

          <div class="flex items-center my-4">
            <div class="flex-grow border-t border-gray-300"/>
            <div class="px-4">OR</div>
            <div class="flex-grow border-t border-gray-300"/>
          </div>
        </template>

        <router-link :to="{name: 'register_email'}" type="submit" class="block w-full bg-[#181818] rounded text-white text-center py-2">
          <span class="mx-auto">Sign up  with email</span>
        </router-link>
<!--        <register-form/>-->

        <p class="text-sm text-neutral-700 my-4 text-center">En continuant, vous acceptez nos
          <router-link class="text-neutral-900 underline" to="#">conditions de service</router-link>
          et notre
          <router-link class="text-neutral-900 underline" to="#"> politique de
            confidentialité
          </router-link>
          .
        </p>

        <p class="text-center">Vous êtes déjà membre ?
          <router-link class="underline" :to="{name: 'login'}">Se connecter</router-link>
        </p>
      </div>
    </div>
  </login-layout>


</template>
<script setup>
import RegisterForm from "@/components/Authentification/Register/RegisterForm.vue";
import RegisterWithTierce from "@/components/Authentification/Register/RegisterWithTierce.vue";
import AppLogoIcon from "@/components/AppLogoIcon.vue";
import LoginLayout from "@/components/Authentification/Layout/LoginLayout.vue";
import IconBack from "@/components/icons/IconBack.vue";
import IconClose from "@/components/icons/IconClose.vue";

const tierces = JSON.parse(import.meta.env.VITE_APP_TIERCE);
</script>
