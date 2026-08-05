import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/plugins/api.js'

export const useProjectTypesStore = defineStore('projectTypes', () => {
  const projectTypes = ref([])
  const loading = ref(false)

  async function fetchAll() {
    try {
      loading.value = true
      const response = await api.get('project-types')
      projectTypes.value = response.data.data
    } catch (error) {
      console.error('Error fetching project types:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // POST /api/project-types — crée un type pour l'utilisateur courant et l'ajoute à la liste.
  async function create(name) {
    try {
      const response = await api.post('project-types', { name })
      const newType = response.data.data
      projectTypes.value.push(newType)
      return newType
    } catch (error) {
      console.error('Error creating project type:', error)
      throw error
    }
  }

  return { projectTypes, loading, fetchAll, create }
})
