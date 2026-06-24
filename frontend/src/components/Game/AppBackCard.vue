<template>
  <div class="card-container" @click="flipCard" :style="`width: ${width}mm; height: ${height}mm`">
    <div class="card" :class="{ flipped: isFlipped }">
      <div class="card-face card-front">
        <template v-for="i in numbers">
          <template v-if="numberSelected === i" v-for="color in colors">
            <div
              v-if="colorSelected === color.value"
              class="flex"
              :style="`width: ${width}mm; height: ${height}mm;`"
            >
              <div class="relative flex border-2 border-gray-500 m-5 w-full">
                <div class="absolute top-0 left-0 flex justify-center text-2xl px-2"
                     :style="`color: ${color.value}`">
                  <div class="m-auto number">{{ i }}</div>
                </div>

                <div class="absolute top-0 right-0 flex justify-center text-2xl px-2"
                     :style="`color: ${color.value}`">
                  <div class="m-auto number">{{ i }}</div>
                </div>

                <div class="absolute bottom-0 left-0 flex justify-center text-2xl px-2"
                     :style="`transform: rotate(180deg); color: ${color.value}`">
                  <div class="m-auto number">{{ i }}</div>
                </div>

                <div class="absolute bottom-0 right-0 flex justify-center text-2xl px-2"
                     :style="`transform: rotate(180deg); color: ${color.value}`">
                  <div class="m-auto number">{{ i }}</div>
                </div>

                <div
                  class="absolute top-0 left-0 bottom-0 right-0 flex justify-center text-[80px]">
                  <div class="m-auto">
                    <img src="../../assets/images/deck/Pirates/pirate.png" alt="pirate">
                  </div>
                </div>
                <div class="masque w-full h-full" v-bind:style="`background: ${color.value}`"></div>

              </div>
            </div>
          </template>
        </template>
      </div>

      <div class="card-face card-back" style="z-index: 1000">
        <h2>VERSO</h2>
      </div>
    </div>
  </div>

</template>
<script setup>
const props = defineProps({
  game: {
    type: Object,
    required: true,
  },
  width: {
    type: String,
    required: true
  },
  height: {
    type: String,
    required: true
  },
})
</script>
