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

      <!-- Backlog -->
      <section class="glass-card rounded-xl p-4 md:p-6 space-y-4">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary dark:text-blue-300 text-[28px]">inbox</span>
            <h2 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100">
              {{ t('projectDetailView.backlogTitle') }}
            </h2>
          </div>
          <button
            @click="openCreateTaskModal"
            class="flex items-center gap-1.5 px-3 py-1.5 accent-gradient text-white rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity"
          >
            <span class="material-symbols-outlined text-[18px]">add</span>
            {{ t('projectDetailView.addTask') }}
          </button>
        </div>

        <p v-if="backlogTasks.length === 0" class="font-body-md text-body-md text-on-surface-variant dark:text-slate-300 py-4 text-center">
          {{ t('projectDetailView.noBacklogTasks') }}
        </p>

        <ul v-else class="space-y-2">
          <TaskCard
            v-for="task in backlogTasks"
            :key="task.id"
            :task="task"
            :lots="allLots"
            :current-lot-id="null"
            @toggle="toggleDone"
            @delete="deleteTask"
            @move="moveTask"
          />
        </ul>
      </section>

      <!-- Sprints -->
      <section class="space-y-4">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary dark:text-blue-300 text-[28px]">rocket_launch</span>
            <h2 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100">
              {{ t('projectDetailView.sprintsTitle') }}
            </h2>
          </div>
          <button
            @click="openCreateSprintModal"
            class="flex items-center gap-1.5 px-3 py-1.5 accent-gradient text-white rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity"
          >
            <span class="material-symbols-outlined text-[18px]">add</span>
            {{ t('projectDetailView.addSprint') }}
          </button>
        </div>

        <p v-if="sprintsStore.sprints.length === 0" class="glass-card rounded-xl p-6 font-body-md text-body-md text-on-surface-variant dark:text-slate-300 text-center">
          {{ t('projectDetailView.noSprints') }}
        </p>

        <!-- Sprint card -->
        <article
          v-for="sprint in sprintsStore.sprints"
          :key="sprint.id"
          class="glass-card rounded-xl p-4 md:p-6 space-y-4"
        >
          <!-- Sprint header -->
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100 truncate">
                  {{ sprint.name }}
                </h3>
                <!-- Badge cliquable : ouvre le menu des transitions autorisées ;
                     statut sans transition possible (COMPLETED) → simple badge -->
                <div v-if="sprintTransitions(sprint.status).length" class="relative">
                  <button
                    @click.stop="toggleStatusMenu(sprint.id)"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-[11px] hover:opacity-80 transition-opacity"
                    :class="sprintStatusClasses(sprint.status)"
                    :aria-label="t('projectDetailView.changeStatus')"
                    :aria-expanded="statusMenuSprintId === sprint.id"
                  >
                    {{ sprintStatusLabel(sprint.status) }}
                    <span class="material-symbols-outlined text-[14px]">expand_more</span>
                  </button>

                  <div
                    v-if="statusMenuSprintId === sprint.id"
                    class="absolute left-0 top-7 z-20 w-44 glass-card rounded-lg py-1 shadow-lg"
                    role="menu"
                  >
                    <button
                      v-for="transition in sprintTransitions(sprint.status)"
                      :key="transition.key"
                      @click.stop="startTransition(sprint, transition.key)"
                      class="w-full text-left px-3 py-2 font-body-sm text-body-sm text-on-surface dark:text-slate-100 hover:bg-surface-container dark:hover:bg-slate-700/60 transition-colors flex items-center gap-2"
                      role="menuitem"
                    >
                      <span class="material-symbols-outlined text-[16px] text-primary dark:text-blue-300">
                        {{ transition.icon }}
                      </span>
                      <span class="truncate">{{ transition.label }}</span>
                    </button>
                  </div>
                </div>
                <span
                  v-else
                  class="inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-[11px]"
                  :class="sprintStatusClasses(sprint.status)"
                >
                  {{ sprintStatusLabel(sprint.status) }}
                </span>
              </div>
              <p class="flex items-center gap-1 font-body-sm text-body-sm text-outline dark:text-slate-400">
                <span class="material-symbols-outlined text-[14px]">date_range</span>
                {{ sprintDateRange(sprint) }}
              </p>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button
                @click="openCreateLotModal(sprint)"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-md text-label-md border border-outline-variant dark:border-slate-600 text-on-surface dark:text-slate-100 hover:bg-surface-container transition-colors"
              >
                <span class="material-symbols-outlined text-[18px]">create_new_folder</span>
                {{ t('projectDetailView.addLot') }}
              </button>
              <button
                @click="deleteSprint(sprint)"
                class="p-1.5 text-outline dark:text-slate-400 hover:text-error dark:hover:text-red-400 transition-colors"
                :aria-label="t('projectDetailView.deleteSprint')"
              >
                <span class="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
          </div>

          <!-- Lots -->
          <p v-if="(sprint.lots ?? []).length === 0" class="font-body-md text-body-md text-on-surface-variant dark:text-slate-300 py-2 pl-1">
            {{ t('projectDetailView.noLots') }}
          </p>

          <div
            v-for="lot in sprint.lots"
            :key="lot.id"
            class="rounded-lg border border-outline-variant/60 dark:border-slate-700 p-3 space-y-3"
          >
            <div class="flex items-center justify-between gap-3">
              <button
                @click="toggleLot(lot.id)"
                class="flex items-center gap-2 min-w-0 flex-1 text-left"
                :aria-expanded="!isLotCollapsed(lot.id)"
              >
                <span class="material-symbols-outlined text-outline dark:text-slate-400 text-[20px] transition-transform" :class="{ '-rotate-90': isLotCollapsed(lot.id) }">
                  expand_more
                </span>
                <span class="material-symbols-outlined text-outline dark:text-slate-400 text-[20px]">folder</span>
                <h4 class="font-label-lg text-label-lg text-on-surface dark:text-slate-100 truncate">
                  {{ lot.name }}
                </h4>
                <span v-if="lotProgress(lot.id).total" class="font-body-xs text-body-xs text-outline dark:text-slate-500 shrink-0">
                  ({{ lotProgress(lot.id).done }}/{{ lotProgress(lot.id).total }})
                </span>
              </button>
              <button
                @click="deleteLot(lot)"
                class="shrink-0 p-1 text-outline dark:text-slate-400 hover:text-error dark:hover:text-red-400 transition-colors"
                :aria-label="t('projectDetailView.deleteLot')"
              >
                <span class="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>

            <!-- Barre d'avancement fine (juste un filet quand le lot est replié) -->
            <div
              v-if="lotProgress(lot.id).total"
              class="rounded-full bg-surface-container dark:bg-slate-700 overflow-hidden transition-all duration-300"
              :class="isLotCollapsed(lot.id) ? 'h-0.5' : 'h-1'"
            >
              <div
                class="h-full accent-gradient transition-all duration-300"
                :style="{ width: `${lotProgress(lot.id).percent}%` }"
              ></div>
            </div>

            <template v-if="!isLotCollapsed(lot.id)">
              <p v-if="lotTasks(lot.id).length === 0" class="font-body-sm text-body-sm text-on-surface-variant dark:text-slate-400 pl-1">
                {{ t('projectDetailView.noLotTasks') }}
              </p>
              <ul v-else class="space-y-2">
                <TaskCard
                  v-for="task in lotTasks(lot.id)"
                  :key="task.id"
                  :task="task"
                  :lots="allLots"
                  :current-lot-id="lot.id"
                  :locked="sprint.status === 'COMPLETED'"
                  @toggle="toggleDone"
                  @delete="deleteTask"
                  @move="moveTask"
                />
              </ul>
            </template>
          </div>
        </article>
      </section>
    </div>

    <!-- Create Task Modal -->
    <AppModal ref="createTaskModal" @validate="submitCreateTask" @reset="resetTaskForm">
      <template #header>
        <h2 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100">
          {{ t('projectDetailView.addTask') }}
        </h2>
      </template>
      <template #body>
        <div class="space-y-4">
          <AppInput
            v-model="taskTitle"
            type="text"
            :label="t('projectDetailView.taskTitleLabel')"
            :placeholder="t('projectDetailView.taskTitlePlaceholder')"
            required
            @keyup.enter="submitCreateTask"
          />
          <AppSelect
            v-model="taskPriority"
            :label="t('projectDetailView.priorityLabel')"
            :options="priorityOptions"
          />
          <AppInput
            v-model="taskDueDate"
            type="date"
            :label="t('projectDetailView.dueDateLabel')"
          />
        </div>
      </template>
      <template #footer>
        <button
          :disabled="!taskTitle.trim() || creatingTask"
          @click="submitCreateTask"
          class="px-4 py-2 accent-gradient text-white rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="creatingTask" class="material-symbols-outlined animate-spin text-[18px]">refresh</span>
          <span v-else class="material-symbols-outlined text-[18px]">add</span>
          {{ creatingTask ? t('projectDetailView.creating') : t('common.add') }}
        </button>
        <button
          :disabled="creatingTask"
          @click="closeCreateTaskModal"
          class="px-4 py-2 rounded-lg font-label-md text-label-md border border-outline-variant dark:border-slate-600 text-on-surface dark:text-slate-100 hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ t('common.cancel') }}
        </button>
      </template>
    </AppModal>

    <!-- Create Sprint Modal -->
    <AppModal ref="createSprintModal" @validate="submitCreateSprint" @reset="resetSprintForm">
      <template #header>
        <h2 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100">
          {{ t('projectDetailView.addSprint') }}
        </h2>
      </template>
      <template #body>
        <div class="space-y-4">
          <AppInput
            v-model="sprintName"
            type="text"
            :label="t('projectDetailView.sprintNameLabel')"
            :placeholder="t('projectDetailView.sprintNamePlaceholder')"
            required
            @keyup.enter="submitCreateSprint"
          />
          <p class="font-body-sm text-body-sm text-outline dark:text-slate-400">
            {{ t('projectDetailView.createSprintHint') }}
          </p>
        </div>
      </template>
      <template #footer>
        <button
          :disabled="!sprintFormValid || creatingSprint"
          @click="submitCreateSprint"
          class="px-4 py-2 accent-gradient text-white rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="creatingSprint" class="material-symbols-outlined animate-spin text-[18px]">refresh</span>
          <span v-else class="material-symbols-outlined text-[18px]">add</span>
          {{ creatingSprint ? t('projectDetailView.creating') : t('common.add') }}
        </button>
        <button
          :disabled="creatingSprint"
          @click="closeCreateSprintModal"
          class="px-4 py-2 rounded-lg font-label-md text-label-md border border-outline-variant dark:border-slate-600 text-on-surface dark:text-slate-100 hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ t('common.cancel') }}
        </button>
      </template>
    </AppModal>

    <!-- Plan Sprint Modal (transition → PLANNED) -->
    <AppModal ref="planSprintModal" @validate="submitPlanSprint" @reset="resetPlanForm">
      <template #header>
        <h2 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100">
          {{ t('projectDetailView.planModalTitle') }}
        </h2>
      </template>
      <template #body>
        <div class="space-y-4">
          <p v-if="transitionTargetSprint" class="font-body-sm text-body-sm text-outline dark:text-slate-400">
            {{ transitionTargetSprint.name }}
          </p>
          <AppInput
            v-model="planStartDate"
            type="date"
            :label="t('projectDetailView.startDateLabel')"
            required
          />
          <div class="space-y-1">
            <AppInput
              v-model="planPrevisionalEndDate"
              type="date"
              :label="t('projectDetailView.previsionalEndDateLabel')"
            />
            <p class="font-body-xs text-body-xs text-outline dark:text-slate-500">
              {{ t('projectDetailView.previsionalEndDateHint') }}
            </p>
          </div>
        </div>
      </template>
      <template #footer>
        <button
          :disabled="!planStartDate || transitioning"
          @click="submitPlanSprint"
          class="px-4 py-2 accent-gradient text-white rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="transitioning" class="material-symbols-outlined animate-spin text-[18px]">refresh</span>
          <span v-else class="material-symbols-outlined text-[18px]">event</span>
          {{ transitioning ? t('projectDetailView.creating') : t('projectDetailView.transitionPlan') }}
        </button>
        <button
          :disabled="transitioning"
          @click="closePlanSprintModal"
          class="px-4 py-2 rounded-lg font-label-md text-label-md border border-outline-variant dark:border-slate-600 text-on-surface dark:text-slate-100 hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ t('common.cancel') }}
        </button>
      </template>
    </AppModal>

    <!-- Complete Sprint Modal (transition → COMPLETED) -->
    <AppModal ref="completeSprintModal" @validate="submitCompleteSprint" @reset="resetCompleteForm">
      <template #header>
        <h2 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100">
          {{ t('projectDetailView.completeModalTitle') }}
        </h2>
      </template>
      <template #body>
        <div class="space-y-4">
          <p v-if="transitionTargetSprint" class="font-body-sm text-body-sm text-outline dark:text-slate-400">
            {{ transitionTargetSprint.name }}
          </p>
          <div class="space-y-1">
            <AppInput
              v-model="completeEndDate"
              type="date"
              :label="t('projectDetailView.realEndDateLabel')"
            />
            <p class="font-body-xs text-body-xs text-outline dark:text-slate-500">
              {{ t('projectDetailView.realEndDateHint') }}
            </p>
          </div>
        </div>
      </template>
      <template #footer>
        <button
          :disabled="transitioning"
          @click="submitCompleteSprint"
          class="px-4 py-2 accent-gradient text-white rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="transitioning" class="material-symbols-outlined animate-spin text-[18px]">refresh</span>
          <span v-else class="material-symbols-outlined text-[18px]">flag</span>
          {{ transitioning ? t('projectDetailView.creating') : t('projectDetailView.transitionComplete') }}
        </button>
        <button
          :disabled="transitioning"
          @click="closeCompleteSprintModal"
          class="px-4 py-2 rounded-lg font-label-md text-label-md border border-outline-variant dark:border-slate-600 text-on-surface dark:text-slate-100 hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ t('common.cancel') }}
        </button>
      </template>
    </AppModal>

    <!-- Create Lot Modal -->
    <AppModal ref="createLotModal" @validate="submitCreateLot" @reset="resetLotForm">
      <template #header>
        <h2 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100">
          {{ t('projectDetailView.addLot') }}
        </h2>
      </template>
      <template #body>
        <div class="space-y-4">
          <p v-if="lotTargetSprint" class="font-body-sm text-body-sm text-outline dark:text-slate-400">
            {{ t('projectDetailView.lotForSprint', { sprint: lotTargetSprint.name }) }}
          </p>
          <AppInput
            v-model="lotName"
            type="text"
            :label="t('projectDetailView.lotNameLabel')"
            :placeholder="t('projectDetailView.lotNamePlaceholder')"
            required
            @keyup.enter="submitCreateLot"
          />
        </div>
      </template>
      <template #footer>
        <button
          :disabled="!lotName.trim() || creatingLot"
          @click="submitCreateLot"
          class="px-4 py-2 accent-gradient text-white rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="creatingLot" class="material-symbols-outlined animate-spin text-[18px]">refresh</span>
          <span v-else class="material-symbols-outlined text-[18px]">add</span>
          {{ creatingLot ? t('projectDetailView.creating') : t('common.add') }}
        </button>
        <button
          :disabled="creatingLot"
          @click="closeCreateLotModal"
          class="px-4 py-2 rounded-lg font-label-md text-label-md border border-outline-variant dark:border-slate-600 text-on-surface dark:text-slate-100 hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ t('common.cancel') }}
        </button>
      </template>
    </AppModal>
  </main>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'
import { useSprintsStore } from '@/stores/sprints'
import { useLotsStore } from '@/stores/lots'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm.js'
import { getLocale } from '@/plugins/i18n.js'
import AppModal from '@/components/Common/AppModal.vue'
import AppInput from '@/components/Common/Form/AppInput.vue'
import AppSelect from '@/components/Common/Form/AppSelect.vue'
import TaskCard from '@/components/Project/TaskCard.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const sprintsStore = useSprintsStore()
const lotsStore = useLotsStore()
const toast = useToast()
const { confirm } = useConfirm()

// Trois suppressions (tâche, sprint, lot) partagent la même modale rouge : seuls les
// libellés changent. Les clés sont préfixées ici pour ne pas répéter `projectDetailView.`.
const confirmDeletion = (titleKey, bodyKey) => confirm({
  title: t(`projectDetailView.${titleKey}`),
  body: t(`projectDetailView.${bodyKey}`),
  confirmLabel: t('common.delete'),
  danger: true,
})
const currentLocale = getLocale()

// --- Options ------------------------------------------------------------
const priorityOptions = computed(() => [
  { value: 'LOW', label: t('projectDetailView.priorityLow') },
  { value: 'MEDIUM', label: t('projectDetailView.priorityMedium') },
  { value: 'HIGH', label: t('projectDetailView.priorityHigh') },
])

// Transitions autorisées par statut — miroir de SprintStatus::allowedTransitions() côté back.
// Chaque clé de transition mappe une route dédiée (plan / start / complete).
const SPRINT_TRANSITIONS = {
  TO_PLAN: ['plan'],
  PLANNED: ['plan', 'start'],
  ACTIVE: ['complete'],
  COMPLETED: ['reopen'],
}
const TRANSITION_META = {
  plan: { icon: 'event', labelKey: 'transitionPlan' },
  start: { icon: 'play_arrow', labelKey: 'transitionStart' },
  complete: { icon: 'flag', labelKey: 'transitionComplete' },
  reopen: { icon: 'lock_open', labelKey: 'transitionReopen' },
}

const sprintTransitions = (status) =>
  (SPRINT_TRANSITIONS[status] ?? []).map(key => ({
    key,
    icon: TRANSITION_META[key].icon,
    label: t(`projectDetailView.${TRANSITION_META[key].labelKey}`),
  }))

// --- Appartenance des tâches (arbre des sprints) ------------------------
// tasksStore.tasks est la source unique des tâches ; l'arbre ne sert qu'à
// savoir dans quel lot se trouve chaque tâche.
const assignment = computed(() => {
  const byLot = new Map() // lotId -> Set<taskId>
  const byTask = new Map() // taskId -> lotId
  for (const sprint of sprintsStore.sprints) {
    for (const lot of sprint.lots ?? []) {
      const ids = new Set()
      for (const task of lot.tasks ?? []) {
        ids.add(task.id)
        byTask.set(task.id, lot.id)
      }
      byLot.set(lot.id, ids)
    }
  }
  return { byLot, byTask }
})

// Tous les lots à plat, pour le menu de déplacement d'une tâche.
// On exclut les lots des sprints clôturés : on ne peut pas y déplacer de tâche
// (il faut d'abord rouvrir le sprint).
const allLots = computed(() =>
  sprintsStore.sprints
    .filter(sprint => sprint.status !== 'COMPLETED')
    .flatMap(sprint =>
      (sprint.lots ?? []).map(lot => ({ id: lot.id, name: lot.name, sprintName: sprint.name })),
    ),
)

const priorityRank = { HIGH: 0, MEDIUM: 1, LOW: 2 }

// Tâches à faire d'abord (par urgence), tâches terminées en bas.
const sortTasks = (list) =>
  [...list].sort((a, b) => {
    if ((a.status === 'DONE') !== (b.status === 'DONE')) {
      return a.status === 'DONE' ? 1 : -1
    }
    return (priorityRank[a.priority] ?? 1) - (priorityRank[b.priority] ?? 1)
  })

// Backlog = tâches du projet qui ne sont dans aucun lot.
const backlogTasks = computed(() =>
  sortTasks(tasksStore.tasks.filter(task => !assignment.value.byTask.has(task.id))),
)

const lotTasks = (lotId) => {
  const ids = assignment.value.byLot.get(lotId)
  if (!ids) return []
  return sortTasks(tasksStore.tasks.filter(task => ids.has(task.id)))
}

// Avancement d'un lot : nombre de tâches terminées / total, et pourcentage.
const lotProgress = (lotId) => {
  const tasks = lotTasks(lotId)
  const total = tasks.length
  const done = tasks.filter(task => task.status === 'DONE').length
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 }
}

// --- Accordéons des lots ------------------------------------------------
// Un lot présent dans ce Set est replié (ses tâches sont masquées).
const collapsedLots = ref(new Set())
const isLotCollapsed = (lotId) => collapsedLots.value.has(lotId)
const toggleLot = (lotId) => {
  const next = new Set(collapsedLots.value)
  if (next.has(lotId)) {
    next.delete(lotId)
  } else {
    next.add(lotId)
  }
  collapsedLots.value = next
}

// --- Helpers d'affichage ------------------------------------------------
const isoToDate = (iso) => (iso ? String(iso).slice(0, 10) : null)

// Date du jour au format 'YYYY-MM-DD' (valeur par défaut de la date de clôture).
const todayIso = () => new Date().toISOString().slice(0, 10)

const formatDate = (iso) => {
  const d = isoToDate(iso)
  if (!d) return ''
  return new Date(d).toLocaleDateString(currentLocale)
}

const STATUS_LABEL_KEY = {
  TO_PLAN: 'statusToPlan',
  PLANNED: 'statusPlanned',
  ACTIVE: 'statusActive',
  COMPLETED: 'statusCompleted',
}
const sprintStatusLabel = (status) =>
  t(`projectDetailView.${STATUS_LABEL_KEY[status] ?? 'statusToPlan'}`)

const sprintStatusClasses = (status) => {
  switch (status) {
    case 'PLANNED':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
    case 'ACTIVE':
      return 'bg-primary-container text-primary dark:bg-blue-900 dark:text-blue-200'
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    default: // TO_PLAN
      return 'bg-surface-container text-on-surface-variant dark:bg-slate-700 dark:text-slate-300'
  }
}

// Plage de dates affichée :
//  - pas encore planifié → « Non planifié »
//  - planifié/en cours   → début – fin prévisionnelle (suffixe « prév. »)
//  - clôturé             → début – fin réelle
const sprintDateRange = (sprint) => {
  if (!sprint.startDate) return t('projectDetailView.notScheduled')
  const start = formatDate(sprint.startDate)
  if (sprint.endDate) return `${start} – ${formatDate(sprint.endDate)}`
  if (sprint.previsionalEndDate) {
    return `${start} – ${formatDate(sprint.previsionalEndDate)} (${t('projectDetailView.previsionalShort')})`
  }
  return start
}

// --- Navigation ---------------------------------------------------------
const goBack = () => router.push({ name: 'projects' })

// --- Chargement ---------------------------------------------------------
const reloadTree = () => sprintsStore.fetchTreeForProject(route.params.id)

// --- Tâche : création ---------------------------------------------------
const createTaskModal = ref(null)
const taskTitle = ref('')
const taskPriority = ref('MEDIUM')
const taskDueDate = ref('')
const creatingTask = ref(false)

const openCreateTaskModal = () => {
  resetTaskForm()
  createTaskModal.value.open()
}
const closeCreateTaskModal = () => {
  createTaskModal.value.close()
  resetTaskForm()
}
const resetTaskForm = () => {
  taskTitle.value = ''
  taskPriority.value = 'MEDIUM'
  taskDueDate.value = ''
}

const submitCreateTask = async () => {
  if (!taskTitle.value.trim() || creatingTask.value) return
  try {
    creatingTask.value = true
    await tasksStore.create(route.params.id, {
      title: taskTitle.value.trim(),
      priority: taskPriority.value,
      dueDate: taskDueDate.value || null,
    })
    toast.success(t('projectDetailView.createSuccess'))
    closeCreateTaskModal()
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('projectDetailView.createError'))
    console.error(err)
  } finally {
    creatingTask.value = false
  }
}

// --- Tâche : actions ----------------------------------------------------
const toggleDone = async (task) => {
  const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE'
  try {
    await tasksStore.update(task.id, {
      title: task.title,
      description: task.description ?? null,
      status: newStatus,
      priority: task.priority,
      dueDate: isoToDate(task.dueDate),
      tags: task.tags ?? null,
    })
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('projectDetailView.updateError'))
    console.error(err)
  }
}

const deleteTask = async (task) => {
  if (!await confirmDeletion('deleteConfirmTitle', 'deleteConfirm')) return
  try {
    await tasksStore.delete(task.id)
    toast.success(t('projectDetailView.deleteSuccess'))
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('projectDetailView.deleteError'))
    console.error(err)
  }
}

// Déplacement : targetLotId = null -> retour au backlog, sinon rattachement au lot.
const moveTask = async ({ task, targetLotId }) => {
  const currentLotId = assignment.value.byTask.get(task.id) ?? null
  if (currentLotId === targetLotId) return
  try {
    if (targetLotId === null) {
      await lotsStore.removeTask(currentLotId, task.id)
    } else {
      await lotsStore.addTask(targetLotId, task.id)
    }
    await reloadTree()
    toast.success(t('projectDetailView.moveSuccess'))
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('projectDetailView.moveError'))
    console.error(err)
  }
}

// --- Sprint : création --------------------------------------------------
const createSprintModal = ref(null)
const sprintName = ref('')
const creatingSprint = ref(false)

const sprintFormValid = computed(() => !!sprintName.value.trim())

const openCreateSprintModal = () => {
  resetSprintForm()
  createSprintModal.value.open()
}
const closeCreateSprintModal = () => {
  createSprintModal.value.close()
  resetSprintForm()
}
const resetSprintForm = () => {
  sprintName.value = ''
}

const submitCreateSprint = async () => {
  if (!sprintFormValid.value || creatingSprint.value) return
  try {
    creatingSprint.value = true
    // Sprint créé « vide » : nom seul, statut TO_PLAN. Dates/statut via les transitions.
    await sprintsStore.create(route.params.id, {
      name: sprintName.value.trim(),
    })
    await reloadTree()
    toast.success(t('projectDetailView.sprintCreateSuccess'))
    closeCreateSprintModal()
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('projectDetailView.sprintCreateError'))
    console.error(err)
  } finally {
    creatingSprint.value = false
  }
}

// --- Sprint : changement de statut --------------------------------------
// Menu déroulant du badge de statut : au plus un ouvert à la fois (par id de sprint).
const statusMenuSprintId = ref(null)

const toggleStatusMenu = (sprintId) => {
  statusMenuSprintId.value = statusMenuSprintId.value === sprintId ? null : sprintId
}
const closeStatusMenu = () => {
  statusMenuSprintId.value = null
}

// Aiguillage d'une transition : plan/complete ouvrent une modal pour saisir les
// infos spécifiques ; start n'a aucune donnée à saisir → appel direct.
const transitionTargetSprint = ref(null)
const transitioning = ref(false)

const startTransition = (sprint, key) => {
  closeStatusMenu()
  if (key === 'plan') {
    openPlanSprintModal(sprint)
  } else if (key === 'complete') {
    openCompleteSprintModal(sprint)
  } else if (key === 'start') {
    runStartSprint(sprint)
  } else if (key === 'reopen') {
    runReopenSprint(sprint)
  }
}

// --- Transition : démarrer (ACTIVE) — appel direct, sans modal --------------
const runStartSprint = async (sprint) => {
  if (transitioning.value) return
  try {
    transitioning.value = true
    await sprintsStore.start(sprint.id)
    toast.success(t('projectDetailView.startSuccess'))
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('projectDetailView.transitionError'))
    console.error(err)
  } finally {
    transitioning.value = false
  }
}

// --- Transition : rouvrir (COMPLETED → ACTIVE) — appel direct, sans modal ---
const runReopenSprint = async (sprint) => {
  if (transitioning.value) return
  try {
    transitioning.value = true
    await sprintsStore.reopen(sprint.id)
    toast.success(t('projectDetailView.reopenSuccess'))
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('projectDetailView.transitionError'))
    console.error(err)
  } finally {
    transitioning.value = false
  }
}

// --- Transition : planifier (PLANNED) — modal date début + fin prévisionnelle
const planSprintModal = ref(null)
const planStartDate = ref('')
const planPrevisionalEndDate = ref('')

const openPlanSprintModal = (sprint) => {
  transitionTargetSprint.value = sprint
  // Pré-remplissage si on re-planifie un sprint déjà planifié.
  planStartDate.value = isoToDate(sprint.startDate) ?? ''
  planPrevisionalEndDate.value = isoToDate(sprint.previsionalEndDate) ?? ''
  planSprintModal.value.open()
}
const closePlanSprintModal = () => {
  planSprintModal.value.close()
  resetPlanForm()
}
const resetPlanForm = () => {
  transitionTargetSprint.value = null
  planStartDate.value = ''
  planPrevisionalEndDate.value = ''
}

const submitPlanSprint = async () => {
  if (!planStartDate.value || !transitionTargetSprint.value || transitioning.value) return
  try {
    transitioning.value = true
    await sprintsStore.plan(transitionTargetSprint.value.id, {
      startDate: planStartDate.value,
      previsionalEndDate: planPrevisionalEndDate.value || null,
    })
    toast.success(t('projectDetailView.planSuccess'))
    closePlanSprintModal()
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('projectDetailView.transitionError'))
    console.error(err)
  } finally {
    transitioning.value = false
  }
}

// --- Transition : clôturer (COMPLETED) — modal date de fin réelle -----------
const completeSprintModal = ref(null)
const completeEndDate = ref('')

const openCompleteSprintModal = (sprint) => {
  transitionTargetSprint.value = sprint
  completeEndDate.value = todayIso()
  completeSprintModal.value.open()
}
const closeCompleteSprintModal = () => {
  completeSprintModal.value.close()
  resetCompleteForm()
}
const resetCompleteForm = () => {
  transitionTargetSprint.value = null
  completeEndDate.value = ''
}

const submitCompleteSprint = async () => {
  if (!transitionTargetSprint.value || transitioning.value) return
  try {
    transitioning.value = true
    await sprintsStore.complete(transitionTargetSprint.value.id, {
      endDate: completeEndDate.value || null,
    })
    toast.success(t('projectDetailView.completeSuccess'))
    closeCompleteSprintModal()
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('projectDetailView.transitionError'))
    console.error(err)
  } finally {
    transitioning.value = false
  }
}

const deleteSprint = async (sprint) => {
  if (!await confirmDeletion('deleteSprintConfirmTitle', 'deleteSprintConfirm')) return
  try {
    await sprintsStore.delete(sprint.id)
    toast.success(t('projectDetailView.sprintDeleteSuccess'))
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('projectDetailView.sprintDeleteError'))
    console.error(err)
  }
}

// --- Lot : création -----------------------------------------------------
const createLotModal = ref(null)
const lotName = ref('')
const lotTargetSprint = ref(null)
const creatingLot = ref(false)

const openCreateLotModal = (sprint) => {
  resetLotForm()
  lotTargetSprint.value = sprint
  createLotModal.value.open()
}
const closeCreateLotModal = () => {
  createLotModal.value.close()
  resetLotForm()
}
const resetLotForm = () => {
  lotName.value = ''
  lotTargetSprint.value = null
}

const submitCreateLot = async () => {
  if (!lotName.value.trim() || !lotTargetSprint.value || creatingLot.value) return
  try {
    creatingLot.value = true
    await lotsStore.create(lotTargetSprint.value.id, { name: lotName.value.trim() })
    await reloadTree()
    toast.success(t('projectDetailView.lotCreateSuccess'))
    closeCreateLotModal()
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('projectDetailView.lotCreateError'))
    console.error(err)
  } finally {
    creatingLot.value = false
  }
}

const deleteLot = async (lot) => {
  if (!await confirmDeletion('deleteLotConfirmTitle', 'deleteLotConfirm')) return
  try {
    await lotsStore.delete(lot.id)
    await reloadTree()
    toast.success(t('projectDetailView.lotDeleteSuccess'))
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('projectDetailView.lotDeleteError'))
    console.error(err)
  }
}

// --- Init ---------------------------------------------------------------
// Ferme le menu de statut ouvert dès qu'on clique ailleurs (les boutons du menu
// utilisent @click.stop pour ne pas déclencher cette fermeture).
const handleClickOutside = () => closeStatusMenu()
onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))

onMounted(async () => {
  try {
    await projectsStore.fetchOne(route.params.id)
    await Promise.all([
      tasksStore.fetchForProject(route.params.id),
      sprintsStore.fetchTreeForProject(route.params.id),
    ])
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('projectDetailView.loadError'))
    setTimeout(() => {
      router.push({ name: 'projects' })
    }, 1500)
  }
})
</script>
