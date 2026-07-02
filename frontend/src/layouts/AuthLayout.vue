<template>
    <!-- HEADER -->
    <header v-if="!isSocialAccountsPage" class="fixed top-0 left-0 right-0 bg-black shadow-md z-50">
      <div class="flex items-center justify-between px-4 py-3 h-16">
        <!-- Back button -->
        <router-link :to="{name:'login'}" class=" block top-0 left-0 my-2 w-fit">
          <span class="ps-1 py-3 aspect-square flex items-center rounded-full font-bold">
            <icon-back class="text-[#F8F6EE] w-5 h-5" />
          </span>
        </router-link>

        <!-- Logo -->
        <router-link :to="{name: 'home'}" class="text-xl font-bold flex items-center">
          <img src="@/assets/images/logo.png" class="h-14" style="object-position: 0 15px;margin-top: -25px;">
          <span class="text-[#F8F6EE]">MyStudio</span>
        </router-link>

        <!-- Menu burger -->
        <button @click="isOpen = true" class="text-[#F8F6EE] focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- OVERLAY -->
    <div
      v-if="isOpen"
      @click.self="isOpen = false"
      class="fixed inset-0 bg-opacity-40 transition-opacity top-0 bottom-16 z-[100]"
    ></div>

    <!-- DRAWER MENU -->
    <aside
      @click="isOpen = false"
      class="fixed bg-[#f7f7f7] top-16 bottom-16 mt-0.25 right-0 w-full shadow-lg z-[100] transform transition-transform duration-300"
      :class="{ 'translate-x-0': isOpen, 'translate-x-full': !isOpen }"

    >
      <nav class="flex flex-col p-4 space-y-4 relative">
        <router-link :to="{'name' : 'home', query: {'test': 1}}" class="text-gray-700 px-2 py-1 hover:text-blue-600">Accueil</router-link>
        <router-link :to="{'name' : 'home', query: {'test': 2}}" class="text-gray-700 px-2 py-1 hover:text-blue-600">Profil</router-link>
        <router-link :to="{'name' : 'home', query: {'test': 3}}" class="text-gray-700 px-2 py-1 hover:text-blue-600">Messages</router-link>
        <logout-link class="text-gray-700 px-2 py-1 hover:text-blue-600" />
      </nav>
    </aside>

  <router-view v-if="user" :class="isSocialAccountsPage ? '' : 'mt-16 pt-2 pb-20 px-4'" :style="isSocialAccountsPage ? '' : 'min-height: calc(100svh - 64px - 64px)'"/>
  <app-navbar v-if="!isSocialAccountsPage" @click="isOpen = false" />
</template>

<script setup>
import {useRouter, useRoute} from "vue-router";
import {ref, computed, watchEffect} from "vue";
import {useAuthStore} from "@/stores/auth.js";
import AppNavbar from "@/components/Common/AppNavbar.vue";
import LogoutLink from "@/components/Authentification/LogoutLink.vue";
import IconBack from "@/components/icons/IconBack.vue";

const router = useRouter();
const route = useRoute();

const authStore = useAuthStore();

const user = computed(() => authStore.user);
const fetched = computed(() => authStore.isFetched);
const isSocialAccountsPage = computed(() => route.name === 'social_accounts');

watchEffect(() => {
  if (fetched.value && user.value) return;
  router.replace({name: 'auth'});
});

const isOpen = ref(false)
</script>
