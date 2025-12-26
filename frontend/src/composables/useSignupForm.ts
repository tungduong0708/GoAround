import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useAuthStore, useUserProfileStore } from '@/stores'
import { UserRole } from '@/utils/types/UserRole'

export function useSignupForm() {
  const router = useRouter()
  const authStore = useAuthStore()
  const userProfileStore = useUserProfileStore()

  // --- Validation Schema ---
  const signupSchema = toTypedSchema(
    z.object({
      email: z.string().email('Enter a valid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      confirmPassword: z.string().min(6, 'Please confirm your password'),
      apiError: z.string().optional(),
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }),
  )

  // --- Initialize Form ---
  const { handleSubmit, meta, setFieldError, errors: vvErrors } = useForm({
    validationSchema: signupSchema,
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      apiError: '',
    },
  })

  // --- Fields ---
  const { value: email } = useField<string>('email')
  const { value: password } = useField<string>('password')
  const { value: confirmPassword } = useField<string>('confirmPassword')
  const { value: apiError } = useField<string>('apiError')

  // --- State ---
  const isLoading = ref(true)
  const authSubscription = ref<{ unsubscribe: () => void } | null>(null)

  const errors = computed(() => ({
    email: vvErrors.value.email,
    password: vvErrors.value.password,
    confirmPassword: vvErrors.value.confirmPassword,
    general: vvErrors.value.apiError
  }))

  const isFormValid = computed(() => meta.value.valid)

  // --- Auth Flow Logic ---
  const redirectHome = async () => {
    // Check if profile exists before redirecting
    try {
      const profileExists = await userProfileStore.fetchProfile()
      if (!profileExists) {
        // Profile not found, redirect to profile creation
        router.replace({ name: 'profile-create' })
      } else {
        // Profile exists, go to home
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
  const handleGoogleSignup = async () => {
    isLoading.value = true
    try {
      await authStore.signInWithGoogle(`${window.location.origin}/`)
    } catch (error: any) {
      setFieldError('apiError', 'Google sign up failed: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    isLoading.value = true
    try {
      await authStore.register({
        email: values.email,
        password: values.password,
        role: UserRole.TRAVELLER,
      })
      // Check profile and redirect accordingly
      await redirectHome()
    } catch (error: any) {
      setFieldError('apiError', error.message || 'Registration failed. Please try again.')
    } finally {
      isLoading.value = false
    }
  })

  return {
    email,
    password,
    confirmPassword,
    isLoading,
    errors,
    isFormValid,
    handleGoogleSignup,
    onSubmit,
  }
}
