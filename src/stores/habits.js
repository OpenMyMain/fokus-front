import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/plugins/api.js'

export const useHabitsStore = defineStore('habits', () => {
  const habits = ref([])
  const habit = ref(null)
  const loading = ref(false)

  async function fetchAll() {
    try {
      loading.value = true
      const response = await api.get('habits')
      habits.value = response.data.data
    } catch (error) {
      console.error('Error fetching habits:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id) {
    try {
      loading.value = true
      const response = await api.get(`habits/${id}`)
      habit.value = response.data.data
    } catch (error) {
      console.error('Error fetching habit:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    try {
      // Normaliser la structure de récurrence
      if (payload.frequencyType) {
        payload.recurrencePattern = {
          type: payload.frequencyType,
          interval: payload.interval || 1,
          weekDays: payload.weekDays || [],
          dayOfMonth: payload.monthDay || null,
        }
        delete payload.frequencyType
        delete payload.interval
        delete payload.weekDays
        delete payload.monthDay
      }
      // Supprimer le flag reminder qui n'est pas attendu par le backend
      delete payload.reminder
      const response = await api.post('habits', payload)
      const newHabit = response.data.data
      habits.value.push(newHabit)
      return newHabit
    } catch (error) {
      console.error('Error creating habit:', error)
      throw error
    }
  }

  async function update(id, payload) {
    try {
      const response = await api.put(`habits/${id}`, payload)
      const updatedHabit = response.data.data
      const index = habits.value.findIndex(h => h.id === id)
      if (index !== -1) {
        habits.value[index] = updatedHabit
      }
      return updatedHabit
    } catch (error) {
      console.error('Error updating habit:', error)
      throw error
    }
  }

  async function delete_(id) {
    try {
      await api.delete(`habits/${id}`)
      habits.value = habits.value.filter(h => h.id !== id)
    } catch (error) {
      console.error('Error deleting habit:', error)
      throw error
    }
  }

  return { habits, habit, loading, fetchAll, fetchOne, create, update, delete: delete_ }
})
