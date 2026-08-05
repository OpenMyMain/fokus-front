<template>
  <main class="max-w-4xl mx-auto py-lg">
    <!-- Header -->
    <div class="space-y-md mb-xl">
      <h1 class="font-headline-md text-headline-md md:font-display-lg md:text-display-lg text-on-surface dark:text-slate-100">
        {{ t('appointmentListView.title') }}
      </h1>
      <p class="font-body-lg text-body-lg text-outline dark:text-slate-400">
        {{ t('appointmentListView.subtitle') }}
      </p>
    </div>

    <!-- Filtres de période -->
    <div class="flex flex-wrap gap-2 mb-lg">
      <button
        v-for="option in periodOptions"
        :key="option.value"
        @click="period = option.value"
        :class="[
          'px-3 py-1 rounded-full font-label-md text-label-md transition-all',
          period === option.value
            ? 'bg-primary text-on-primary dark:bg-blue-500 dark:text-white'
            : 'bg-surface-container text-on-surface-variant dark:bg-slate-700 dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-600'
        ]"
      >
        {{ option.label }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="appointmentsStore.loading" class="flex justify-center items-center py-xl">
      <span class="material-symbols-outlined animate-spin text-primary dark:text-blue-300 text-[48px]">
        refresh
      </span>
    </div>

    <!-- Empty State -->
    <div v-else-if="groupedAppointments.length === 0" class="flex justify-center items-center py-xl">
      <div class="glass-card rounded-xl p-6 text-center max-w-md space-y-4">
        <span class="material-symbols-outlined text-[64px] text-outline dark:text-slate-400 block mx-auto">
          event
        </span>
        <h2 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100">
          {{ t('appointmentListView.emptyTitle') }}
        </h2>
        <p class="font-body-md text-body-md text-on-surface-variant dark:text-slate-300">
          {{ period === 'past' ? t('appointmentListView.emptyPastMessage') : t('appointmentListView.emptyMessage') }}
        </p>
      </div>
    </div>

    <!-- Liste groupée par jour -->
    <div v-else class="space-y-xl">
      <section v-for="group in groupedAppointments" :key="group.key" class="space-y-3">
        <h2 class="font-label-lg text-label-lg text-on-surface-variant dark:text-slate-300 capitalize">
          {{ group.label }}
        </h2>

        <article
          v-for="item in group.items"
          :key="item.id"
          class="glass-card rounded-xl p-4 md:p-6 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-start gap-4">
            <!-- Créneau horaire -->
            <div class="shrink-0 text-center">
              <p class="font-headline-sm text-headline-sm text-primary dark:text-blue-300 tabular-nums">
                {{ item.startTime }}
              </p>
              <p v-if="item.endTime" class="font-body-xs text-body-xs text-outline dark:text-slate-500 tabular-nums">
                {{ item.endTime }}
              </p>
            </div>

            <div class="flex-1 min-w-0 space-y-2">
              <div class="flex items-start justify-between gap-2">
                <h3 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100 break-words">
                  {{ item.title }}
                </h3>
                <div class="flex items-center gap-1 shrink-0">
                  <button
                    @click="openEditModal(item)"
                    class="text-outline dark:text-slate-400 hover:text-primary dark:hover:text-blue-300 transition-colors"
                    :aria-label="t('appointmentListView.editButtonLabel')"
                  >
                    <span class="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button
                    @click="removeAppointment(item)"
                    class="text-outline dark:text-slate-400 hover:text-error dark:hover:text-red-400 transition-colors"
                    :aria-label="t('appointmentListView.deleteConfirmTitle')"
                  >
                    <span class="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>

              <p v-if="item.location" class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant dark:text-slate-300">
                <span class="material-symbols-outlined text-[18px] text-outline dark:text-slate-400">place</span>
                {{ item.location }}
              </p>

              <p v-if="item.participants?.length" class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant dark:text-slate-300">
                <span class="material-symbols-outlined text-[18px] text-outline dark:text-slate-400">group</span>
                {{ item.participants.join(', ') }}
              </p>

              <p v-if="item.notes" class="font-body-sm text-body-sm text-outline dark:text-slate-400 whitespace-pre-line">
                {{ item.notes }}
              </p>

              <div class="flex flex-wrap items-center gap-2">
                <span
                  v-if="item.project"
                  class="inline-block px-2 py-1 bg-primary-container dark:bg-blue-900 text-primary dark:text-blue-200 rounded font-label-sm text-label-sm"
                >
                  {{ item.project.name }}
                </span>
                <span
                  v-if="item.reminderMinutesBefore !== null && item.reminderMinutesBefore !== undefined"
                  class="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant dark:text-slate-400"
                  :title="t('appointmentListView.reminderNotYetSent')"
                >
                  <span class="material-symbols-outlined text-[16px]">notifications</span>
                  {{ reminderLabel(item.reminderMinutesBefore) }}
                </span>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>

    <!-- Bouton de création -->
    <AppFloatButton :aria-label="t('appointmentListView.createButtonLabel')" @click="openCreateModal">
      +
    </AppFloatButton>

    <!-- Modale de création / édition : un seul formulaire, l'`editingId` fait la différence.
         `@validate` n'est volontairement pas branché : `AppModal` l'émet sur chaque Entrée
         captée au niveau de la fenêtre, ce qui validerait le formulaire en plein milieu de
         la saisie des notes multilignes. -->
    <AppModal ref="formModal" @reset="resetForm">
      <template #header>
        <h2>{{ editingId ? t('appointmentListView.editTitle') : t('appointmentListView.createTitle') }}</h2>
      </template>
      <template #body>
        <div class="space-y-4">
          <AppInput
            v-model="form.title"
            type="text"
            :label="t('appointmentListView.titleLabel')"
            :placeholder="t('appointmentListView.titlePlaceholder')"
            required
          />

          <AppInput
            v-model="form.date"
            type="date"
            :label="t('appointmentListView.dateLabel')"
            required
          />

          <div class="grid grid-cols-2 gap-3">
            <AppInput
              v-model="form.startTime"
              type="time"
              :label="t('appointmentListView.startTimeLabel')"
              required
            />
            <AppInput
              v-model="form.endTime"
              type="time"
              :label="t('appointmentListView.endTimeLabel')"
            />
          </div>

          <AppInput
            v-model="form.location"
            type="text"
            :label="t('appointmentListView.locationLabel')"
            :placeholder="t('appointmentListView.locationPlaceholder')"
          />

          <AppInput
            v-model="form.participants"
            type="text"
            :label="t('appointmentListView.participantsLabel')"
            :placeholder="t('appointmentListView.participantsPlaceholder')"
          />

          <AppTextarea
            v-model="form.notes"
            :label="t('appointmentListView.notesLabel')"
            :placeholder="t('appointmentListView.notesPlaceholder')"
          />

          <AppSelect
            v-model="form.reminderMinutesBefore"
            :label="t('appointmentListView.reminderLabel')"
            :options="reminderOptions"
          />

          <AppSelect
            v-model="form.projectId"
            :label="t('appointmentListView.projectLabel')"
            :options="projectOptions"
          />
        </div>
      </template>
      <template #footer>
        <button
          :disabled="!canSubmit || saving"
          @click="submitForm"
          class="px-4 py-2 accent-gradient text-white rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">refresh</span>
          <span v-else class="material-symbols-outlined text-[18px]">{{ editingId ? 'save' : 'add' }}</span>
          {{ saving ? t('appointmentListView.saving') : (editingId ? t('common.save') : t('common.add')) }}
        </button>
        <button
          :disabled="saving"
          @click="closeFormModal"
          class="px-4 py-2 rounded-lg font-label-md text-label-md border border-outline-variant dark:border-slate-600 text-on-surface dark:text-slate-100 hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ t('common.cancel') }}
        </button>
      </template>
    </AppModal>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppointmentsStore } from '@/stores/appointments.js'
import { useProjectsStore } from '@/stores/projects.js'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm.js'
import { getLocale } from '@/plugins/i18n.js'
import AppModal from '@/components/Common/AppModal.vue'
import AppInput from '@/components/Common/Form/AppInput.vue'
import AppTextarea from '@/components/Common/Form/AppTextarea.vue'
import AppSelect from '@/components/Common/Form/AppSelect.vue'
import AppFloatButton from '@/components/Common/Button/AppFloatButton.vue'

const { t } = useI18n()
const appointmentsStore = useAppointmentsStore()
const projectsStore = useProjectsStore()
const toast = useToast()
const { confirm } = useConfirm()
const currentLocale = getLocale()

const formModal = ref(null)
const editingId = ref(null)
const saving = ref(false)
const period = ref('upcoming')

const form = ref(emptyForm())

function emptyForm() {
  return {
    title: '',
    date: '',
    startTime: '09:00',
    endTime: '',
    location: '',
    participants: '',
    notes: '',
    reminderMinutesBefore: '',
    projectId: '',
  }
}

const periodOptions = computed(() => [
  { value: 'upcoming', label: t('appointmentListView.periodUpcoming') },
  { value: 'past', label: t('appointmentListView.periodPast') },
  { value: 'all', label: t('appointmentListView.periodAll') },
])

const reminderOptions = computed(() => [
  { value: '', label: t('appointmentListView.reminderNone') },
  ...[5, 10, 15, 30, 60, 120, 1440].map(minutes => ({
    value: String(minutes),
    label: reminderLabel(minutes),
  })),
])

const projectOptions = computed(() => [
  { value: '', label: t('appointmentListView.projectNone') },
  ...projectsStore.projects.map(project => ({ value: project.id, label: project.name })),
])

const canSubmit = computed(() => Boolean(form.value.title.trim() && form.value.date && form.value.startTime))

/**
 * Le backend n'a aucune notion de fuseau de l'utilisateur : l'heure saisie est stockée et
 * renvoyée telle quelle (`2026-08-03T09:30:00+00:00`). La lire avec `new Date()` puis
 * l'afficher en heure locale décalerait de l'offset du navigateur — un RDV de 9 h 30
 * s'afficherait à 11 h 30 à Paris. On extrait donc les composants de la chaîne et on
 * reconstruit une date *locale*, comme le fait déjà `HabitListView` pour l'heure de rappel.
 */
function parseWallClock(value) {
  const match = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/)
  if (!match) return null

  const [, year, month, day, hours, minutes] = match
  return {
    dateKey: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
    date: new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes)),
  }
}

function todayKey() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function reminderLabel(minutes) {
  if (minutes === null || minutes === undefined || minutes === '') {
    return t('appointmentListView.reminderNone')
  }
  if (minutes % 1440 === 0) {
    return t('appointmentListView.reminderDays', { count: minutes / 1440 })
  }
  if (minutes % 60 === 0) {
    return t('appointmentListView.reminderHours', { count: minutes / 60 })
  }
  return t('appointmentListView.reminderMinutes', { count: minutes })
}

/** Les RDV, décorés de leur heure murale et regroupés par jour dans l'ordre d'affichage. */
const groupedAppointments = computed(() => {
  const decorated = appointmentsStore.appointments
    .map((item) => {
      const start = parseWallClock(item.startAt)
      const end = parseWallClock(item.endAt)
      if (!start) return null

      return {
        ...item,
        dateKey: start.dateKey,
        date: start.date,
        startTime: start.time,
        endTime: end?.time ?? null,
      }
    })
    .filter(Boolean)

  // Les passés se lisent du plus récent au plus ancien ; le reste, chronologiquement.
  decorated.sort((a, b) => (period.value === 'past' ? b.date - a.date : a.date - b.date))

  const groups = []
  for (const item of decorated) {
    const last = groups[groups.length - 1]
    if (last && last.key === item.dateKey) {
      last.items.push(item)
      continue
    }
    groups.push({ key: item.dateKey, label: formatDayLabel(item.date), items: [item] })
  }

  return groups
})

function formatDayLabel(date) {
  return date.toLocaleDateString(currentLocale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Bornes envoyées au backend selon la période choisie (inclusives des deux côtés). */
function rangeParams() {
  if (period.value === 'upcoming') return { from: todayKey() }
  if (period.value === 'past') return { to: todayKey() }
  return {}
}

async function loadAppointments() {
  try {
    await appointmentsStore.fetchAll(rangeParams())
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('appointmentListView.loadError'))
  }
}

function openCreateModal() {
  editingId.value = null
  form.value = { ...emptyForm(), date: todayKey() }
  formModal.value.open()
}

function openEditModal(item) {
  const start = parseWallClock(item.startAt)
  const end = parseWallClock(item.endAt)

  editingId.value = item.id
  form.value = {
    title: item.title ?? '',
    date: start?.dateKey ?? todayKey(),
    startTime: start?.time ?? '09:00',
    endTime: end?.time ?? '',
    location: item.location ?? '',
    participants: (item.participants ?? []).join(', '),
    notes: item.notes ?? '',
    reminderMinutesBefore: item.reminderMinutesBefore === null || item.reminderMinutesBefore === undefined
      ? ''
      : String(item.reminderMinutesBefore),
    projectId: item.project?.id ?? '',
  }
  formModal.value.open()
}

function closeFormModal() {
  formModal.value.close()
  resetForm()
}

function resetForm() {
  editingId.value = null
  form.value = emptyForm()
}

function buildPayload() {
  const participants = form.value.participants
    .split(',')
    .map(name => name.trim())
    .filter(Boolean)

  return {
    title: form.value.title.trim(),
    startAt: `${form.value.date} ${form.value.startTime}`,
    endAt: form.value.endTime ? `${form.value.date} ${form.value.endTime}` : null,
    location: form.value.location.trim() || null,
    notes: form.value.notes.trim() || null,
    participants: participants.length ? participants : null,
    // Le backend valide `?int` strictement : une chaîne « 30 » serait rejetée en 422.
    reminderMinutesBefore: form.value.reminderMinutesBefore === ''
      ? null
      : Number(form.value.reminderMinutesBefore),
    projectId: form.value.projectId || null,
  }
}

async function submitForm() {
  if (!canSubmit.value) {
    toast.warning(t('appointmentListView.titleAndDateRequired'))
    return
  }

  // Le backend refuse déjà `endAt <= startAt` (422) : on le dit ici en clair, sur la
  // même journée, plutôt que de laisser remonter une erreur de validation brute.
  if (form.value.endTime && form.value.endTime <= form.value.startTime) {
    toast.warning(t('appointmentListView.endBeforeStart'))
    return
  }

  try {
    saving.value = true
    if (editingId.value) {
      await appointmentsStore.update(editingId.value, buildPayload())
      toast.success(t('appointmentListView.updateSuccess'))
    } else {
      await appointmentsStore.create(buildPayload())
      toast.success(t('appointmentListView.createSuccess'))
    }
    closeFormModal()
    // Un RDV déplacé peut sortir de la période affichée : on relit la plage courante
    // plutôt que de laisser une carte au mauvais endroit.
    await loadAppointments()
  } catch (err) {
    toast.error(err.response?.data?.detail || err.response?.data?.message || err.message || t('appointmentListView.saveError'))
    console.error(err)
  } finally {
    saving.value = false
  }
}

async function removeAppointment(item) {
  const confirmed = await confirm({
    title: t('appointmentListView.deleteConfirmTitle'),
    body: t('appointmentListView.deleteConfirm', { title: item.title }),
    confirmLabel: t('common.delete'),
    danger: true,
  })

  if (!confirmed) return

  try {
    await appointmentsStore.delete(item.id)
    toast.success(t('appointmentListView.deleteSuccess'))
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('appointmentListView.deleteError'))
    console.error(err)
  }
}

watch(period, loadAppointments)

onMounted(() => {
  loadAppointments()
  // Les projets alimentent le select de rattachement ; leur absence ne doit pas empêcher
  // de créer un RDV, qui n'a pas besoin de projet.
  projectsStore.fetchAll().catch(err => console.error(err))
})
</script>
