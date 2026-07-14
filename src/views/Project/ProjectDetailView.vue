<template>
  <main class="max-w-4xl mx-auto py-lg">
    <!-- Back Button -->
    <button
      @click="goBack"
      class="mb-lg flex items-center gap-2 text-primary dark:text-blue-300 font-label-md text-label-md hover:text-primary-fixed-dim transition-colors"
      :aria-label="t('projectDetailView.backButtonLabel')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" class="h-4 w-4">
        <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
      </svg>
      {{ t('projectDetailView.backButtonLabel') }}
    </button>

    <!-- Loading State -->
    <div v-if="projectsStore.loading" class="flex justify-center items-center py-xl">
      <span class="material-symbols-outlined animate-spin text-primary dark:text-blue-300 text-[48px]">
        refresh
      </span>
    </div>

    <!-- Project Content -->
    <div v-else-if="projectsStore.project" class="space-y-lg">
      <!-- Header -->
      <div class="space-y-md mb-xl">
        <div class="flex items-center gap-3">
          <h1 class="font-headline-md text-headline-md md:font-display-lg md:text-display-lg text-on-surface dark:text-slate-100">
            {{ projectsStore.project.name }}
          </h1>
          <span v-if="projectsStore.project.projectType" class="inline-block px-3 py-1 bg-primary-container dark:bg-blue-900 text-primary dark:text-blue-200 rounded-full font-label-md text-label-md">
            {{ projectsStore.project.projectType.name }}
          </span>
        </div>
        <p class="font-body-lg text-body-lg text-outline dark:text-slate-400">
          {{ t('projectDetailView.createdAt', { date: new Date(projectsStore.project.created_at).toLocaleDateString(currentLocale) }) }}
        </p>
      </div>

      <!-- Todo List Placeholder -->
      <section class="glass-card rounded-xl p-4 md:p-6 space-y-4">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-primary dark:text-blue-300 text-[28px]">
            task_alt
          </span>
          <h2 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100">
            {{ t('projectDetailView.todoPlaceholderTitle') }}
          </h2>
        </div>
        <p class="font-body-md text-body-md text-on-surface-variant dark:text-slate-300">
          {{ t('projectDetailView.todoPlaceholderMessage') }}
        </p>
      </section>
    </div>
  </main>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useToast } from '@/composables/useToast'
import { getLocale } from '@/plugins/i18n.js'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const projectsStore = useProjectsStore()
const toast = useToast()
const currentLocale = getLocale()

const goBack = () => {
  router.push({ name: 'projects' })
}

onMounted(async () => {
  try {
    await projectsStore.fetchOne(route.params.id)
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('projectDetailView.loadError'))
    setTimeout(() => {
      router.push({ name: 'projects' })
    }, 1500)
  }
})
</script>
