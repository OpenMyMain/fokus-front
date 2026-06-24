<template>
  <login-layout>
    <div class="w-full max-w-lg mx-auto my-2">

      <app-logo-icon class="mx-auto mt-2"/>

      <div class="px-4 py-2">
        <h1 class="mb-2 text-center">S'inscrire gratuitement</h1>
        <p class="text-sm text-neutral-500 mb-4">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorem expedita facilis laborum
          minus quasi unde ut voluptate.</p>

        <register-form/>

        <p class="text-sm text-neutral-700 my-4 text-center">En continuant, vous acceptez nos
          <router-link class="text-neutral-900 underline" to="#">conditions de service</router-link>
          et notre
          <router-link class="text-neutral-900 underline" to="#">
            politique de confidentialité
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
import AppLogoIcon from "@/components/AppLogoIcon.vue";
import LoginLayout from "@/components/Authentification/Layout/LoginLayout.vue";
import RegisterForm from "@/components/Authentification/Register/RegisterForm.vue";
</script>
