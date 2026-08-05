<template>
  <div class="p-4 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-800">
    <h2 class="text-xl font-semibold mb-4">{{ t('kitUiView.title') }}</h2>
    <p class="text-gray-600 dark:text-slate-300">{{ t('kitUiView.placeholder') }}</p>
  </div>

  <div class="mt-6 p-4 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-800">
    <h3 class="text-lg font-semibold mb-2">{{ t('kitUiView.allElementsTitle') }}</h3>
    <ul class="list-disc list-inside text-gray-600 dark:text-slate-300">
      <li>{{ t('kitUiView.elements.fonts') }}</li>
      <li>{{ t('kitUiView.elements.colors') }}</li>
      <li>{{ t('kitUiView.elements.titles') }}</li>
      <li>{{ t('kitUiView.elements.buttons') }}</li>
      <li>{{ t('kitUiView.elements.forms') }}</li>
      <li>{{ t('kitUiView.elements.cards') }}</li>
      <li>{{ t('kitUiView.elements.modals') }}</li>
      <li>{{ t('kitUiView.elements.alerts') }}</li>
      <li>{{ t('kitUiView.elements.notifications') }}</li>
      <li>{{ t('kitUiView.elements.tables') }}</li>
      <li>{{ t('kitUiView.elements.tabs') }}</li>
      <li>{{ t('kitUiView.elements.accordion') }}</li>
      <li>{{ t('kitUiView.elements.icons') }}</li>
      <li>{{ t('kitUiView.elements.badges') }}</li>
      <li>{{ t('kitUiView.elements.navbars') }}</li>
      <li>{{ t('kitUiView.elements.components') }}
        <ul>{{ t('kitUiView.elements.calendars') }}</ul>
      </li>
    </ul>
  </div>

  <!--  Les couleurs -->
  <div class="mt-6 p-4 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-800">
    <h3 class="text-lg font-semibold mb-2">{{ t('kitUiView.colorsTitle') }}</h3>
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col items-center justify-end h-40 rounded-lg overflow-hidden"
           v-for="(hex, color) in colors" :key="color">
        <div class="flex flex-col items-center justify-end h-40 w-full"  v-bind:class="'bg-' + color"></div>
        <div class="flex justify-center gap-4 bg-gray-300/70 dark:bg-slate-600/70 w-full">
          <div class="flex flex-col items-center">
            <span class="text-gray-700 dark:text-slate-300 font-bold">{{ t('kitUiView.colorName') }}</span>
            <span class="text-gray-700 dark:text-slate-300 font-medium">{{ color }}</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-gray-700 dark:text-slate-300 font-bold">{{ t('kitUiView.colorHex') }}</span>
            <span class="text-gray-700 dark:text-slate-300 font-medium">{{ hex }}</span>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!--  Les fonts -->


  <!--  Les titres -->
  <div class="mt-6 p-4 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-800">
    <h3 class="text-lg font-semibold mb-2">{{ t('kitUiView.titlesTitle') }}</h3>
    <div class="space-y-2">
      <h1>{{ t('kitUiView.titleExamples.h1') }}</h1>
      <h2>{{ t('kitUiView.titleExamples.h2') }}</h2>
      <h3>{{ t('kitUiView.titleExamples.h3') }}</h3>
      <h4>{{ t('kitUiView.titleExamples.h4') }}</h4>
      <h5>{{ t('kitUiView.titleExamples.h5') }}</h5>
      <h6>{{ t('kitUiView.titleExamples.h6') }}</h6>
    </div>
  </div>
</template>
<script setup>
import {useI18n} from 'vue-i18n';

const {t} = useI18n();

const colors = {
  'primary': '#124536',
  'primary-dark': '#124536',
  'primary-light': '#124536',
  'secondary': '#124536',
  'secondaryDark': '#124536',
  'secondaryLight': '#124536',
  'success': '#124536',
  'danger': '#124536',
  'warning': '#124536',
  'info': '#124536',
  'light': '#124536',
  'dark': '#124536'
};
</script>
