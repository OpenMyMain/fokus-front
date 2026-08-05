import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/plugins/api.js'

export const useAppointmentsStore = defineStore('appointments', () => {
  const appointments = ref([])
  const appointment = ref(null)
  const loading = ref(false)

  /**
   * `params` accepte `{ from, to }` (dates `YYYY-MM-DD`, bornes inclusives côté backend).
   * Sans bornes, l'API renvoie tout l'historique du compte : les écrans passent toujours
   * une plage.
   */
  async function fetchAll(params = {}) {
    try {
      loading.value = true
      const response = await api.get('appointments', { params })
      appointments.value = response.data.data
    } catch (error) {
      console.error('Error fetching appointments:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id) {
    try {
      loading.value = true
      const response = await api.get(`appointments/${id}`)
      appointment.value = response.data.data
    } catch (error) {
      console.error('Error fetching appointment:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    try {
      const response = await api.post('appointments', payload)
      const created = response.data.data
      appointments.value.push(created)
      sortByStart()
      return created
    } catch (error) {
      console.error('Error creating appointment:', error)
      throw error
    }
  }

  async function update(id, payload) {
    try {
      const response = await api.put(`appointments/${id}`, payload)
      const updated = response.data.data
      const index = appointments.value.findIndex(a => a.id === id)
      if (index !== -1) {
        appointments.value[index] = updated
      }
      // Un RDV déplacé change de place dans la liste : sans ce tri, il resterait affiché
      // sous son ancienne date jusqu'au prochain chargement.
      sortByStart()
      return updated
    } catch (error) {
      console.error('Error updating appointment:', error)
      throw error
    }
  }

  async function delete_(id) {
    try {
      await api.delete(`appointments/${id}`)
      appointments.value = appointments.value.filter(a => a.id !== id)
    } catch (error) {
      console.error('Error deleting appointment:', error)
      throw error
    }
  }

  function sortByStart() {
    appointments.value.sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
  }

  return { appointments, appointment, loading, fetchAll, fetchOne, create, update, delete: delete_ }
})
