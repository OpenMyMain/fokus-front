<template>
  <div
    ref="planningContainer"
    class="planning overflow-scroll border border-surface-variant dark:border-slate-700 rounded-lg"
    :style="{
      '--nbQuarters': nbQuarters,
      '--nbDays': nbDays
    }"
  >
    <!-- EMPTY CASE -->
    <div style="grid-row: 1; grid-column: 1/ span 2"></div>

    <!-- LABEL HOUR -->
    <div v-for="label in hourLabels" :key="label.row" class="cell hours" :style="{ gridRow: label.row + ' / span 2' }">
      {{ label.text }}
    </div>

    <!-- LABEL DAYS -->
    <template v-if="isWeekView">
      <template v-for="(day, idx) in dayLabels" :key="idx">
        <div class="cell header rounded-lg" :style="'grid-column:'+ (idx + 3)">
          {{ day }}
        </div>
      </template>
    </template>
    <div v-else class="cell header rounded-lg" style="grid-column:3">
      {{ formatDate(selectedDay) }}
    </div>

    <!-- TIME SLOTS -->
    <div
      v-for="item in positionedOccurrences"
      :key="item.occurrence.id"
      class="cell task relative font-bold"
      :title="item.title"
      :style="{
        'background': item.background,
        'color': item.color,
        'borderColor': item.borderColor,
        '--col': item.column,
        '--row': item.row,
        '--duration': item.occurrence.durationQuarters,
        '--lane': item.lane,
        '--lanes': item.lanes
      }"
    >
      <span class="task-name" :class="{ 'pr-5': isEditing }">{{ item.timeSlot.name }}</span>
      <DeleteTimeSlotOccurrence
        v-if="isEditing"
        :time-slot="item.timeSlot"
        :occurrence="item.occurrence"
        @delete-occurrence="deleteOccurrence(item.timeSlot, item.occurrence)"
      />
    </div>

    <!-- HORIZONTAL BORDER -->
    <div
      v-for="row in halfHourRows"
      :key="row"
      class="border-t border-dashed border-outline dark:border-slate-600"
      :style="{ gridColumn: '2 / span ' + (nbDays + 1), gridRow: row + ' / span 1' }"
    ></div>

    <!-- CURRENT TIME CURSOR -->
    <div
      v-if="cursor"
      class="cursor"
      :style="{
        '--minutes': cursor.minutes,
        'grid-column': cursor.column,
        'grid-row': cursor.row + ' / span 1'
      }">
      <div class="cursor-dashed"
           :style="isWeekView ? {'width': 'calc(100% * '+  todayIndex + ' / ' + (todayIndex + 1) +')'} : {}"></div>
      <div class="cursor-line"
           :style="isWeekView ? {'width': 'calc(100% * 1 / ' + (todayIndex + 1) +')'} : {}"></div>
      <div class="cursor-dot"
           :style="isWeekView ? {'left': 'calc(100% * '+  todayIndex + ' / ' + (todayIndex + 1) +')'}: {}"></div>
    </div>
  </div>
</template>

<style scoped>
.cursor {
  position: relative;
  z-index: 10;
  pointer-events: none;
  display: flex;
  align-items: center;
  top: calc(-9px + (17px / 15 * var(--minutes)));
}

.cursor-dashed {
  border: dashed 1px;
  border-color: var(--color-primary, #192D40);
}

.cursor-line {
  height: 4px;
  background: linear-gradient(to right, rgba(25, 45, 64, 0.87), #192D40);
  width: 100%;
}

.cursor-dot {
  position: absolute;
  left: 5px;
  width: 20px;
  height: 20px;
  background: var(--color-primary, #192D40);
  border-radius: 50%;
}

.planning {
  display: grid;
  grid-template-columns: 65px 20px repeat(var(--nbDays), 1fr);
  grid-template-rows: 40px repeat(var(--nbQuarters), 18px);
  background: var(--color-surface, white);
}

@media (prefers-color-scheme: dark) {
  .planning {
    background: #1e293b;
  }
}

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.header {
  grid-row: 1;
  font-weight: bold;
  border-top: 1px solid var(--color-outline, #999);
  border-bottom: 1px solid var(--color-outline, #999);
  border-right: 1px solid var(--color-outline, #999);
  border-left: 1px solid var(--color-outline, #999);
  margin: 0 5px;
  background: var(--color-surface-container, #f5f5f5);
  color: var(--color-on-surface, #1d1d1d);
}

@media (prefers-color-scheme: dark) {
  .header {
    background: #334155;
    color: #f1f5f9;
    border-color: #64748b;
  }
}

.hours {
  grid-column: 1;
  border-bottom: 1px dashed var(--color-outline, #999);
  color: var(--color-on-surface-variant, #666);
  font-size: 0.75rem;
}

@media (prefers-color-scheme: dark) {
  .hours {
    border-color: #64748b;
    color: #94a3b8;
  }
}

.task {
  border: 1px solid;
  border-radius: 6px;
  grid-column: var(--col);
  grid-row: var(--row) / span var(--duration);
  /* Les occurrences simultanées d'un même jour se partagent la largeur de la colonne :
     sans ça elles se superposent exactement et seule la dernière rendue reste visible. */
  width: calc(100% / var(--lanes, 1) - 8px);
  margin: 2px 0 2px calc(100% / var(--lanes, 1) * var(--lane, 0) + 4px);
  justify-content: flex-start;
  align-items: flex-start;
  padding: 3px 4px;
  overflow: hidden;
  font-size: 0.75rem;
}

.task-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useSwipe } from '@/composables/useSwipe.js'
import { formatDate, formatQuarter, getIndexOfDay, getStartOfWeek, isToday } from '@/utils/dateUtils.js'
import { readableTextColor, shadeColor } from '@/utils/colorUtils.js'
import { useI18n } from 'vue-i18n'
import DeleteTimeSlotOccurrence from '@/components/Planning/DeleteTimeSlotOccurrence.vue'

const { t } = useI18n()

const props = defineProps({
  timeSlots: {
    type: Array,
    required: true,
    default: () => [],
  },
  selectedDay: {
    type: Date,
    required: true,
  },
  isWeekView: {
    type: Boolean,
    required: true,
    default: false,
  },
  isEditing: {
    type: Boolean,
    required: false,
    default: false,
  },
  canSwipe: {
    type: Boolean,
    default: true
  },
})

const emit = defineEmits(['delete-occurrence', 'change-select-day'])

// Fenêtre horaire minimale (06:00 → 20:00). Elle n'est plus une limite : la grille
// s'étend aux occurrences qui sortent de cette plage, sinon un créneau de 05:00 ou de
// 22:00 était placé hors des lignes déclarées et n'apparaissait pas au bon endroit.
const MIN_START_QUARTER = 6 * 4
const MIN_END_QUARTER = 20 * 4

const DEFAULT_SLOT_COLOR = '#cce5ff'

// Rafraîchi chaque minute : sans ça le curseur d'heure courante restait figé à l'heure du montage.
const now = ref(new Date())
let nowTimer = null

const dayLabels = computed(() => [
  t('planningView.dayMonday'),
  t('planningView.dayTuesday'),
  t('planningView.dayWednesday'),
  t('planningView.dayThursday'),
  t('planningView.dayFriday'),
  t('planningView.daySaturday'),
  t('planningView.daySunday'),
])

const indexSelectedDay = computed(() => getIndexOfDay(props.selectedDay))
const todayIndex = computed(() => getIndexOfDay(now.value))
const nbDays = computed(() => (props.isWeekView ? 7 : 1))

// Occurrences réellement affichées : toute la semaine, ou le seul jour sélectionné.
const visibleOccurrences = computed(() => {
  const items = []

  for (const timeSlot of props.timeSlots) {
    for (const occurrence of timeSlot.occurrences ?? []) {
      if (props.isWeekView || occurrence.dayOfWeek === indexSelectedDay.value) {
        items.push({ timeSlot, occurrence })
      }
    }
  }

  return items
})

// Bornes de la grille, arrondies à la demi-heure pour que les libellés d'heures
// (qui couvrent deux quarts) tombent juste.
const startQuarter = computed(() => {
  const starts = visibleOccurrences.value.map(item => item.occurrence.startQuarter)
  return Math.floor(Math.min(MIN_START_QUARTER, ...starts) / 2) * 2
})

const endQuarter = computed(() => {
  const ends = visibleOccurrences.value
    .map(item => item.occurrence.startQuarter + item.occurrence.durationQuarters)
  return Math.ceil(Math.max(MIN_END_QUARTER, ...ends) / 2) * 2
})

// La ligne 1 porte les en-têtes de jours ; le quart `q` occupe donc la ligne `2 + q - startQuarter`.
const nbQuarters = computed(() => endQuarter.value - startQuarter.value + 2)
const rowOfQuarter = quarter => 2 + quarter - startQuarter.value

const hourLabels = computed(() => {
  const labels = []

  for (let quarter = startQuarter.value; quarter < startQuarter.value + nbQuarters.value; quarter += 2) {
    labels.push({ row: rowOfQuarter(quarter), text: formatQuarter(quarter + 1) })
  }

  return labels
})

// Traits de demi-heure, alignés sur le bas de chaque libellé d'heure (le premier
// est donc sous la première demi-heure, pas au milieu).
const halfHourRows = computed(() =>
  hourLabels.value.slice(1).map(label => label.row)
)

/**
 * Répartit les occurrences en « couloirs » à l'intérieur d'une colonne de jour.
 * Toutes les occurrences d'un même paquet de chevauchements partagent le même nombre
 * de couloirs, pour rester alignées entre elles.
 */
function assignLanes(items) {
  const sorted = [...items].sort((a, b) =>
    a.occurrence.startQuarter - b.occurrence.startQuarter
    || a.occurrence.durationQuarters - b.occurrence.durationQuarters
  )

  const positioned = []
  let cluster = []
  let clusterEnd = -1

  const flushCluster = () => {
    const laneEnds = []

    for (const item of cluster) {
      const { startQuarter: start, durationQuarters: duration } = item.occurrence
      let lane = laneEnds.findIndex(end => end <= start)
      if (lane === -1) {
        lane = laneEnds.length
      }
      laneEnds[lane] = start + duration
      item.lane = lane
    }

    for (const item of cluster) {
      item.lanes = laneEnds.length
      positioned.push(item)
    }

    cluster = []
    clusterEnd = -1
  }

  for (const item of sorted) {
    if (cluster.length && item.occurrence.startQuarter >= clusterEnd) {
      flushCluster()
    }
    cluster.push(item)
    clusterEnd = Math.max(clusterEnd, item.occurrence.startQuarter + item.occurrence.durationQuarters)
  }

  if (cluster.length) {
    flushCluster()
  }

  return positioned
}

const positionedOccurrences = computed(() => {
  const byDay = new Map()

  for (const { timeSlot, occurrence } of visibleOccurrences.value) {
    const day = occurrence.dayOfWeek
    if (!byDay.has(day)) {
      byDay.set(day, [])
    }
    byDay.get(day).push({ timeSlot, occurrence })
  }

  const positioned = []

  for (const [day, items] of byDay) {
    for (const item of assignLanes(items)) {
      const background = item.timeSlot.bgColor || DEFAULT_SLOT_COLOR
      const start = formatQuarter(item.occurrence.startQuarter + 1)
      const end = formatQuarter(item.occurrence.startQuarter + item.occurrence.durationQuarters + 1)

      positioned.push({
        ...item,
        column: props.isWeekView ? day + 3 : 3,
        row: rowOfQuarter(item.occurrence.startQuarter),
        background,
        color: readableTextColor(background),
        borderColor: shadeColor(background, -0.25),
        title: `${item.timeSlot.name} · ${start} – ${end}`,
      })
    }
  }

  return positioned
})

const cursor = computed(() => {
  const current = now.value
  const isCurrentPeriod = props.isWeekView
    ? getStartOfWeek(props.selectedDay).getTime() === getStartOfWeek(current).getTime()
    : isToday(props.selectedDay)

  if (!isCurrentPeriod) return null

  const quarter = current.getHours() * 4 + Math.floor(current.getMinutes() / 15)
  if (quarter < startQuarter.value || quarter >= endQuarter.value) return null

  return {
    minutes: current.getMinutes() % 15,
    column: props.isWeekView ? '2/' + (todayIndex.value + 4) : '2 / 4',
    row: rowOfQuarter(quarter),
  }
})

// SWIPE HANDLER
const planningContainer = ref(null)
const swipe = useSwipe()

onMounted(() => {
  nowTimer = setInterval(() => {
    now.value = new Date()
  }, 60_000)

  if (!props.canSwipe) return
  swipe.registerSwipe(planningContainer.value, {
    onSwipeLeft: () => emit('change-select-day', props.isWeekView ? 7 : 1),
    onSwipeRight: () => emit('change-select-day', props.isWeekView ? -7 : -1),
  })
})

onUnmounted(() => {
  clearInterval(nowTimer)
})

function deleteOccurrence(timeSlot, occurrence) {
  emit('delete-occurrence', timeSlot, occurrence)
}
</script>
