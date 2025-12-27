import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router' // 1. Import useRouter here
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useAuthStore, useUserProfileStore } from '@/stores'

export function useLoginForm() { // 2. No arguments needed now
  const router = useRouter()     //    Get router instance internally
  const authStore = useAuthStore()
  const userProfileStore = useUserProfileStore()

  // --- Validation Schema ---
  const loginSchema = toTypedSchema(
    z.object({
      email: z.string().email('Enter a valid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      rememberMe: z.boolean().optional(),
      apiError: z.string().optional(), // For general API errors
    }),
  )

  // --- Initialize Form ---
  // 3. Keep 'handleSubmit' (don't rename) so we can use it below
  const { handleSubmit, meta, setFieldError, errors: vvErrors } = useForm({
    validationSchema: loginSchema,
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
      apiError: '', // For general API errors
    },
  })

  // --- Fields ---
  const { value: email } = useField<string>('email')
  const { value: password } = useField<string>('password')
  const { value: rememberMe } = useField<boolean>('rememberMe')

  // --- State ---
  const isLoading = ref(true)
  const authSubscription = ref<{ unsubscribe: () => void } | null>(null)

  const errors = computed(() => ({
    email: vvErrors.value.email,
    password: vvErrors.value.password,
    // Add a general form error if needed
    general: vvErrors.value.apiError 
  }))

  const isFormValid = computed(() => meta.value.valid)

  // --- Auth Flow Logic ---
  const redirectHome = async () => {
    // Check if profile exists before redirecting
    try {
      console.log('[useLoginForm] Checking profile existence...')
      const profileExists = await userProfileStore.fetchProfile()
      console.log('[useLoginForm] Profile exists:', profileExists)
      if (!profileExists) {
        // Profile not found, redirect to profile creation
        console.log('[useLoginForm] Redirecting to profile creation')
        router.replace({ name: 'profile-create' })
      } else {
        // Profile exists, go to home
        console.log('[useLoginForm] Redirecting to home')
        router.replace('/')
      }
    } catch (error) {
      // On other non-404 errors, still go home (e.g., network issues)
      console.error('Error checking profile:', error)
      router.replace('/')
    }
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
    if (alreadySignedIn) return

    isLoading.value = false
    authSubscription.value = authStore.subscribeToAuth(handleAuthChange)
  }

  // --- Lifecycle ---
  onMounted(initAuthFlow)
  
  onUnmounted(() => {
    authSubscription.value?.unsubscribe()
  })

  // --- Actions ---
  const handleGoogleLogin = async () => {
    isLoading.value = true
    try {
      await authStore.signInWithGoogle(`${window.location.origin}/`)
    } catch (error: any) {
      // Set a manual error on a specific field or a general area
      setFieldError('apiError', 'Google login failed: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    isLoading.value = true
    try {
      const { error } = await authStore.signInWithPassword(values.email, values.password)
      if (error) throw error
      // Wait a bit for the session to be fully set before checking profile
      await new Promise(resolve => setTimeout(resolve, 100))
      // Check profile and redirect accordingly
      await redirectHome()
    } catch (error: any) {
      // 4. KEY FIX: Feed the error back to the UI
      // Assuming 'error.message' contains "Invalid login credentials"
      setFieldError('apiError', error.message || 'Invalid email or password')
    } finally {
      isLoading.value = false
    }
  })

  return {
    email,
    password,
    rememberMe,
    isLoading,
    errors,
    isFormValid,
    handleGoogleLogin,
    onSubmit,
  }
}