import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)

  const user = computed(() => session.value?.user ?? null)

  const setSession = (value: Session | null) => {
    session.value = value
  }

  const initSession = async () => {
    const { data, error } = await supabase.auth.getSession()
    if (!error) {
      setSession(data.session ?? null)
    }
    return session.value
  }

  const subscribeToAuth = (callback?: (event: AuthChangeEvent, session: Session | null) => void) => {
    const { data } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession)
      callback?.(event, currentSession)
    })

    return data.subscription
  }

  const signInWithPassword = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signInWithGoogle = async (redirectTo: string) => {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
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