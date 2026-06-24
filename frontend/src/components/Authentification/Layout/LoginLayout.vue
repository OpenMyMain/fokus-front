<template>
  <div class="flex flex-col lg:flex-row h-screen overflow-hidden">
    <div class="w-full h-full lg:h-screen lg:block lg:w-7/12"
         v-bind:class="{hidden: !displayPicture}">
      <img style="object-position: 0"
           alt="Editor Image"
           class="object-cover h-full w-full"
           src="@/assets/images/login.jpeg"
      />
    </div>
    <div
      v-bind:class="[(displayPicture ? 'h-fit-content' : 'h-screen')]"
      class="relative lg:w-5/12 flex flex-col flex-grow md:justify-center">
      <div v-if="backButton"
           class="fixed top-0 z-10 md:top-4 w-full md:w-fit md:right-6 bg-white shadow md:bg-transparent md:shadow-none flex md:justify-end mb-6">
        <router-link :to="{name:'auth'}" class="block top-0 m4 my-2 w-fit">
          <span class="px-2 py-3 aspect-square flex items-center rounded-full font-bold">
            <icon-back class="md:hidden text-[#181818] w-5 h-5"/>
            <icon-close class="hidden md:block text-[#181818] w-8 h-8"/>
          </span>
        </router-link>
      </div>
      <div
        v-bind:class="[ backButton ? 'with-back-button': 'without-back-button' ]"
        class="relative md:top-0 md:mt-0 lg:px-8 flex justify-center md:items-center">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
<style>
.with-back-button {
  top: 60px;
  height: calc(100svh - 60px);
  overflow: scroll;
}

@media (min-width: 768px) {
  .with-back-button {
    top: 0;
    height: calc(100svh);
  }
}
</style>
<script setup lang="ts">
import IconBack from "@/components/icons/IconBack.vue";
import IconClose from "@/components/icons/IconClose.vue";

const props = defineProps({
  displayPicture: {
    type: Boolean,
    default: false
  },
  backButton: {
    type: Boolean,
    default: true
  }
});
</script>
