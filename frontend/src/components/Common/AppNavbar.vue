<template>
  <nav class="fixed bottom-0 w-full z-50 flex justify-around items-center px-sm pb-4 pt-2 bg-surface shadow-[0_-4px_20px_rgba(15,23,42,0.05)] rounded-t-xl md:hidden">
    <router-link :to="{ name: 'calendar' }" class="flex flex-col items-center justify-center text-outline py-1 hover:text-primary transition-transform duration-150 active:scale-90 scale-95">
      <span class="material-symbols-outlined">calendar_month</span>
      <span class="font-label-md text-label-md">Plan</span>
    </router-link>

    <router-link :to="{ name: 'create_post' }" class="flex flex-col items-center justify-center text-outline py-1 hover:text-primary transition-transform duration-150 active:scale-90 scale-95">
      <span class="material-symbols-outlined">add_circle</span>
      <span class="font-label-md text-label-md">Create</span>
    </router-link>

    <a href="#" class="flex flex-col items-center justify-center text-outline py-1 hover:text-primary transition-transform duration-150 active:scale-90 scale-95">
      <span class="material-symbols-outlined">auto_awesome</span>
      <span class="font-label-md text-label-md">AI Hub</span>
    </a>

    <router-link :to="{ name: 'social_accounts' }" class="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 transition-transform duration-150 active:scale-90 scale-95">
      <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">manage_accounts</span>
      <span class="font-label-md text-label-md">Social</span>
    </router-link>
  </nav>
</template>
