import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/plugins/api.js'

export const useTimeSlotsStore = defineStore('timeSlots', () => {
  const timeSlots = ref([])
  const timeSlot = ref(null)
  const loading = ref(false)

  async function fetchAll() {
    try {
      loading.value = true
      const response = await api.get('time-slots')
      timeSlots.value = response.data.data
    } catch (error) {
      console.error('Error fetching time-slots:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id) {
    try {
      loading.value = true
      const response = await api.get(`time-slots/${id}`)
      timeSlot.value = response.data.data
    } catch (error) {
      console.error('Error fetching time-slot:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    try {
      const response = await api.post('time-slots', payload)
      const newTimeSlot = response.data.data
      // La réponse de création n'inclut pas les recurrences : on garantit le tableau
      if (!newTimeSlot.recurrences) {
        newTimeSlot.recurrences = []
      }
      timeSlots.value.push(newTimeSlot)
      return newTimeSlot
    } catch (error) {
      console.error('Error creating time-slot:', error)
      throw error
    }
  }

  // Un motif de répétition hebdomadaire (jour + heure + durée), borné par `startDate`
  // — les occurrences concrètes sont matérialisées par la génération back (paresseuse
  // à la lecture, ou via la commande CLI planifiée), pas ici.
  async function addRecurrence(timeSlotId, payload) {
    try {
      const response = await api.post(`time-slots/${timeSlotId}/recurrences`, payload)
      const newRecurrence = response.data.data
      const index = timeSlots.value.findIndex(ts => ts.id === timeSlotId)
      if (index !== -1) {
        timeSlots.value[index].recurrences.push(newRecurrence)
      }
      return newRecurrence
    } catch (error) {
      console.error('Error adding recurrence:', error)
      throw error
    }
  }

  // Supprime une occurrence ponctuelle (un seul jour) : soft-delete côté back, elle ne
  // sera plus jamais régénérée pour cette date, sans affecter les autres semaines.
  async function deleteOccurrence(occurrenceId) {
    try {
      await api.delete(`time-slot-occurrences/${occurrenceId}`)
    } catch (error) {
      console.error('Error deleting occurrence:', error)
      throw error
    }
  }

  // Occurrences d'un jour donné, pour l'accueil. Le backend attend `period=day` + une date au
  // format YYYY-MM-DD et en déduit lui-même le jour de la semaine (0 = lundi).
  // Volontairement hors du `state` : c'est une lecture ponctuelle, pas la grille du planning.
  async function fetchOccurrencesForDate(value = new Date()) {
    const target = value instanceof Date ? value : new Date(value)
    // Composantes locales, jamais `toISOString()` : celui-ci convertit en UTC et fait sauter
    // d'un jour le soir aux fuseaux à l'est de Greenwich.
    const iso = [
      target.getFullYear(),
      String(target.getMonth() + 1).padStart(2, '0'),
      String(target.getDate()).padStart(2, '0'),
    ].join('-')

    try {
      const response = await api.get('time-slot-occurrences/by-date', {
        params: { period: 'day', date: iso },
      })

      return response.data.data ?? []
    } catch (error) {
      console.error('Error fetching occurrences for date:', error)
      throw error
    }
  }

  async function update(id, payload) {
    try {
      const response = await api.put(`time-slots/${id}`, payload)
      const updatedTimeSlot = response.data.data
      const index = timeSlots.value.findIndex(ts => ts.id === id)
      if (index !== -1) {
        timeSlots.value[index] = updatedTimeSlot
      }
      return updatedTimeSlot
    } catch (error) {
      console.error('Error updating time-slot:', error)
      throw error
    }
  }

  async function delete_(id) {
    try {
      await api.delete(`time-slots/${id}`)
      timeSlots.value = timeSlots.value.filter(ts => ts.id !== id)
    } catch (error) {
      console.error('Error deleting time-slot:', error)
      throw error
    }
  }

  return {
    timeSlots,
    timeSlot,
    loading,
    fetchAll,
    fetchOne,
    create,
    addRecurrence,
    deleteOccurrence,
    fetchOccurrencesForDate,
    update,
    delete: delete_,
  }
})
