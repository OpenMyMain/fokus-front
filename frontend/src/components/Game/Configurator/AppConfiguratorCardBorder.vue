<template>
  <div class="p-2 bg-white">
    <label class="block text-lg font-bold mb-2 text-gray-700">Bordure :</label>
    <div class="flex items-center mb-4">
      <input v-model="modelValue.display" type="checkbox" class="form-checkbox h-5 w-5 text-blue-600 mr-2"/>
      <span class="text-gray-600">Activer la bordure</span>
    </div>
    <div v-if="modelValue.display" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Padding bordure (mm) :</label>
        <input v-model="modelValue.padding" type="number" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Épaisseur de la bordure (px) :</label>
        <input v-model="modelValue.width" type="number" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Couleur de la bordure :</label>
        <input v-model="modelValue.color" type="color" class="w-full h-10 p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
      </div>
    </div>
  </div>
</template>
<script setup>

const modelValue = defineModel({
  type: String,
  default: ''
});

</script>
