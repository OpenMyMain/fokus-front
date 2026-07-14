import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/plugins/api.js'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref([])
  const project = ref(null)
  const loading = ref(false)

  async function fetchAll() {
    try {
      loading.value = true
      const response = await api.get('projects')
      projects.value = response.data.data
    } catch (error) {
      console.error('Error fetching projects:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id) {
    try {
      loading.value = true
      const response = await api.get(`projects/${id}`)
      project.value = response.data.data
    } catch (error) {
      console.error('Error fetching project:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function create(name, projectTypeId = null) {
    try {
      const payload = { name }
      if (projectTypeId) {
        payload.projectTypeId = projectTypeId
      }
      const response = await api.post('projects', payload)
      const newProject = response.data.data
      projects.value.push(newProject)
      return newProject
    } catch (error) {
      console.error('Error creating project:', error)
      throw error
    }
  }

  return { projects, project, loading, fetchAll, fetchOne, create }
})
