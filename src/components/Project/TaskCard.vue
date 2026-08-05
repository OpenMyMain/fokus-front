<template>
  <li
    ref="root"
    class="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low dark:bg-slate-800/60"
  >
    <!-- Toggle done -->
    <button
      @click="emit('toggle', task)"
      :disabled="locked"
      class="mt-0.5 shrink-0 text-outline dark:text-slate-400 transition-colors"
      :class="locked ? 'opacity-50 cursor-not-allowed' : 'hover:text-primary dark:hover:text-blue-300'"
      :aria-label="t('projectDetailView.toggleDone')"
    >
      <span class="material-symbols-outlined text-[22px]" :style="task.status === 'DONE' ? { fontVariationSettings: `'FILL' 1` } : {}">
        {{ task.status === 'DONE' ? 'check_circle' : 'radio_button_unchecked' }}
      </span>
    </button>

    <!-- Content -->
    <div class="flex-1 min-w-0 space-y-1">
      <RouterLink
        :to="{ name: 'task_show', params: { id: task.id } }"
        class="block font-body-md text-body-md text-on-surface dark:text-slate-100 hover:text-primary dark:hover:text-blue-300 transition-colors text-left"
        :class="{ 'line-through text-outline dark:text-slate-500': task.status === 'DONE' }"
      >
        {{ task.title }}
      </RouterLink>
      <div class="flex flex-wrap items-center gap-2">
        <span
          class="inline-block px-2 py-0.5 rounded font-label-sm text-[11px]"
          :class="priorityClasses(task.priority)"
        >
          {{ t(`projectDetailView.priority${capitalize(task.priority)}`) }}
        </span>
        <span v-if="task.dueDate" class="flex items-center gap-1 font-body-xs text-body-xs text-outline dark:text-slate-400">
          <span class="material-symbols-outlined text-[14px]">event</span>
          {{ formatDate(task.dueDate) }}
        </span>
      </div>
    </div>

    <!-- Sprint clôturé : tâche gelée, déplacement impossible -->
    <span
      v-if="locked"
      class="mt-0.5 shrink-0 text-outline dark:text-slate-500"
      :aria-label="t('projectDetailView.lockedTask')"
      :title="t('projectDetailView.lockedTask')"
    >
      <span class="material-symbols-outlined text-[20px]">lock</span>
    </span>

    <!-- Move menu -->
    <div v-else-if="moveOptions.length" class="relative shrink-0">
      <button
        @click="menuOpen = !menuOpen"
        class="mt-0.5 text-outline dark:text-slate-400 hover:text-primary dark:hover:text-blue-300 transition-colors"
        :aria-label="t('projectDetailView.moveTask')"
        :aria-expanded="menuOpen"
      >
        <span class="material-symbols-outlined text-[20px]">drive_file_move</span>
      </button>

      <div
        v-if="menuOpen"
        class="absolute right-0 top-8 z-20 w-56 max-h-72 overflow-y-auto glass-card rounded-lg py-1 shadow-lg"
        role="menu"
      >
        <p class="px-3 py-1.5 font-label-sm text-[11px] uppercase tracking-wide text-outline dark:text-slate-400">
          {{ t('projectDetailView.moveTo') }}
        </p>
        <button
          v-for="option in moveOptions"
          :key="option.id ?? 'backlog'"
          @click="choose(option.id)"
          class="w-full text-left px-3 py-2 font-body-sm text-body-sm text-on-surface dark:text-slate-100 hover:bg-surface-container dark:hover:bg-slate-700/60 transition-colors flex items-center gap-2"
          role="menuitem"
        >
          <span class="material-symbols-outlined text-[16px] text-outline dark:text-slate-400">
            {{ option.id === null ? 'inbox' : 'folder' }}
          </span>
          <span class="truncate">{{ option.label }}</span>
        </button>
      </div>
    </div>

    <!-- Delete -->
    <button
      @click="emit('delete', task)"
      :disabled="locked"
      class="mt-0.5 shrink-0 text-outline dark:text-slate-400 transition-colors"
      :class="locked ? 'opacity-50 cursor-not-allowed' : 'hover:text-error dark:hover:text-red-400'"
      :aria-label="t('common.delete')"
    >
      <span class="material-symbols-outlined text-[20px]">close</span>
    </button>
  </li>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getLocale } from '@/plugins/i18n.js'

const { t } = useI18n()
const currentLocale = getLocale()

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
  // Lots candidats au déplacement : [{ id, name, sprintName }]
  lots: {
    type: Array,
    default: () => [],
  },
  // Lot courant de la tâche (null = backlog)
  currentLotId: {
    type: String,
    default: null,
  },
  // Tâche gelée (sprint clôturé) : déplacement désactivé
  locked: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle', 'delete', 'move'])

const root = ref(null)
const menuOpen = ref(false)

// Options de déplacement : « Backlog » (si la tâche est dans un lot) + les autres lots.
const moveOptions = computed(() => {
  const options = []
  if (props.currentLotId !== null) {
    options.push({ id: null, label: t('projectDetailView.backlog') })
  }
  for (const lot of props.lots) {
    if (lot.id !== props.currentLotId) {
      options.push({ id: lot.id, label: `${lot.sprintName} › ${lot.name}` })
    }
  }
  return options
})

const choose = (targetLotId) => {
  menuOpen.value = false
  emit('move', { task: props.task, targetLotId })
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

const capitalize = (s) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : '')

const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(String(iso).slice(0, 10)).toLocaleDateString(currentLocale)
}

const handleClickOutside = (event) => {
  if (menuOpen.value && root.value && !root.value.contains(event.target)) {
    menuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>
