import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { authService } from '@/services'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)

  const user = computed(() => session.value?.user ?? null)

  const setSession = (value: Session | null) => {
    session.value = value
  }

  const initSession = async () => {
    const { data, error } = await authService.getSession()
    if (!error) {
      setSession(data.session ?? null)
    }
    return session.value
  }

  const subscribeToAuth = (callback?: (event: AuthChangeEvent, session: Session | null) => void) => {
    const { data } = authService.onAuthStateChange((event, currentSession) => {
      setSession(currentSession)
      callback?.(event, currentSession)
    })

    return data.subscription
  }

  const signInWithPassword = async (email: string, password: string) => {
    return authService.signInWithPassword(email, password)
  }

  const signInWithGoogle = async (redirectTo: string) => {
    return authService.signInWithOAuth('google', { redirectTo })
  }

  const signOut = async () => {
    await authService.signOut()
    setSession(null)
  }

  return {
    session,
    user,
    initSession,
    subscribeToAuth,
    signInWithPassword,
    signInWithGoogle,
    signOut,
  }
})