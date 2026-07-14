<template>
  <main class="max-w-4xl mx-auto py-lg">
    <!-- Header -->
    <div class="space-y-md mb-xl">
      <h1 class="font-headline-md text-headline-md md:font-display-lg md:text-display-lg text-on-surface dark:text-slate-100">
        {{ t('habitListView.title') }}
      </h1>
      <p class="font-body-lg text-body-lg text-outline dark:text-slate-400">
        {{ t('habitListView.subtitle') }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="habitsStore.loading" class="flex justify-center items-center py-xl">
      <span class="material-symbols-outlined animate-spin text-primary dark:text-blue-300 text-[48px]">
        refresh
      </span>
    </div>

    <!-- Empty State -->
    <div v-else-if="habitsStore.habits.length === 0" class="flex justify-center items-center py-xl">
      <div class="glass-card rounded-xl p-6 text-center max-w-md space-y-4">
        <span class="material-symbols-outlined text-[64px] text-outline dark:text-slate-400 block mx-auto">
          favorite
        </span>
        <h2 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100">
          {{ t('habitListView.emptyTitle') }}
        </h2>
        <p class="font-body-md text-body-md text-on-surface-variant dark:text-slate-300">
          {{ t('habitListView.emptyMessage') }}
        </p>
      </div>
    </div>

    <!-- Habits Grid -->
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="habit in habitsStore.habits"
        :key="habit.id"
        class="glass-card rounded-xl p-4 md:p-6 hover:shadow-lg transition-shadow"
      >
        <div class="space-y-3">
          <!-- Header -->
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100">
              {{ habit.name }}
            </h3>
            <button
              @click="deleteHabit(habit.id)"
              class="text-outline dark:text-slate-400 hover:text-error dark:hover:text-red-400 transition-colors"
              :aria-label="t('habitListView.deleteConfirm')"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <!-- Description -->
          <p v-if="habit.description" class="font-body-sm text-body-sm text-outline dark:text-slate-400">
            {{ habit.description }}
          </p>

          <!-- Frequency Badge -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-primary dark:text-blue-300">
                schedule
              </span>
              <span class="inline-block px-2 py-1 bg-primary-container dark:bg-blue-900 text-primary dark:text-blue-200 rounded font-label-sm text-label-sm">
                {{ getFrequencyLabel(habit.recurrencePattern) }}
              </span>
            </div>
            <!-- Days indicator for weekly habits -->
            <div v-if="habit.recurrencePattern?.type === 'weekly' && habit.recurrencePattern?.weekDays?.length" class="flex gap-1">
              <div
                v-for="(dayLabel, index) in dayLabels"
                :key="index"
                :class="[
                  'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                  habit.recurrencePattern.weekDays.includes(index)
                    ? 'bg-primary text-on-primary dark:bg-blue-500 dark:text-white'
                    : 'bg-surface-container text-outline dark:bg-slate-700 dark:text-slate-500'
                ]"
              >
                {{ dayLabel.charAt(0) }}
              </div>
            </div>
          </div>

          <!-- Reminder -->
          <div v-if="habit.reminder" class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px] text-on-surface-variant dark:text-slate-400">
              notifications
            </span>
            <span class="font-body-sm text-body-sm text-on-surface-variant dark:text-slate-400">
              {{ habit.reminderTime || 'Rappel activé' }}
            </span>
          </div>

          <!-- Created Date -->
          <p class="font-body-xs text-body-xs text-outline dark:text-slate-500">
            {{ t('common.createdAt') }}: {{ new Date(habit.created_at).toLocaleDateString(currentLocale) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Create Habit Button (FAB) -->
    <AppFloatButton :aria-label="t('habitListView.createButtonLabel')" @click="openCreateModal">
      +
    </AppFloatButton>

    <!-- Create Habit Modal -->
    <AppModal ref="createModal" @validate="submitCreate" @reset="resetForm">
      <template #header>
        <h2>{{ t('habitListView.modalTitle') }}</h2>
      </template>
      <template #body>
        <div class="space-y-4">
          <AppInput
            v-model="habitName"
            type="text"
            :label="t('habitListView.nameLabel')"
            :placeholder="t('habitListView.namePlaceholder')"
            required
            @keyup.enter="submitCreate"
          />

          <AppTextarea
            v-model="habitDescription"
            :label="t('habitListView.descriptionLabel')"
            :placeholder="t('habitListView.descriptionPlaceholder')"
          />

          <AppSelect
            v-model="habitFrequency"
            :label="t('habitListView.frequencyLabel')"
            :options="frequencyOptions"
            required
          />

          <!-- Interval selector -->
          <AppInput
            v-model.number="habitInterval"
            type="number"
            :label="t('habitListView.intervalLabel')"
            :placeholder="t('habitListView.intervalLabel')"
            min="1"
            max="365"
          />
          <p class="text-body-xs text-outline dark:text-slate-400">
            {{ getIntervalText() }}
          </p>

          <!-- Start date selector -->
          <AppInput
            v-model="habitStartDate"
            type="date"
            :label="t('habitListView.startDateLabel')"
            :placeholder="t('habitListView.startDatePlaceholder')"
            required
          />

          <!-- Days of week selector for weekly habits -->
          <div v-if="habitFrequency === 'weekly'" class="space-y-3 p-4 bg-surface-container dark:bg-slate-800 rounded-lg">
            <p class="font-label-md text-label-md text-on-surface dark:text-slate-100">
              {{ t('habitListView.selectDays') }}
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="(dayLabel, index) in dayLabels"
                :key="index"
                type="button"
                @click="toggleDay(index)"
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all',
                  habitWeekDays.includes(index)
                    ? 'bg-primary text-on-primary dark:bg-blue-500 dark:text-white'
                    : 'bg-surface-container-high text-on-surface-variant dark:bg-slate-700 dark:text-slate-400 hover:bg-surface-container-highest'
                ]"
              >
                {{ dayLabel.charAt(0).toUpperCase() }}
              </button>
            </div>
          </div>

          <!-- Month day selector for monthly habits -->
          <div v-else-if="habitFrequency === 'monthly'" class="space-y-3">
            <AppInput
              v-model.number="habitMonthDay"
              type="number"
              :label="t('habitListView.monthDayLabel')"
              :placeholder="t('habitListView.monthDayPlaceholder')"
              min="1"
              max="31"
            />
          </div>

          <!-- Reminder Section -->
          <div class="space-y-3 p-4 bg-surface-container dark:bg-slate-800 rounded-lg">
            <div class="flex items-center gap-2">
              <input
                v-model="habitReminder"
                type="checkbox"
                id="reminder-checkbox"
                class="w-4 h-4 rounded cursor-pointer accent-primary"
              />
              <label for="reminder-checkbox" class="font-label-md text-label-md text-on-surface dark:text-slate-100 cursor-pointer">
                {{ t('habitListView.reminderYes') }}
              </label>
            </div>

            <AppInput
              v-if="habitReminder"
              v-model="habitReminderTime"
              type="time"
              :label="t('habitListView.reminderTimeLabel')"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <button
          :disabled="!habitName.trim() || !habitFrequency || creating"
          @click="submitCreate"
          class="px-4 py-2 accent-gradient text-white rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="creating" class="material-symbols-outlined animate-spin text-[18px]">
            refresh
          </span>
          <span v-else class="material-symbols-outlined text-[18px]">add</span>
          {{ creating ? t('habitListView.creating') : t('habitListView.submitButton') }}
        </button>
        <button
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
import { useHabitsStore } from '@/stores/habits'
import { useToast } from '@/composables/useToast'
import { getLocale } from '@/plugins/i18n.js'
import AppModal from '@/components/Common/AppModal.vue'
import AppInput from '@/components/Common/Form/AppInput.vue'
import AppTextarea from '@/components/Common/Form/AppTextarea.vue'
import AppSelect from '@/components/Common/Form/AppSelect.vue'
import AppFloatButton from '@/components/Common/Button/AppFloatButton.vue'

const { t } = useI18n()
const habitsStore = useHabitsStore()
const toast = useToast()
const currentLocale = getLocale()

const createModal = ref(null)
const habitName = ref('')
const habitDescription = ref('')
const habitFrequency = ref('daily')
const habitInterval = ref(1)
const habitStartDate = ref('')
const habitWeekDays = ref([])
const habitMonthDay = ref(1)
const habitReminder = ref(false)
const habitReminderTime = ref('08:00')
const creating = ref(false)

const dayLabels = computed(() => [
  t('habitListView.dayMonday'),
  t('habitListView.dayTuesday'),
  t('habitListView.dayWednesday'),
  t('habitListView.dayThursday'),
  t('habitListView.dayFriday'),
  t('habitListView.daySaturday'),
  t('habitListView.daySunday'),
])

const frequencyOptions = computed(() => [
  { value: 'daily', label: t('habitListView.frequencyDaily') },
  { value: 'weekly', label: t('habitListView.frequencyWeekly') },
  { value: 'monthly', label: t('habitListView.frequencyMonthly') },
])

const getIntervalText = () => {
  const freq = habitFrequency.value
  const interval = habitInterval.value || 1

  if (freq === 'daily') {
    return interval === 1
      ? t('habitListView.frequencyDaily')
      : `${t('habitListView.frequencyLabel')}: tous les ${interval} ${t('habitListView.intervalDays')}`
  }

  if (freq === 'weekly') {
    return interval === 1
      ? t('habitListView.frequencyWeekly')
      : `${t('habitListView.frequencyLabel')}: toutes les ${interval} ${t('habitListView.intervalWeeks')}`
  }

  if (freq === 'monthly') {
    return interval === 1
      ? t('habitListView.frequencyMonthly')
      : `${t('habitListView.frequencyLabel')}: tous les ${interval} ${t('habitListView.intervalMonths')}`
  }

  return ''
}

const getFrequencyLabel = (recurrencePattern) => {
  if (!recurrencePattern) return t('habitListView.frequencyDaily')

  const type = recurrencePattern.type || recurrencePattern
  const interval = recurrencePattern.interval || 1

  if (type === 'daily') {
    if (interval === 1) {
      return t('habitListView.frequencyDaily')
    }
    return `Tous les ${interval} jours`
  }

  if (type === 'weekly') {
    const baseLabel = interval === 1
      ? t('habitListView.frequencyWeekly')
      : `Toutes les ${interval} semaines`

    if (recurrencePattern.weekDays?.length) {
      const dayLabelsList = dayLabels.value
      const selectedDays = recurrencePattern.weekDays.map(i => dayLabelsList[i]).join(', ')
      return `${baseLabel} (${selectedDays})`
    }
    return baseLabel
  }

  if (type === 'monthly') {
    const baseLabel = interval === 1
      ? t('habitListView.frequencyMonthly')
      : `Tous les ${interval} mois`

    if (recurrencePattern.dayOfMonth) {
      return `${baseLabel} (${recurrencePattern.dayOfMonth})`
    }
    return baseLabel
  }

  return t('habitListView.frequencyDaily')
}

const openCreateModal = () => {
  resetForm()
  createModal.value.open()
}

const closeCreateModal = () => {
  createModal.value.close()
  resetForm()
}

const resetForm = () => {
  habitName.value = ''
  habitDescription.value = ''
  habitFrequency.value = 'daily'
  habitInterval.value = 1
  habitStartDate.value = new Date().toISOString().split('T')[0]
  habitWeekDays.value = []
  habitMonthDay.value = 1
  habitReminder.value = false
  habitReminderTime.value = '08:00'
}

const toggleDay = (dayIndex) => {
  const index = habitWeekDays.value.indexOf(dayIndex)
  if (index > -1) {
    habitWeekDays.value.splice(index, 1)
  } else {
    habitWeekDays.value.push(dayIndex)
  }
  // Trier les jours
  habitWeekDays.value.sort((a, b) => a - b)
}

const submitCreate = async () => {
  if (!habitName.value.trim()) {
    toast.warning(t('habitListView.nameRequired'))
    return
  }

  if (!habitFrequency.value) {
    toast.warning(t('habitListView.frequencyLabel') + ' ' + t('common.required'))
    return
  }

  if (!habitStartDate.value) {
    toast.warning(t('habitListView.startDateLabel') + ' ' + t('common.required'))
    return
  }

  if (habitFrequency.value === 'weekly' && habitWeekDays.value.length === 0) {
    toast.warning(t('habitListView.selectAtLeastOneDay'))
    return
  }

  try {
    creating.value = true
    const payload = {
      name: habitName.value.trim(),
      description: habitDescription.value.trim() || null,
      frequencyType: habitFrequency.value,
      interval: habitInterval.value || 1,
      startDate: habitStartDate.value,
      weekDays: habitFrequency.value === 'weekly' ? habitWeekDays.value : [],
      monthDay: habitFrequency.value === 'monthly' ? habitMonthDay.value : null,
      reminder: habitReminder.value,
      reminderTime: habitReminder.value ? habitReminderTime.value : null,
    }
    await habitsStore.create(payload)
    toast.success(t('habitListView.createSuccess'))
    closeCreateModal()
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('habitListView.createError'))
    console.error(err)
  } finally {
    creating.value = false
  }
}

const deleteHabit = async (id) => {
  if (!confirm(t('habitListView.deleteConfirm'))) {
    return
  }

  try {
    await habitsStore.delete(id)
    toast.success(t('habitListView.deleteSuccess'))
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('habitListView.deleteError'))
    console.error(err)
  }
}

onMounted(() => {
  habitsStore.fetchAll().catch(err => {
    toast.error(err.response?.data?.message || err.message || t('habitListView.loadError'))
  })
})
</script>
