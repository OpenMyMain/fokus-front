<template>
  <main class="max-w-3xl mx-auto py-lg">
    <!-- Back Button -->
    <button
      @click="goBack"
      class="mb-lg flex items-center gap-2 text-primary dark:text-blue-300 font-label-md text-label-md hover:text-primary-fixed-dim transition-colors"
      :aria-label="t('taskDetailView.backButtonLabel')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" class="h-4 w-4">
        <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
      </svg>
      {{ t('taskDetailView.backButtonLabel') }}
    </button>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-xl">
      <span class="material-symbols-outlined animate-spin text-primary dark:text-blue-300 text-[48px]">
        refresh
      </span>
    </div>

    <!-- Task Content -->
    <div v-else-if="task" class="glass-card rounded-xl p-4 md:p-6 space-y-lg">
      <!-- ============ Mode lecture ============ -->
      <template v-if="!editing">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 space-y-3">
            <h1
              class="font-headline-md text-headline-md md:font-display-sm md:text-display-sm text-on-surface dark:text-slate-100"
              :class="{ 'line-through text-outline dark:text-slate-500': task.status === 'DONE' }"
            >
              {{ task.title }}
            </h1>
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="inline-block px-2 py-0.5 rounded font-label-sm text-[11px]"
                :class="statusClasses(task.status)"
              >
                {{ t(`taskDetailView.status${capitalize(task.status)}`) }}
              </span>
              <span
                class="inline-block px-2 py-0.5 rounded font-label-sm text-[11px]"
                :class="priorityClasses(task.priority)"
              >
                {{ t(`taskDetailView.priority${capitalize(task.priority)}`) }}
              </span>
              <span v-if="task.dueDate" class="flex items-center gap-1 font-body-xs text-body-xs text-outline dark:text-slate-400">
                <span class="material-symbols-outlined text-[14px]">event</span>
                {{ formatDate(task.dueDate) }}
              </span>
            </div>
          </div>
          <button
            v-if="canEdit"
            @click="startEdit"
            class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-md text-label-md border border-outline-variant dark:border-slate-600 text-on-surface dark:text-slate-100 hover:bg-surface-container transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">edit</span>
            {{ t('common.edit') }}
          </button>
        </div>

        <!-- Description -->
        <section class="space-y-2">
          <h2 class="font-label-lg text-label-lg text-outline dark:text-slate-400">
            {{ t('taskDetailView.descriptionLabel') }}
          </h2>
          <MarkdownRenderer v-if="task.description" :source="task.description" />
          <p v-else class="font-body-md text-body-md text-on-surface-variant dark:text-slate-400 italic">
            {{ t('taskDetailView.noDescription') }}
          </p>
        </section>
      </template>

      <!-- ============ Mode édition ============ -->
      <form v-else class="space-y-4" @submit.prevent="submitEdit">
        <AppInput
          v-model="form.title"
          type="text"
          :label="t('taskDetailView.titleLabel')"
          required
        />
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="app-label">{{ t('taskDetailView.descriptionLabel') }}</label>
            <button
              type="button"
              @click="showPreview = !showPreview"
              class="flex items-center gap-1 font-label-sm text-label-sm text-primary dark:text-blue-300 hover:text-primary-fixed-dim transition-colors"
            >
              <span class="material-symbols-outlined text-[16px]">{{ showPreview ? 'edit' : 'visibility' }}</span>
              {{ showPreview ? t('taskDetailView.editTab') : t('taskDetailView.previewTab') }}
            </button>
          </div>
          <AppTextarea
            v-if="!showPreview"
            v-model="form.description"
            :placeholder="t('taskDetailView.descriptionPlaceholder')"
            :rows="10"
          />
          <div
            v-else
            class="app-input min-h-[16rem] overflow-y-auto"
          >
            <MarkdownRenderer v-if="form.description.trim()" :source="form.description" />
            <p v-else class="font-body-md text-body-md text-on-surface-variant dark:text-slate-400 italic">
              {{ t('taskDetailView.noDescription') }}
            </p>
          </div>
          <p class="mt-1 font-body-xs text-body-xs text-outline dark:text-slate-500">
            {{ t('taskDetailView.markdownHint') }}
          </p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AppSelect
            v-model="form.status"
            :label="t('taskDetailView.statusLabel')"
            :options="statusOptions"
          />
          <AppSelect
            v-model="form.priority"
            :label="t('taskDetailView.priorityLabel')"
            :options="priorityOptions"
          />
          <AppInput
            v-model="form.dueDate"
            type="date"
            :label="t('taskDetailView.dueDateLabel')"
          />
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button
            type="submit"
            :disabled="!form.title.trim() || saving"
            class="px-4 py-2 accent-gradient text-white rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">refresh</span>
            <span v-else class="material-symbols-outlined text-[18px]">check</span>
            {{ saving ? t('taskDetailView.saving') : t('common.save') }}
          </button>
          <button
            type="button"
            :disabled="saving"
            @click="cancelEdit"
            class="px-4 py-2 rounded-lg font-label-md text-label-md border border-outline-variant dark:border-slate-600 text-on-surface dark:text-slate-100 hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('common.cancel') }}
          </button>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useTasksStore } from '@/stores/tasks'
import { useToast } from '@/composables/useToast'
import { getLocale } from '@/plugins/i18n.js'
import AppInput from '@/components/Common/Form/AppInput.vue'
import AppTextarea from '@/components/Common/Form/AppTextarea.vue'
import AppSelect from '@/components/Common/Form/AppSelect.vue'
import MarkdownRenderer from '@/components/Common/MarkdownRenderer.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const tasksStore = useTasksStore()
const toast = useToast()
const currentLocale = getLocale()

const task = ref(null)
const loading = ref(true)
const editing = ref(false)
const saving = ref(false)
const showPreview = ref(false)

const form = reactive({
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: '',
})

// Droits renvoyés par le back dans `_permissions` (voir ShowTaskController) :
// le bouton « Modifier » n'apparaît que si la tâche est effectivement modifiable
// (propriétaire + sprint non clôturé).
const canEdit = computed(() => task.value?._permissions?.includes('TASK_UPDATE') ?? false)

// --- Options ------------------------------------------------------------
const statusOptions = computed(() => [
  { value: 'TODO', label: t('taskDetailView.statusTodo') },
  { value: 'IN_PROGRESS', label: t('taskDetailView.statusIn_progress') },
  { value: 'DONE', label: t('taskDetailView.statusDone') },
])
const priorityOptions = computed(() => [
  { value: 'LOW', label: t('taskDetailView.priorityLow') },
  { value: 'MEDIUM', label: t('taskDetailView.priorityMedium') },
  { value: 'HIGH', label: t('taskDetailView.priorityHigh') },
])

// --- Helpers d'affichage ------------------------------------------------
const isoToDate = (iso) => (iso ? String(iso).slice(0, 10) : null)
const formatDate = (iso) => {
  const d = isoToDate(iso)
  if (!d) return ''
  return new Date(d).toLocaleDateString(currentLocale)
}
// 'IN_PROGRESS' -> 'In_progress' pour composer la clé i18n (statusIn_progress).
const capitalize = (s) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : '')

const statusClasses = (status) => {
  switch (status) {
    case 'DONE':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'IN_PROGRESS':
      return 'bg-primary-container text-primary dark:bg-blue-900 dark:text-blue-200'
    default: // TODO
      return 'bg-surface-container text-on-surface-variant dark:bg-slate-700 dark:text-slate-300'
  }
}
const priorityClasses = (priority) => {
  switch (priority) {
    case 'HIGH':
      return 'bg-error-container text-error dark:bg-red-900 dark:text-red-200'
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    default:
      return 'bg-surface-container text-on-surface-variant dark:bg-slate-700 dark:text-slate-300'
  }
}

// --- Navigation ---------------------------------------------------------
const goBack = () => router.back()

// --- Édition ------------------------------------------------------------
const startEdit = () => {
  form.title = task.value.title ?? ''
  form.description = task.value.description ?? ''
  form.status = task.value.status ?? 'TODO'
  form.priority = task.value.priority ?? 'MEDIUM'
  form.dueDate = isoToDate(task.value.dueDate) ?? ''
  showPreview.value = false
  editing.value = true
}

const cancelEdit = () => {
  editing.value = false
}

const submitEdit = async () => {
  if (!form.title.trim() || saving.value) return
  try {
    saving.value = true
    const updated = await tasksStore.update(task.value.id, {
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || null,
      tags: task.value.tags ?? null,
    })
    task.value = updated
    editing.value = false
    toast.success(t('taskDetailView.updateSuccess'))
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('taskDetailView.updateError'))
    console.error(err)
  } finally {
    saving.value = false
  }
}

// --- Chargement ---------------------------------------------------------
onMounted(async () => {
  try {
    task.value = await tasksStore.fetchOne(route.params.id)
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('taskDetailView.loadError'))
    setTimeout(() => router.back(), 1500)
  } finally {
    loading.value = false
  }
})
</script>
