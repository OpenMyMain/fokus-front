<template>
  <div ref="calendarContainer" class="overflow-scroll px-4 pb-2">
    <div class="w-full text-center text-body-lg font-label-md text-on-surface dark:text-slate-100 mb-3">
      {{ getMonthName(monday) }}
    </div>

    <div class="flex max-w-screen-lg justify-around mx-auto text-center gap-1">
      <button
        v-for="day in 7"
        :key="day"
        role="option"
        :aria-selected="indexSelected === (day - 1)"
        :aria-label="`Sélectionner ${dayLabels[day - 1]}`"
        tabindex="0"
        class="day cursor-pointer flex flex-col items-center gap-1"
        @click="actualizeSelectedDay(day)"
        :class="getDayClass(day - 1)"
      >
        <span class="day-name font-label-sm text-label-sm">
          {{ dayLabels[day - 1].substring(0, 3) }}
        </span>
        <span class="day-number rounded-full flex justify-center items-center h-10 w-10 text-label-md font-bold transition-all">
          {{ getDayNumber(day - 1) }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.day.selected .day-name {
  color: var(--color-primary, #192D40);
  font-weight: bold;
}

.day.selected .day-number {
  background-color: var(--color-primary, #192D40);
  color: white;
}

.day:not(.selected) .day-number {
  background-color: var(--color-surface-container, #e8eaed);
  color: var(--color-on-surface-variant, #49454e);
}

@media (prefers-color-scheme: dark) {
  .day:not(.selected) .day-number {
    background-color: #334155;
    color: #cbd5e1;
  }

  .day.selected .day-number {
    background-color: #3b82f6;
    color: white;
  }
}
</style>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useSwipe } from '@/composables/useSwipe.js'
import { getIndexOfDay, getMonthName, getStartOfWeek } from '@/utils/dateUtils.js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  searchDay: {
    type: Date,
    default: () => new Date()
  },
  canSwipe: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:searchDay'])

const dayLabels = computed(() => [
  t('planningView.dayMonday'),
  t('planningView.dayTuesday'),
  t('planningView.dayWednesday'),
  t('planningView.dayThursday'),
  t('planningView.dayFriday'),
  t('planningView.daySaturday'),
  t('planningView.daySunday'),
])

const indexSelected = computed(() => {
  return getIndexOfDay(props.searchDay)
})

const monday = computed(() => {
  return getStartOfWeek(props.searchDay)
})

const getDayNumber = (index) => {
  const date = translateDate(monday.value, index)
  return date.getDate()
}

const getDayClass = (day) => {
  const classDay = []
  if (indexSelected.value === day) {
    classDay.push('selected')
  }
  return classDay.join(' ')
}

function actualizeSelectedDay(index) {
  const newDate = translateDate(monday.value, index - 1)
  emit('update:searchDay', newDate)
}

function translateDate(date, days) {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + days)
  return newDate
}

// SWIPE HANDLER
const calendarContainer = ref(null)
const swipe = useSwipe()

onMounted(() => {
  if (!props.canSwipe) return
  swipe.registerSwipe(calendarContainer.value, {
    onSwipeLeft: () => {
      const newDate = translateDate(monday.value, 7)
      emit('update:searchDay', newDate)
    },
    onSwipeRight: () => {
      const newDate = translateDate(monday.value, -7)
      emit('update:searchDay', newDate)
    },
  })
})
</script>
