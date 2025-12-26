import { defineStore } from 'pinia'
import { ref } from 'vue'
import { UserService } from '@/services'
import type { IUserDetail } from '@/utils/interfaces'

export const useUserProfileStore = defineStore('userProfile', () => {
  const profile = ref<IUserDetail | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const profileExists = ref<boolean | null>(null) // null = unchecked, true = exists, false = missing

  const fetchProfile = async (): Promise<boolean> => {
    isLoading.value = true
    error.value = null
    
    try {
      const data = await UserService.getCurrentUser()
      profile.value = data
      profileExists.value = true
      return true
    } catch (err: any) {
      // Check if it's a 404 error (profile not found)
      if (err.statusCode === 404) {
        console.log('User profile not found (404)')
        profileExists.value = false
        profile.value = null
        return false
      }
      
      // For other errors, rethrow
      console.error('Profile fetch error:', err)
      error.value = err?.message || 'Failed to fetch profile'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearProfile = () => {
    profile.value = null
    profileExists.value = null
    error.value = null
  }

  const updateProfile = (updatedProfile: IUserDetail) => {
    profile.value = updatedProfile
    profileExists.value = true
  }

  return {
    profile,
    isLoading,
    error,
    profileExists,
    fetchProfile,
    clearProfile,
    updateProfile,
  }
})
