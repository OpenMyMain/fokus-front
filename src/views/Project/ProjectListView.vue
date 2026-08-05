<template>
  <main class="max-w-4xl mx-auto py-lg">
    <!-- Header -->
    <div class="space-y-md mb-xl">
      <h1 class="font-headline-md text-headline-md md:font-display-lg md:text-display-lg text-on-surface dark:text-slate-100">
        {{ t('projectListView.title') }}
      </h1>
      <p class="font-body-lg text-body-lg text-outline dark:text-slate-400">
        {{ t('projectListView.subtitle') }}
      </p>
    </div>

    <!-- Filters -->
    <div v-if="projectsStore.projects.length > 0" class="mb-lg">
      <p class="font-label-md text-label-md text-outline dark:text-slate-400 mb-sm">
        {{ t('projectListView.filterLabel') }}
      </p>
      <div class="flex flex-wrap gap-sm">
        <button
          @click="selectedTypeId = null"
          :class="[
            'px-3 py-1 rounded-full font-label-md text-label-md transition-all',
            selectedTypeId === null
              ? 'bg-primary text-on-primary dark:bg-blue-500 dark:text-white'
              : 'bg-surface-container text-on-surface-variant dark:bg-slate-700 dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-600'
          ]"
        >
          {{ t('projectListView.filterAll') }}
        </button>
        <button
          v-for="type in availableTypes"
          :key="type.id"
          @click="selectedTypeId = type.id"
          :class="[
            'px-3 py-1 rounded-full font-label-md text-label-md transition-all',
            selectedTypeId === type.id
              ? 'bg-primary text-on-primary dark:bg-blue-500 dark:text-white'
              : 'bg-surface-container text-on-surface-variant dark:bg-slate-700 dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-600'
          ]"
        >
          {{ type.name }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="projectsStore.loading" class="flex justify-center items-center py-xl">
      <span class="material-symbols-outlined animate-spin text-primary dark:text-blue-300 text-[48px]">
        refresh
      </span>
    </div>

    <!-- Empty State -->
    <div v-else-if="projectsStore.projects.length === 0" class="flex justify-center items-center py-xl">
      <div class="glass-card rounded-xl p-6 text-center max-w-md space-y-4">
        <span class="material-symbols-outlined text-[64px] text-outline dark:text-slate-400 block mx-auto">
          folder_open
        </span>
        <h2 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100">
          {{ t('projectListView.emptyTitle') }}
        </h2>
        <p class="font-body-md text-body-md text-on-surface-variant dark:text-slate-300">
          {{ t('projectListView.emptyMessage') }}
        </p>
      </div>
    </div>

    <!-- Projects Grid -->
    <div v-else class="space-y-4">
      <router-link
        v-for="proj in filteredProjects"
        :key="proj.id"
        :to="{ name: 'project_show', params: { id: proj.id } }"
        class="block glass-card rounded-xl p-4 md:p-6 hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100">
                {{ proj.name }}
              </h3>
              <span v-if="proj.projectType" class="inline-block px-2 py-1 bg-primary-container dark:bg-blue-900 text-primary dark:text-blue-200 rounded font-label-sm text-label-sm">
                {{ proj.projectType.name }}
              </span>
            </div>
            <p class="font-body-sm text-body-sm text-outline dark:text-slate-400">
              {{ new Date(proj.created_at).toLocaleDateString(currentLocale) }}
            </p>
          </div>
          <span class="material-symbols-outlined text-outline dark:text-slate-400 text-[24px]">
            chevron_right
          </span>
        </div>
      </router-link>
    </div>

    <!-- Create Project Button (FAB) -->
    <AppFloatButton :aria-label="t('projectListView.createButtonLabel')" @click="openCreateModal">
      +
    </AppFloatButton>

    <!-- Create Project Modal -->
    <AppModal ref="createModal" @validate="submitCreate" @reset="resetForm">
      <template #header>
        <h2>{{ t('projectListView.modalTitle') }}</h2>
      </template>
      <template #body>
        <div class="space-y-4">
          <AppInput
            v-model="projectName"
            type="text"
            :label="t('projectListView.nameLabel')"
            :placeholder="t('projectListView.namePlaceholder')"
            required
            @keyup.enter="submitCreate"
          />
          <AppSelect
            v-model="selectedProjectTypeId"
            :label="t('projectListView.typeLabel')"
            :options="projectTypeOptions"
          />

          <!-- Création d'un type à la volée (option « + Nouveau type » du menu) -->
          <div
            v-if="creatingTypeInline"
            class="space-y-2 rounded-lg border border-outline-variant/60 dark:border-slate-700 p-3"
          >
            <AppInput
              v-model="newTypeName"
              type="text"
              :label="t('projectListView.newTypeLabel')"
              :placeholder="t('projectListView.newTypePlaceholder')"
              @keyup.enter="submitNewType"
            />
            <div class="flex justify-end gap-2">
              <button
                :disabled="savingType"
                @click="cancelNewType"
                class="px-3 py-1.5 rounded-lg font-label-md text-label-md border border-outline-variant dark:border-slate-600 text-on-surface dark:text-slate-100 hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                :disabled="!newTypeName.trim() || savingType"
                @click="submitNewType"
                class="px-3 py-1.5 accent-gradient text-white rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <span v-if="savingType" class="material-symbols-outlined animate-spin text-[18px]">refresh</span>
                <span v-else class="material-symbols-outlined text-[18px]">add</span>
                {{ t('projectListView.createTypeButton') }}
              </button>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button
          :disabled="!projectName.trim() || creating"
          @click="submitCreate"
          class="px-4 py-2 accent-gradient text-white rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="creating" class="material-symbols-outlined animate-spin text-[18px]">
            refresh
          </span>
          <span v-else class="material-symbols-outlined text-[18px]">add</span>
          {{ creating ? t('projectListView.creating') : t('projectListView.submitButton') }}
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
import { ref, onMounted, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProjectsStore } from '@/stores/projects'
import { useProjectTypesStore } from '@/stores/projectTypes'
import { useToast } from '@/composables/useToast'
import { getLocale } from '@/plugins/i18n.js'
import AppModal from '@/components/Common/AppModal.vue'
import AppInput from '@/components/Common/Form/AppInput.vue'
import AppSelect from '@/components/Common/Form/AppSelect.vue'
import AppFloatButton from '@/components/Common/Button/AppFloatButton.vue'

const { t } = useI18n()
const projectsStore = useProjectsStore()
const projectTypesStore = useProjectTypesStore()
const toast = useToast()
const currentLocale = getLocale()

const createModal = ref(null)
const projectName = ref('')
const selectedProjectTypeId = ref('')
const creating = ref(false)
const selectedTypeId = ref(null)

// Création d'un type de projet à la volée depuis le menu déroulant.
const NEW_TYPE_OPTION = '__new__'
const creatingTypeInline = ref(false)
const newTypeName = ref('')
const savingType = ref(false)

const projectTypeOptions = computed(() => [
  { value: '', label: t('projectListView.typeNone') },
  ...projectTypesStore.projectTypes.map(type => ({
    value: type.id,
    label: type.name,
  })),
  { value: NEW_TYPE_OPTION, label: t('projectListView.typeCreateNew') },
])

// Sélectionner « + Nouveau type… » ouvre le champ de création et remet le select à zéro.
watch(selectedProjectTypeId, (value) => {
  if (value === NEW_TYPE_OPTION) {
    creatingTypeInline.value = true
    newTypeName.value = ''
    selectedProjectTypeId.value = ''
  }
})

const submitNewType = async () => {
  const name = newTypeName.value.trim()
  if (!name || savingType.value) return
  try {
    savingType.value = true
    const type = await projectTypesStore.create(name)
    selectedProjectTypeId.value = type.id
    creatingTypeInline.value = false
    newTypeName.value = ''
    toast.success(t('projectListView.typeCreateSuccess'))
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('projectListView.typeCreateError'))
    console.error(err)
  } finally {
    savingType.value = false
  }
}

const cancelNewType = () => {
  creatingTypeInline.value = false
  newTypeName.value = ''
}

const availableTypes = computed(() => {
  const typesMap = new Map()
  projectsStore.projects.forEach(proj => {
    if (proj.projectType && !typesMap.has(proj.projectType.id)) {
      typesMap.set(proj.projectType.id, proj.projectType)
    }
  })
  return Array.from(typesMap.values())
})

const filteredProjects = computed(() => {
  if (selectedTypeId.value === null) {
    return projectsStore.projects
  }
  return projectsStore.projects.filter(proj => proj.projectType?.id === selectedTypeId.value)
})

const openCreateModal = () => {
  createModal.value.open()
}

const closeCreateModal = () => {
  createModal.value.close()
  resetForm()
}

const resetForm = () => {
  projectName.value = ''
  selectedProjectTypeId.value = ''
  creatingTypeInline.value = false
  newTypeName.value = ''
}

const submitCreate = async () => {
  // Pendant la saisie d'un nouveau type, la touche Entrée ne doit pas créer le projet.
  if (creatingTypeInline.value) return
  if (!projectName.value.trim()) {
    toast.warning(t('projectListView.nameRequired'))
    return
  }

  try {
    creating.value = true
    const projectTypeId = selectedProjectTypeId.value || null
    await projectsStore.create(projectName.value.trim(), projectTypeId)
    toast.success(t('projectListView.createSuccess'))
    closeCreateModal()
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('projectListView.createError'))
    console.error(err)
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  projectTypesStore.fetchAll().catch(err => {
    toast.error(err.response?.data?.message || err.message || t('projectListView.loadTypeError'))
  })
  projectsStore.fetchAll().catch(err => {
    toast.error(err.response?.data?.message || err.message || t('projectListView.loadError'))
  })
})
</script>
