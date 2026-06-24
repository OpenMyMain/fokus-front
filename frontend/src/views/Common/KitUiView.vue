<template>
  <div class="p-4 border border-gray-300 rounded-lg shadow-sm bg-white">
    <h2 class="text-xl font-semibold mb-4">Kit UI Component</h2>
    <p class="text-gray-600">This is a placeholder for the Kit UI component view.</p>
  </div>

  <div class="mt-6 p-4 border border-gray-300 rounded-lg shadow-sm bg-white">
    <h3 class="text-lg font-semibold mb-2">Tout les element ui</h3>
    <ul class="list-disc list-inside text-gray-600">
      <li>Fonts</li>
      <li>Colors</li>
      <li>Les titres</li>
      <li>Les boutons</li>
      <li>Les formulaires</li>
      <li>Les cartes</li>
      <li>Les modales</li>
      <li>Les alertes</li>
      <li>Les notifications</li>
      <li>Les tableaux</li>
      <li>Les tabs / onglets</li>
      <li>Accordéon</li>
      <li>Les icônes</li>
      <li>Les badges</li>
      <li>Les barres de navigation</li>
      <li>Les components
        <ul>Les calendriers</ul>
      </li>
    </ul>
  </div>

  <!--  Les couleurs -->
  <div class="mt-6 p-4 border border-gray-300 rounded-lg shadow-sm bg-white">
    <h3 class="text-lg font-semibold mb-2">Les couleurs</h3>
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col items-center justify-end h-40 rounded-lg overflow-hidden"
           v-for="(hex, color) in colors" :key="color">
        <div class="flex flex-col items-center justify-end h-40 w-full"  v-bind:class="'bg-' + color"></div>
        <div class="flex justify-center gap-4 bg-gray-300/70 w-full">
          <div class="flex flex-col items-center">
            <span class="text-gray-700 font-bold">Name</span>
            <span class="text-gray-700 font-medium">{{ color }}</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-gray-700 font-bold">HEX</span>
            <span class="text-gray-700 font-medium">{{ hex }}</span>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!--  Les fonts -->


  <!--  Les titres -->
  <div class="mt-6 p-4 border border-gray-300 rounded-lg shadow-sm bg-white">
    <h3 class="text-lg font-semibold mb-2">Les titres</h3>
    <div class="space-y-2">
      <h1>Titre H1 - Exemple</h1>
      <h2>Titre H2 - Exemple</h2>
      <h3>Titre H3 - Exemple</h3>
      <h4>Titre H4 - Exemple</h4>
      <h5>Titre H5 - Exemple</h5>
      <h6>Titre H6 - Exemple</h6>
    </div>
  </div>
</template>
<script setup>
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
