import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/plugins/api.js'

export const useSprintsStore = defineStore('sprints', () => {
  const sprints = ref([])
  const sprint = ref(null)
  const loading = ref(false)

  async function fetchForProject(projectId) {
    try {
      loading.value = true
      const response = await api.get(`projects/${projectId}/sprints`)
      sprints.value = response.data.data
      return sprints.value
    } catch (error) {
      console.error('Error fetching sprints:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Charge l'arbre complet du projet : chaque sprint avec ses lots et l'appartenance des tâches.
  // La liste `GET /projects/{id}/sprints` ne contient pas les lots (groupe de sérialisation),
  // il faut donc récupérer le détail de chaque sprint via `GET /sprints/{id}`.
  async function fetchTreeForProject(projectId) {
    try {
      loading.value = true
      const list = await api.get(`projects/${projectId}/sprints`)
      const details = await Promise.all(
        list.data.data.map(s => api.get(`sprints/${s.id}`).then(r => r.data.data)),
      )
      sprints.value = details
      return details
    } catch (error) {
      console.error('Error fetching sprint tree:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // GET /api/sprints/{sprint} — renvoie le sprint avec ses lots et les tâches des lots
  async function fetchOne(id) {
    try {
      loading.value = true
      const response = await api.get(`sprints/${id}`)
      sprint.value = response.data.data
      return sprint.value
    } catch (error) {
      console.error('Error fetching sprint:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // payload: { name } — un sprint est créé « vide » (statut TO_PLAN, sans dates).
  // Les dates et le statut évoluent ensuite via les transitions plan()/start()/complete().
  async function create(projectId, payload) {
    try {
      const response = await api.post(`projects/${projectId}/sprints`, payload)
      const newSprint = response.data.data
      sprints.value.push(newSprint)
      return newSprint
    } catch (error) {
      console.error('Error creating sprint:', error)
      throw error
    }
  }

  async function update(id, payload) {
    try {
      const response = await api.put(`sprints/${id}`, payload)
      const updatedSprint = response.data.data
      const index = sprints.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sprints.value[index] = updatedSprint
      }
      if (sprint.value?.id === id) {
        sprint.value = updatedSprint
      }
      return updatedSprint
    } catch (error) {
      console.error('Error updating sprint:', error)
      throw error
    }
  }

  // Les transitions renvoient le sprint SANS ses lots (groupe de sérialisation) ; on ne
  // fusionne donc que les champs scalaires (statut + dates) pour préserver l'arbre chargé.
  function applyScalarFields(id, data) {
    const patch = {
      status: data.status,
      startDate: data.startDate,
      previsionalEndDate: data.previsionalEndDate,
      endDate: data.endDate,
    }
    const target = sprints.value.find(s => s.id === id)
    if (target) {
      Object.assign(target, patch)
    }
    if (sprint.value?.id === id) {
      Object.assign(sprint.value, patch)
    }
  }

  // PATCH /api/sprints/{sprint}/plan — payload: { startDate, previsionalEndDate? } → PLANNED
  async function plan(id, payload) {
    try {
      const response = await api.patch(`sprints/${id}/plan`, payload)
      applyScalarFields(id, response.data.data)
      return response.data.data
    } catch (error) {
      console.error('Error planning sprint:', error)
      throw error
    }
  }

  // PATCH /api/sprints/{sprint}/start — pas de payload → ACTIVE
  async function start(id) {
    try {
      const response = await api.patch(`sprints/${id}/start`)
      applyScalarFields(id, response.data.data)
      return response.data.data
    } catch (error) {
      console.error('Error starting sprint:', error)
      throw error
    }
  }

  // PATCH /api/sprints/{sprint}/complete — payload: { endDate? } (défaut = now) → COMPLETED
  async function complete(id, payload = {}) {
    try {
      const response = await api.patch(`sprints/${id}/complete`, payload)
      applyScalarFields(id, response.data.data)
      return response.data.data
    } catch (error) {
      console.error('Error completing sprint:', error)
      throw error
    }
  }

  // PATCH /api/sprints/{sprint}/reopen — rouvre un sprint clôturé (efface endDate) → ACTIVE
  async function reopen(id) {
    try {
      const response = await api.patch(`sprints/${id}/reopen`)
      applyScalarFields(id, response.data.data)
      return response.data.data
    } catch (error) {
      console.error('Error reopening sprint:', error)
      throw error
    }
  }

  async function delete_(id) {
    try {
      await api.delete(`sprints/${id}`)
      sprints.value = sprints.value.filter(s => s.id !== id)
      if (sprint.value?.id === id) {
        sprint.value = null
      }
    } catch (error) {
      console.error('Error deleting sprint:', error)
      throw error
    }
  }

  return { sprints, sprint, loading, fetchForProject, fetchTreeForProject, fetchOne, create, update, plan, start, complete, reopen, delete: delete_ }
})
