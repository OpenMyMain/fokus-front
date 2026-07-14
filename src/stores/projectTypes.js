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

  return { projectTypes, loading, fetchAll }
})
