import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import { supabase } from '@/config/supabase/supabase'
import { AuthenticationService } from '@/services'
import { UserRole } from '@/utils/types/UserRole'
import { useUserProfileStore } from './userProfileStore'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)
  const user = ref<User | null>(null)
  const role = ref<UserRole | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!session.value)

  const setAuthState = (nextSession: Session | null) => {
    session.value = nextSession
    user.value = nextSession?.user ?? null
    role.value = (nextSession?.user?.user_metadata?.role as UserRole | undefined) ?? null
  }

  const initSession = async () => {
    try {
      const current = await AuthenticationService.getSession()
      setAuthState(current ?? null)
      return current ?? null
    } catch (err: any) {
      error.value = err?.message ?? 'Failed to initialize session'
      return null
    }
  }

  const initialize = async () => {
    isLoading.value = true
    error.value = null
    await initSession()

    supabase.auth.onAuthStateChange((_event, currentSession) => {
      setAuthState(currentSession)
    })

    isLoading.value = false
  }

  const subscribeToAuth = (callback?: (event: AuthChangeEvent, session: Session | null) => void) => {
    const { data } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setAuthState(currentSession)
      callback?.(event, currentSession)
    })
    return data.subscription
  }

  const signInWithPassword = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null
    try {
      const { user: signedInUser, session: signedInSession } = await AuthenticationService.signIn({ email, password })
      setAuthState(signedInSession ?? null)
      return { user: signedInUser, session: signedInSession, error: null }
    } catch (err: any) {
      error.value = err?.message ?? 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const signInWithGoogle = async (redirectTo: string) => {
    isLoading.value = true
    error.value = null
    try {
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })
      if (signInError) throw signInError
      return data
    } catch (err: any) {
      error.value = err?.message ?? 'Google login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const register = async (input: { email: string; password: string; fullName?: string; phone?: string; username?: string; role?: UserRole }) => {
    isLoading.value = true
    error.value = null
    try {
      const { user: newUser, session: newSession } = await AuthenticationService.signUp({
        email: input.email,
        password: input.password,
        full_name: input.fullName ?? '',
        phone: input.phone ?? '',
        username: input.username ?? '',
        role: input.role ?? UserRole.TRAVELLER,
      })
      setAuthState(newSession ?? null)
      return { user: newUser, session: newSession }
    } catch (err: any) {
      error.value = err?.message ?? 'Registration failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const signOut = async () => {
    isLoading.value = true
    error.value = null
    try {
      await AuthenticationService.signOut()
    } catch (err: any) {
      error.value = err?.message ?? 'Sign out failed'
    } finally {
      setAuthState(null)
      // Clear profile store on logout
      const userProfileStore = useUserProfileStore()
      userProfileStore.clearProfile()
      isLoading.value = false
    }
  }

  const upgradeToBusinessOwner = async () => {
    isLoading.value = true
    error.value = null
    try {
      const updatedUser = await AuthenticationService.updateUserMetadata({ role: UserRole.BUSINESS_OWNER })
      if (updatedUser) {
        user.value = updatedUser
        role.value = UserRole.BUSINESS_OWNER
      }
    } catch (err: any) {
      error.value = err?.message ?? 'Failed to upgrade role'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    session,
    user,
    role,
    isAuthenticated,
    isLoading,
    error,
    initialize,
    initSession,
    subscribeToAuth,
    signInWithPassword,
    signInWithGoogle,
    register,
    signOut,
    upgradeToBusinessOwner,
  }
})
