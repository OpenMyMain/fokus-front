import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/plugins/api.js'

// T-11 — les occurrences d'habitudes étaient générées et exposées par le backend depuis le
// début, mais aucun store ne les consommait : rien n'était cochable dans l'app (F-8).
//
// Deux routes seulement existent côté backend :
//   GET   /api/habits/occurrences/{YYYY-MM-DD}
//   PATCH /api/habit-occurrences/{id}   body: { status: 'DONE' | 'SKIPPED' }
// Il n'y a pas encore de route par plage de dates (T-30), donc pas de vue semaine ici.

export const OCCURRENCE_STATUS = {
  PENDING: 'PENDING',
  DONE: 'DONE',
  SKIPPED: 'SKIPPED',
}

export const useHabitOccurrencesStore = defineStore('habitOccurrences', () => {
  const occurrences = ref([])
  const date = ref(null)
  const loading = ref(false)

  function toIsoDate(value) {
    const target = value instanceof Date ? value : new Date(value)
    // On construit la date à partir des composantes locales : `toISOString()` convertit en UTC
    // et ferait basculer d'un jour le soir aux fuseaux à l'est de Greenwich.
    const year = target.getFullYear()
    const month = String(target.getMonth() + 1).padStart(2, '0')
    const day = String(target.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  async function fetchForDate(value = new Date()) {
    const iso = toIsoDate(value)

    try {
      loading.value = true
      const response = await api.get(`habits/occurrences/${iso}`)
      occurrences.value = response.data.data ?? []
      date.value = iso
    } catch (error) {
      console.error('Error fetching habit occurrences:', error)
      throw error
    } finally {
      loading.value = false
    }

    return occurrences.value
  }

  async function setStatus(id, status) {
    const index = occurrences.value.findIndex(o => o.id === id)
    const previous = index === -1 ? null : { ...occurrences.value[index] }

    // Mise à jour optimiste : cocher une habitude doit répondre instantanément. En cas
    // d'échec on remet la valeur précédente plutôt que de laisser l'UI mentir.
    if (index !== -1) {
      occurrences.value[index] = { ...occurrences.value[index], status }
    }

    try {
      const response = await api.patch(`habit-occurrences/${id}`, { status })
      if (index !== -1) {
        occurrences.value[index] = response.data.data
      }

      return response.data.data
    } catch (error) {
      if (index !== -1 && previous !== null) {
        occurrences.value[index] = previous
      }
      console.error('Error updating habit occurrence:', error)
      throw error
    }
  }

  const complete = id => setStatus(id, OCCURRENCE_STATUS.DONE)
  const skip = id => setStatus(id, OCCURRENCE_STATUS.SKIPPED)

  function reset() {
    occurrences.value = []
    date.value = null
  }

  return { occurrences, date, loading, fetchForDate, setStatus, complete, skip, reset }
})
