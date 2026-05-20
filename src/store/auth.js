import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(authService.getCurrentUser())
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role || null)
  const userName = computed(() => user.value?.name || user.value?.email || 'Guest')

  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      const { user: loggedUser } = await authService.login(credentials)
      user.value = loggedUser
      return loggedUser
    } catch (err) {
      error.value = err?.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(payload) {
    loading.value = true
    error.value = null
    try {
      const { user: registeredUser } = await authService.register(payload)
      user.value = registeredUser
      return registeredUser
    } catch (err) {
      error.value = err?.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    authService.logout()
    user.value = null
  }

  function clearError() {
    error.value = null
  }

  function refreshUser() {
    user.value = authService.getCurrentUser()
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    userRole,
    userName,
    login,
    register,
    logout,
    clearError,
    refreshUser,
  }
})
