// (AI generated)
// TODO: Review this file and consider moving back to a store if needed.
// Clarifying store structure rationale
// Right now authStore owns the logged-in client state (Supabase session/user) and keeps it available across the app, while loginStore is just duplicating a bunch of one-off form state/validation for the login page. Since you want stores/ to be strictly for shared client data, the clean approach is:
    // Keep authStore (it holds the canonical user/session data).
    // Move the login-form refs/validation back into a composable or directly into the page, so they don’t live in Pinia.
    // Drop loginStore.ts entirely.
// That way the store folder truly contains only client data models (e.g., auth, theme, search), and view-specific behavior lives in composables/components..

import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { Router } from 'vue-router'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { useAuthStore } from '@/stores'

type LoginErrors = {
  email?: string
  password?: string
}

export function useLoginForm(router: Router) {
  const authStore = useAuthStore()

  const email = ref('')
  const password = ref('')
  const rememberMe = ref(false)
  const isLoading = ref(true)
  const errors = ref<LoginErrors>({})
  const authSubscription = ref<{ unsubscribe: () => void } | null>(null)

  const isFormValid = computed(() =>
    email.value.trim() !== '' &&
    password.value.trim() !== '' &&
    Object.keys(errors.value).length === 0,
  )

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }

  const validatePassword = (value: string) => value.length >= 6

  const handleEmailChange = () => {
    if (!email.value.trim()) {
      errors.value.email = 'Email is required'
      return
    }

    if (!validateEmail(email.value)) {
      errors.value.email = 'Enter a valid email address'
      return
    }

    delete errors.value.email
  }

  const handlePasswordChange = () => {
    if (!password.value.trim()) {
      errors.value.password = 'Password is required'
      return
    }

    if (!validatePassword(password.value)) {
      errors.value.password = 'Password must be at least 6 characters'
      return
    }

    delete errors.value.password
  }

  const redirectHome = () => {
    router.replace('/')
  }

  const initializeSession = async () => {
    const session = await authStore.initSession()
    if (session) {
      redirectHome()
      return true
    }
    return false
  }

  const handleAuthChange = (event: AuthChangeEvent, session: Session | null) => {
    if (event === 'SIGNED_IN' && session) {
      redirectHome()
    }
  }

  const initAuthFlow = async () => {
    const alreadySignedIn = await initializeSession()
    if (alreadySignedIn) {
      return
    }

    isLoading.value = false
    authSubscription.value = authStore.subscribeToAuth(handleAuthChange)
  }

  const cleanupAuthListener = () => {
    authSubscription.value?.unsubscribe()
    authSubscription.value = null
  }

  onMounted(initAuthFlow)
  onUnmounted(cleanupAuthListener)

  const handleGoogleLogin = async () => {
    isLoading.value = true
    try {
      await authStore.signInWithGoogle(`${window.location.origin}/`)
    } catch (error) {
      errors.value.password = 'Google login failed. Please try again.'
      console.error('Google login failed', error)
    } finally {
      isLoading.value = false
    }
  }

  const handleSubmit = async () => {
    handleEmailChange()
    handlePasswordChange()

    if (!isFormValid.value) {
      return
    }

    isLoading.value = true
    try {
      const { error } = await authStore.signInWithPassword(email.value, password.value)
      if (error) throw error
      router.push('/')
    } catch (error) {
      errors.value.password = 'Invalid email or password'
      console.error('Email login failed', error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    email,
    password,
    rememberMe,
    isLoading,
    errors,
    isFormValid,
    handleEmailChange,
    handlePasswordChange,
    handleGoogleLogin,
    handleSubmit,
  }
}
