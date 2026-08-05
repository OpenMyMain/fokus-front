import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/plugins/api.js'

export const useLotsStore = defineStore('lots', () => {
  const lots = ref([])
  const lot = ref(null)
  const loading = ref(false)

  async function fetchForSprint(sprintId) {
    try {
      loading.value = true
      const response = await api.get(`sprints/${sprintId}/lots`)
      lots.value = response.data.data
      return lots.value
    } catch (error) {
      console.error('Error fetching lots:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // GET /api/lots/{lot} — renvoie le lot avec ses tâches
  async function fetchOne(id) {
    try {
      loading.value = true
      const response = await api.get(`lots/${id}`)
      lot.value = response.data.data
      return lot.value
    } catch (error) {
      console.error('Error fetching lot:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // payload: { name }
  async function create(sprintId, payload) {
    try {
      const response = await api.post(`sprints/${sprintId}/lots`, payload)
      const newLot = response.data.data
      lots.value.push(newLot)
      return newLot
    } catch (error) {
      console.error('Error creating lot:', error)
      throw error
    }
  }

  async function update(id, payload) {
    try {
      const response = await api.put(`lots/${id}`, payload)
      const updatedLot = response.data.data
      const index = lots.value.findIndex(l => l.id === id)
      if (index !== -1) {
        lots.value[index] = updatedLot
      }
      if (lot.value?.id === id) {
        lot.value = updatedLot
      }
      return updatedLot
    } catch (error) {
      console.error('Error updating lot:', error)
      throw error
    }
  }

  async function delete_(id) {
    try {
      await api.delete(`lots/${id}`)
      lots.value = lots.value.filter(l => l.id !== id)
      if (lot.value?.id === id) {
        lot.value = null
      }
    } catch (error) {
      console.error('Error deleting lot:', error)
      throw error
    }
  }

  // PATCH /api/lots/{lot}/tasks/{task} — rattache une tâche existante (du même projet) au lot.
  // La tâche doit appartenir au même projet que le lot, sinon le backend renvoie 400.
  async function addTask(lotId, taskId) {
    try {
      const response = await api.patch(`lots/${lotId}/tasks/${taskId}`)
      const updatedLot = response.data.data
      const index = lots.value.findIndex(l => l.id === lotId)
      if (index !== -1) {
        lots.value[index] = updatedLot
      }
      if (lot.value?.id === lotId) {
        lot.value = updatedLot
      }
      return updatedLot
    } catch (error) {
      console.error('Error adding task to lot:', error)
      throw error
    }
  }

  // DELETE /api/lots/{lot}/tasks/{task} — détache la tâche du lot (retour au backlog du projet).
  async function removeTask(lotId, taskId) {
    try {
      await api.delete(`lots/${lotId}/tasks/${taskId}`)
      // Retire la tâche de la copie locale du lot si elle est chargée.
      const target = lot.value?.id === lotId
        ? lot.value
        : lots.value.find(l => l.id === lotId)
      if (target?.tasks) {
        target.tasks = target.tasks.filter(t => t.id !== taskId)
      }
    } catch (error) {
      console.error('Error removing task from lot:', error)
      throw error
    }
  }

  return {
    lots,
    lot,
    loading,
    fetchForSprint,
    fetchOne,
    create,
    update,
    delete: delete_,
    addTask,
    removeTask,
  }
})
