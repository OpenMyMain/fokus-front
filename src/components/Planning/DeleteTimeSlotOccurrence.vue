<template>
  <button
    @click="deleteOccurrence"
    class="absolute top-0 right-0 py-1 px-2"
    :aria-label="$t ? $t('common.delete') : 'Delete'"
  >
    <span class="material-symbols-outlined text-[18px] text-error dark:text-red-400">close</span>
  </button>
</template>

<script setup>
const props = defineProps({
  timeSlot: {
    type: Object,
    required: true
  },
  occurrence: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete-occurrence'])

function deleteOccurrence() {
  emit('delete-occurrence', props.timeSlot, props.occurrence)
}
</script>
