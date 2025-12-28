import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { useAuthStore, useUserProfileStore } from "@/stores";

export function useLoginForm() {
  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();
  const userProfileStore = useUserProfileStore();

  // --- Validation Schema ---
  const loginSchema = toTypedSchema(
    z.object({
      email: z.string().email("Enter a valid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      rememberMe: z.boolean().optional(),
      apiError: z.string().optional(), // For general API errors
    })
  );

  // --- Initialize Form ---
  // 3. Keep 'handleSubmit' (don't rename) so we can use it below
  const {
    handleSubmit,
    meta,
    setFieldError,
    errors: vvErrors,
  } = useForm({
    validationSchema: loginSchema,
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
      apiError: "", // For general API errors
    },
  });

  // --- Fields ---
  const { value: email } = useField<string>("email");
  const { value: password } = useField<string>("password");
  const { value: rememberMe } = useField<boolean>("rememberMe");

  // --- State ---
  const isLoading = ref(true);
  const authSubscription = ref<{ unsubscribe: () => void } | null>(null);

  // Capture redirect path once at initialization (before any navigation occurs)
  const redirectPath = route.query.redirect as string | undefined;
  const hasRedirected = ref(false);

  const errors = computed(() => ({
    email: vvErrors.value.email,
    password: vvErrors.value.password,
    // Add a general form error if needed
    general: vvErrors.value.apiError,
  }));

  const isFormValid = computed(() => meta.value.valid);

  // --- Auth Flow Logic ---
  const redirectAfterLogin = async () => {
    // Prevent multiple redirects
    if (hasRedirected.value) {
      console.log("[useLoginForm] Already redirected, skipping...");
      return;
    }
    hasRedirected.value = true;

    // Redirect to auth callback page which will check profile
    console.log("[useLoginForm] Redirecting to auth callback page");
    router.replace({ name: "auth-callback" });
  };

  const initializeSession = async () => {
    const session = await authStore.initSession();
    if (session) {
      redirectAfterLogin();
      return true;
    }
    return false;
  };

  const handleAuthChange = (
    event: AuthChangeEvent,
    session: Session | null
  ) => {
    if (event === "SIGNED_IN" && session) {
      redirectAfterLogin();
    }
  };

  const initAuthFlow = async () => {
    const alreadySignedIn = await initializeSession();
    if (alreadySignedIn) return;

    isLoading.value = false;
    authSubscription.value = authStore.subscribeToAuth(handleAuthChange);
  };

  // --- Lifecycle ---
  onMounted(initAuthFlow);

  onUnmounted(() => {
    authSubscription.value?.unsubscribe();
  });

  // --- Actions ---
  const handleGoogleLogin = async () => {
    isLoading.value = true;
    try {
      await authStore.signInWithGoogle(`${window.location.origin}/auth/callback`);
    } catch (error: any) {
      // Set a manual error on a specific field or a general area
      setFieldError("apiError", "Google login failed: " + error.message);
    } finally {
      isLoading.value = false;
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    isLoading.value = true;
    try {
      const { error } = await authStore.signInWithPassword(values.email, values.password)
      if (error) throw error
      // Check profile and redirect accordingly
      await redirectAfterLogin();
    } catch (error: any) {
      // 4. KEY FIX: Feed the error back to the UI
      // Assuming 'error.message' contains "Invalid login credentials"
      setFieldError("apiError", error.message || "Invalid email or password");
    } finally {
      isLoading.value = false;
    }
  });

  return {
    email,
    password,
    rememberMe,
    isLoading,
    errors,
    isFormValid,
    handleGoogleLogin,
    onSubmit,
  };
}
