<template>
  <AppModal ref="modal" @validate="submit" @reset="close">
    <template #header>
      <h2 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100">
        {{ t('quickAdd.title') }}
      </h2>
    </template>
    <template #body>
      <div class="space-y-4">
        <!-- Titre de la tâche -->
        <AppInput
          v-model="taskTitle"
          type="text"
          :label="t('quickAdd.taskLabel')"
          :placeholder="t('quickAdd.taskPlaceholder')"
          required
          @keyup.enter="submit"
        />

        <!-- Choix du projet -->
        <AppSelect
          v-model="selectedProject"
          :label="t('quickAdd.projectLabel')"
          :options="projectOptions"
        />

        <!-- Nom du nouveau projet (à la volée) -->
        <AppInput
          v-if="selectedProject === NEW_PROJECT"
          v-model="newProjectName"
          type="text"
          :label="t('quickAdd.newProjectLabel')"
          :placeholder="t('quickAdd.newProjectPlaceholder')"
        />

        <!-- Niveau d'urgence -->
        <AppSelect
          v-model="priority"
          :label="t('quickAdd.priorityLabel')"
          :options="priorityOptions"
        />

        <!-- Échéance -->
        <AppInput
          v-model="dueDate"
          type="date"
          :label="t('quickAdd.dueDateLabel')"
        />
      </div>
    </template>
    <template #footer>
      <button
        :disabled="!canSubmit || creating"
        @click="submit"
        class="px-4 py-2 accent-gradient text-white rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <span v-if="creating" class="material-symbols-outlined animate-spin text-[18px]">refresh</span>
        <span v-else class="material-symbols-outlined text-[18px]">add</span>
        {{ creating ? t('quickAdd.creating') : t('quickAdd.submit') }}
      </button>
      <button
        :disabled="creating"
        @click="close"
        class="px-4 py-2 rounded-lg font-label-md text-label-md border border-outline-variant dark:border-slate-600 text-on-surface dark:text-slate-100 hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ t('common.cancel') }}
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuickAdd } from '@/composables/useQuickAdd'
import { useToast } from '@/composables/useToast'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'
import AppModal from '@/components/Common/AppModal.vue'
import AppInput from '@/components/Common/Form/AppInput.vue'
import AppSelect from '@/components/Common/Form/AppSelect.vue'

const NEW_PROJECT = '__new__'

const { t } = useI18n()
const { isOpen, close } = useQuickAdd()
const toast = useToast()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()

const modal = ref(null)
const taskTitle = ref('')
const selectedProject = ref('')
const newProjectName = ref('')
const priority = ref('MEDIUM')
const dueDate = ref('')
const creating = ref(false)

const priorityOptions = computed(() => [
  { value: 'LOW', label: t('quickAdd.priorityLow') },
  { value: 'MEDIUM', label: t('quickAdd.priorityMedium') },
  { value: 'HIGH', label: t('quickAdd.priorityHigh') },
])

const projectOptions = computed(() => [
  ...projectsStore.projects.map(p => ({ value: p.id, label: p.name })),
  { value: NEW_PROJECT, label: t('quickAdd.newProjectOption') },
])

const canSubmit = computed(() => {
  if (!taskTitle.value.trim()) return false
  if (selectedProject.value === NEW_PROJECT) return !!newProjectName.value.trim()
  return !!selectedProject.value
})

const resetForm = () => {
  taskTitle.value = ''
  newProjectName.value = ''
  priority.value = 'MEDIUM'
  dueDate.value = ''
  // Présélectionne le premier projet existant, sinon "nouveau projet"
  selectedProject.value = projectsStore.projects[0]?.id ?? NEW_PROJECT
}

// Ouvre/ferme la vraie modale en fonction de l'état partagé
watch(isOpen, async (open) => {
  if (open) {
    if (projectsStore.projects.length === 0) {
      await projectsStore.fetchAll().catch(() => {})
    }
    resetForm()
    modal.value?.open()
  } else {
    modal.value?.close()
  }
})

const submit = async () => {
  if (!canSubmit.value || creating.value) return

  try {
    creating.value = true

    // Création d'un projet à la volée si demandé
    let projectId = selectedProject.value
    if (projectId === NEW_PROJECT) {
      const project = await projectsStore.create(newProjectName.value.trim())
      projectId = project.id
    }

    await tasksStore.create(projectId, {
      title: taskTitle.value.trim(),
      priority: priority.value,
      dueDate: dueDate.value || null,
    })

    toast.success(t('quickAdd.success'))
    close()
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('quickAdd.error'))
    console.error(err)
  } finally {
    creating.value = false
  }
}
</script>
