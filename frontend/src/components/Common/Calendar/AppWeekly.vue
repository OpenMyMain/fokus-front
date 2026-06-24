<template>
  <div ref="calendarContainer" class="overflow-scroll px-4 pb-2">
    <div class="w-full text-center">{{ getMonthName(monday)}}</div>

    <div class="flex max-w-screen-lg justify-around mx-auto text-center">
      <button
          v-for="day in 7"
          :key="day"
          role="option"
          :aria-selected="indexSelected === (day - 1)"
          :aria-label="`Sélectionner ${daysOfWeekShort[day - 1]} ${getDayNumber(day - 1)}`"
          tabindex="0"
          class="day cursor-pointer"
          @click="actualizeSelectedDay(day)"
          v-bind:class="getDayClass(day - 1)"
      >
        <span class="day-name font-bold text-sm mb-1">
          {{ daysOfWeekShort[day - 1] }}
        </span>
        <span class="day-number rounded-full flex justify-center items-center h-10 w-10 text-xl p-1">
          <span>{{ getDayNumber(day - 1) }}</span>
        </span>
      </button>
    </div>
  </div>
</template>
<style>
.day.active .day-name {
  color: white;
}

.day.active .day-number {
  background: white;
  color: black;
}

.day.selected .day-name {
  color: #f54900;
}

.day.selected .day-number {
  background-color: #f54900;
  color: white;
}

.day.workout .day-name {
  color: #f54900;
}

.day.workout .day-number {
  background: #f54900;
  color: white;
}
</style>
<script setup>
import {computed, onMounted, ref} from "vue";
import { useSwipe } from "@/composables/useSwipe.js";
import {daysOfWeekShort, getIndexOfDay, getMonthName, getStartOfWeek} from "@/utils/dateUtils.js";

const props = defineProps({
  searchDay: {
    type: Date,
    default: () => new Date()
  },
  options: {
    type: Array,
    default: () => []
  },
  canSwipe: {
    type: Boolean,
    default: true
  },
  canSelected: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:searchDay']);

const indexSelected = computed(() => {
  return getIndexOfDay(props.searchDay);
});

const monday = computed(() => {
  return getStartOfWeek(props.searchDay);
});

const getDayNumber = (index) => {
  const date = translateDate(monday.value, index);
  return date.getDate();
};

const getDayClass = (day) => {
  const classDay = [];
  if (props.canSelected && indexSelected.value === day) {
    classDay.push('selected');
  }

  // add classDay props.options.find(option => option.day === day)?.type || '';
  const option = props.options.find(option => option.day === day);
  if (option) {
    classDay.push(option.type || '');
  }
  return classDay.join(' ');
};

function actualizeSelectedDay(index) {
  const newDate = translateDate(monday.value, index - 1);
  emit('update:searchDay', newDate);
}

function translateDate(date, days) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

// SWIPE HANDLER
const calendarContainer = ref(null)
const swipe = useSwipe();

onMounted(() => {
  if (!props.canSwipe) return;
  swipe.registerSwipe(calendarContainer.value, {
    onSwipeLeft: () => {
      const newDate = translateDate(monday.value, 7);
      emit('update:searchDay', newDate);
    },
    onSwipeRight: () => {
      const newDate = translateDate(monday.value, -7);
      emit('update:searchDay', newDate);
    },
  });
});

</script>
