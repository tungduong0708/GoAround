import { ref, computed } from 'vue'
import type { ILocation } from '@/utils/interfaces'

export interface GeolocationState {
  loading: boolean
  error: string | null
  location: ILocation | null
  isSupported: boolean
  permission: PermissionState | null
}

export function useGeolocation() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const location = ref<ILocation | null>(null)
  const permission = ref<PermissionState | null>(null)

  const isSupported = computed(() => 'geolocation' in navigator)

  const checkPermission = async (): Promise<PermissionState | null> => {
    if (!isSupported.value) {
      return null
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' })
      permission.value = result.state
      
      // Listen for permission changes
      result.addEventListener('change', () => {
        permission.value = result.state
      })
      
      return result.state
    } catch (err) {
      // Some browsers don't support permissions.query for geolocation
      console.warn('Permission query not supported:', err)
      return null
    }
  }

  const getCurrentLocation = async (): Promise<ILocation | null> => {
    if (!isSupported.value) {
      error.value = 'Geolocation is not supported by your browser'
      console.log(error.value)
      return null
    }
    console.log('Requesting current location...')

    loading.value = true
    error.value = null

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // Cache for 5 minutes
          }
        )
      })

      const newLocation: ILocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }

      location.value = newLocation
      await checkPermission()
      
      return newLocation
    } catch (err: any) {
      let errorMessage = 'Failed to get your location'
      
      if (err.code === 1) {
        errorMessage = 'Location access denied. Please enable location permissions in your browser.'
      } else if (err.code === 2) {
        errorMessage = 'Location unavailable. Please check your device settings.'
      } else if (err.code === 3) {
        errorMessage = 'Location request timed out. Please try again.'
      }
      
      error.value = errorMessage
      await checkPermission()
      
      return null
    } finally {
      loading.value = false
    }
  }

  const clearLocation = () => {
    location.value = null
    error.value = null
  }

  const watchPosition = (
    onSuccess: (location: ILocation) => void,
    onError?: (error: string) => void
  ): number | null => {
    if (!isSupported.value) {
      const msg = 'Geolocation is not supported by your browser'
      error.value = msg
      onError?.(msg)
      return null
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: ILocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        location.value = newLocation
        error.value = null
        onSuccess(newLocation)
      },
      (err) => {
        let errorMessage = 'Failed to watch your location'
        
        if (err.code === 1) {
          errorMessage = 'Location access denied'
        } else if (err.code === 2) {
          errorMessage = 'Location unavailable'
        } else if (err.code === 3) {
          errorMessage = 'Location request timed out'
        }
        
        error.value = errorMessage
        onError?.(errorMessage)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    )

    return watchId
  }

  const clearWatch = (watchId: number) => {
    if (isSupported.value && watchId) {
      navigator.geolocation.clearWatch(watchId)
    }
  }

  return {
    loading,
    error,
    location,
    permission,
    isSupported,
    checkPermission,
    getCurrentLocation,
    clearLocation,
    watchPosition,
    clearWatch,
  }
}
