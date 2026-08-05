import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/plugins/api.js'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref([])
  const loading = ref(false)

  async function fetchForProject(projectId) {
    try {
      loading.value = true
      const response = await api.get(`projects/${projectId}/tasks`)
      tasks.value = response.data.data
      return tasks.value
    } catch (error) {
      console.error('Error fetching tasks:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id) {
    try {
      loading.value = true
      const response = await api.get(`tasks/${id}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching task:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function create(projectId, payload) {
    try {
      const response = await api.post(`projects/${projectId}/tasks`, payload)
      const newTask = response.data.data
      tasks.value.push(newTask)
      return newTask
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  }

  async function update(id, payload) {
    try {
      const response = await api.put(`tasks/${id}`, payload)
      const updatedTask = response.data.data
      const index = tasks.value.findIndex(task => task.id === id)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      return updatedTask
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  async function delete_(id) {
    try {
      await api.delete(`tasks/${id}`)
      tasks.value = tasks.value.filter(task => task.id !== id)
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  return { tasks, loading, fetchForProject, fetchOne, create, update, delete: delete_ }
})
