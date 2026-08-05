<template>
  <main class="max-w-6xl mx-auto py-lg">
    <!-- Header -->
    <div class="space-y-md mb-xl">
      <div class="flex items-start justify-between gap-4">
        <h1 class="font-headline-md text-headline-md md:font-display-lg md:text-display-lg text-on-surface dark:text-slate-100">
          {{ t('planningView.title') }}
        </h1>
        <!-- Seul accès mobile aux RDV : la navbar est à quatre onglets et les RDV relèvent
             du même domaine « temps » que le planning. -->
        <router-link
          :to="{ name: 'appointments' }"
          class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant dark:bg-slate-700 dark:text-slate-300 font-label-md text-label-md hover:bg-surface-container-high dark:hover:bg-slate-600 transition-colors"
        >
          <span class="material-symbols-outlined text-[18px]">event</span>
          {{ t('planningView.appointmentsLink') }}
        </router-link>
      </div>
      <p class="font-body-lg text-body-lg text-outline dark:text-slate-400">
        {{ t('planningView.subtitle') }}
      </p>
    </div>

    <!-- Week Selector -->
    <div class="mb-lg">
      <WeekDaySelector
        v-if="searchDay"
        :search-day="searchDay"
        @update:search-day="searchDay = $event"
      />
    </div>

    <!-- View Toggles -->
    <div class="flex flex-wrap gap-2 mb-lg">
      <button
        @click="isWeekView = true"
        :class="[
          'px-3 py-1 rounded-full font-label-md text-label-md transition-all',
          isWeekView
            ? 'bg-primary text-on-primary dark:bg-blue-500 dark:text-white'
            : 'bg-surface-container text-on-surface-variant dark:bg-slate-700 dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-600'
        ]"
      >
        {{ t('planningView.toggleWeek') }}
      </button>
      <button
        @click="isWeekView = false"
        :class="[
          'px-3 py-1 rounded-full font-label-md text-label-md transition-all',
          !isWeekView
            ? 'bg-primary text-on-primary dark:bg-blue-500 dark:text-white'
            : 'bg-surface-container text-on-surface-variant dark:bg-slate-700 dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-600'
        ]"
      >
        {{ t('planningView.toggleDay') }}
      </button>
      <button
        @click="isEditing = !isEditing"
        :class="[
          'px-3 py-1 rounded-full font-label-md text-label-md transition-all',
          isEditing
            ? 'bg-primary text-on-primary dark:bg-blue-500 dark:text-white'
            : 'bg-surface-container text-on-surface-variant dark:bg-slate-700 dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-600'
        ]"
      >
        {{ t('planningView.toggleEditing') }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="timeSlotsStore.loading" class="flex justify-center items-center py-xl">
      <span class="material-symbols-outlined animate-spin text-primary dark:text-blue-300 text-[48px]">
        refresh
      </span>
    </div>

    <!-- Empty State -->
    <div v-else-if="timeSlotsStore.timeSlots.length === 0" class="flex justify-center items-center py-xl">
      <div class="glass-card rounded-xl p-6 text-center max-w-md space-y-4">
        <span class="material-symbols-outlined text-[64px] text-outline dark:text-slate-400 block mx-auto">
          schedule
        </span>
        <h2 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100">
          {{ t('planningView.emptyTitle') }}
        </h2>
        <p class="font-body-md text-body-md text-on-surface-variant dark:text-slate-300">
          {{ t('planningView.emptyMessage') }}
        </p>
      </div>
    </div>

    <!-- Planning Grid -->
    <div v-else class="mb-lg">
      <PlanningGrid
        v-if="searchDay"
        @delete-occurrence="deleteOccurrence"
        :time-slots="timeSlotsStore.timeSlots"
        :selected-day="searchDay"
        :is-week-view="isWeekView"
        :is-editing="isEditing"
        @change-select-day="changeSelectDay"
      />
    </div>

    <!-- Create TimeSlot Button (FAB) -->
    <AppFloatButton :aria-label="t('planningView.createButtonLabel')" @click="openCreateModal">
      +
    </AppFloatButton>

    <!-- Create TimeSlot Modal -->
    <AppModal ref="createModal" @validate="submitCreate" @reset="resetForm">
      <template #header>
        <h2 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100">
          {{ t('planningView.modalTitle') }}
        </h2>
      </template>
      <template #body>
        <div class="space-y-4">
          <AppInput
            v-model="timeSlotName"
            type="text"
            :label="t('planningView.nameLabel')"
            :placeholder="t('planningView.namePlaceholder')"
            required
            @keyup.enter="submitCreate"
          />

          <AppTextarea
            v-model="timeSlotDescription"
            :label="t('planningView.descriptionLabel')"
            :placeholder="t('planningView.descriptionPlaceholder')"
          />

          <div>
            <label class="block font-label-md text-label-md text-on-surface dark:text-slate-100 mb-2">
              {{ t('planningView.colorLabel') }}
            </label>
            <div class="flex gap-2">
              <input
                v-model="timeSlotBgColor"
                type="color"
                class="w-12 h-10 cursor-pointer border border-outline dark:border-slate-600 rounded"
              />
              <AppInput
                v-model="timeSlotBgColor"
                type="text"
                :placeholder="t('planningView.colorPlaceholder')"
                class="flex-1"
              />
            </div>
          </div>

          <AppInput
            v-model="recurrencesStartDate"
            type="date"
            :label="t('planningView.startDateLabel')"
            required
          />

          <div>
            <label class="font-label-md text-label-md text-on-surface dark:text-slate-100 mb-2 block">
              {{ t('planningView.occurrencesLabel') }}
            </label>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <div
                v-for="(occ, idx) in occurrences"
                :key="idx"
                class="flex gap-2 items-end bg-surface-container dark:bg-slate-800 p-3 rounded-lg"
              >
                <AppSelect
                  v-model.number="occurrences[idx].day"
                  :label="t('planningView.dayLabel')"
                  :options="dayOptions"
                  class="flex-1"
                />
                <AppSelect
                  v-model.number="occurrences[idx].startQuarter"
                  :label="t('planningView.startLabel')"
                  :options="quarterOptions"
                  class="flex-1"
                />
                <AppSelect
                  v-model.number="occurrences[idx].durationQuarters"
                  :label="t('planningView.durationLabel')"
                  :options="durationOptions"
                  class="flex-1"
                />
                <button
                  type="button"
                  @click="removeOccurrence(idx)"
                  class="px-2 py-2 bg-error text-white rounded text-sm dark:bg-red-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <button
              type="button"
              @click="addOccurrence"
              class="mt-2 px-3 py-1 bg-primary text-white rounded text-sm font-label-sm dark:bg-blue-600"
            >
              {{ t('planningView.addOccurrence') }}
            </button>
          </div>
        </div>
      </template>
      <template #footer>
        <button
          :disabled="!timeSlotName.trim() || occurrences.length === 0 || creating"
          @click="submitCreate"
          class="px-4 py-2 bg-primary text-white rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 dark:bg-blue-600"
        >
          <span v-if="creating" class="material-symbols-outlined animate-spin text-[18px]">
            refresh
          </span>
          <span v-else class="material-symbols-outlined text-[18px]">add</span>
          {{ creating ? t('planningView.creating') : t('planningView.submitButton') }}
        </button>
        <button
          type="button"
          :disabled="creating"
          @click="closeCreateModal"
          class="px-4 py-2 rounded-lg font-label-md text-label-md border border-outline-variant dark:border-slate-600 text-on-surface dark:text-slate-100 hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ t('common.cancel') }}
        </button>
      </template>
    </AppModal>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTimeSlotsStore } from '@/stores/timeSlots'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm.js'
import { formatQuarter } from '@/utils/dateUtils.js'
import AppModal from '@/components/Common/AppModal.vue'
import AppInput from '@/components/Common/Form/AppInput.vue'
import AppTextarea from '@/components/Common/Form/AppTextarea.vue'
import AppSelect from '@/components/Common/Form/AppSelect.vue'
import AppFloatButton from '@/components/Common/Button/AppFloatButton.vue'
import WeekDaySelector from '@/components/Planning/WeekDaySelector.vue'
import PlanningGrid from '@/components/Planning/PlanningGrid.vue'

const { t } = useI18n()
const timeSlotsStore = useTimeSlotsStore()
const toast = useToast()
const { confirm } = useConfirm()

const createModal = ref(null)
const searchDay = ref(null)
const today = new Date()
const isWeekView = ref(true)
const isEditing = ref(false)

const timeSlotName = ref('')
const timeSlotDescription = ref('')
const timeSlotBgColor = ref('#ad1edd')
const occurrences = ref([{ day: 1, startQuarter: 28, durationQuarters: 4 }])
const creating = ref(false)

function todayAsInputDate() {
  const now = new Date()
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
}

const recurrencesStartDate = ref(todayAsInputDate())

const dayOptions = computed(() => [
  { value: 0, label: t('planningView.dayMonday') },
  { value: 1, label: t('planningView.dayTuesday') },
  { value: 2, label: t('planningView.dayWednesday') },
  { value: 3, label: t('planningView.dayThursday') },
  { value: 4, label: t('planningView.dayFriday') },
  { value: 5, label: t('planningView.daySaturday') },
  { value: 6, label: t('planningView.daySunday') },
])

const quarterOptions = computed(() => {
  const quarters = []
  for (let i = 0; i < 96; i++) {
    quarters.push({ value: i, label: formatQuarter(i + 1) })
  }
  return quarters
})

const durationOptions = computed(() => {
  const durations = []
  for (let i = 1; i <= 16; i++) {
    durations.push({ value: i, label: `${i * 15} min` })
  }
  return durations
})

function changeSelectDay(daysToAdd) {
  if (searchDay.value) {
    const newDate = new Date(searchDay.value)
    newDate.setDate(newDate.getDate() + daysToAdd)
    searchDay.value = newDate
  }
}

function openCreateModal() {
  createModal.value.open()
}

function closeCreateModal() {
  createModal.value.close()
  resetForm()
}

function resetForm() {
  timeSlotName.value = ''
  timeSlotDescription.value = ''
  timeSlotBgColor.value = '#ad1edd'
  occurrences.value = [{ day: 1, startQuarter: 28, durationQuarters: 4 }]
  recurrencesStartDate.value = todayAsInputDate()
}

function addOccurrence() {
  occurrences.value.push({ day: 1, startQuarter: 32, durationQuarters: 4 })
}

function removeOccurrence(idx) {
  occurrences.value.splice(idx, 1)
}

async function submitCreate() {
  if (!timeSlotName.value.trim()) {
    toast.warning(t('planningView.nameRequired'))
    return
  }

  if (occurrences.value.length === 0) {
    toast.warning(t('planningView.occurrencesRequired'))
    return
  }

  try {
    creating.value = true
    const payload = {
      name: timeSlotName.value.trim(),
      description: timeSlotDescription.value.trim() || null,
      bgColor: timeSlotBgColor.value,
      iconBgColor: timeSlotBgColor.value,
    }

    const timeSlot = await timeSlotsStore.create(payload)

    for (const occ of occurrences.value) {
      await timeSlotsStore.addRecurrence(timeSlot.id, {
        dayOfWeek: occ.day,
        startQuarter: occ.startQuarter,
        durationQuarters: occ.durationQuarters,
        startDate: recurrencesStartDate.value,
      })
    }

    toast.success(t('planningView.createSuccess'))
    closeCreateModal()
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('planningView.createError'))
    console.error(err)
  } finally {
    creating.value = false
  }
}

async function deleteOccurrence(timeSlot, occurrence) {
  const confirmed = await confirm({
    title: t('planningView.deleteConfirmTitle'),
    body: t('planningView.deleteConfirm'),
    confirmLabel: t('common.delete'),
    danger: true,
  })

  if (!confirmed) {
    return
  }

  try {
    await timeSlotsStore.deleteOccurrence(occurrence.id)
    toast.success(t('planningView.deleteSuccess'))
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('planningView.deleteError'))
    console.error(err)
  }
}

onMounted(() => {
  searchDay.value = today
  timeSlotsStore.fetchAll().catch(err => {
    toast.error(err.response?.data?.message || err.message || t('planningView.loadError'))
  })
})
</script>
