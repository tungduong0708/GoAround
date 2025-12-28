import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { supabase } from "@/config/supabase/supabase";
import { AuthenticationService } from "@/services";
import { UserRole } from "@/utils/types/UserRole";
import { useUserProfileStore } from "./userProfileStore";

export const useAuthStore = defineStore("auth", () => {
  const session = ref<Session | null>(null);
  const user = ref<User | null>(null);
  const role = ref<UserRole | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!session.value);

  const setAuthState = (nextSession: Session | null) => {
    session.value = nextSession;
    user.value = nextSession?.user ?? null;
    role.value =
      (nextSession?.user?.user_metadata?.role as UserRole | undefined) ?? null;
  };

  const initSession = async () => {
    try {
      const current = await AuthenticationService.getSession();
      setAuthState(current ?? null);
      return current ?? null;
    } catch (err: any) {
      error.value = err?.message ?? "Failed to initialize session";
      return null;
    }
  };

  const initialize = async () => {
    isLoading.value = true;
    error.value = null;
    await initSession();

    supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setAuthState(currentSession)
      
      // Fetch profile when user signs in
      if (event === 'SIGNED_IN' && currentSession) {
        const userProfileStore = useUserProfileStore()
        try {
          await userProfileStore.fetchProfile()
        } catch (err) {
          console.error('Failed to fetch profile after sign in:', err)
        }
      }
      
      // Clear profile when user signs out
      if (event === 'SIGNED_OUT') {
        const userProfileStore = useUserProfileStore()
        userProfileStore.clearProfile()
      }
    })

    isLoading.value = false

    // Fetch profile if user is authenticated
    if (isAuthenticated.value) {
      const userProfileStore = useUserProfileStore()
      try {
        await userProfileStore.fetchProfile()
      } catch (err) {
        console.error('Failed to fetch profile during auth initialization:', err)
      }
    }
  }

  const subscribeToAuth = (callback?: (event: AuthChangeEvent, session: Session | null) => void) => {
    const { data } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setAuthState(currentSession)
      
      // Fetch profile when user signs in
      if (event === 'SIGNED_IN' && currentSession) {
        const userProfileStore = useUserProfileStore()
        try {
          await userProfileStore.fetchProfile()
        } catch (err) {
          console.error('Failed to fetch profile after sign in:', err)
        }
      }
      
      // Clear profile when user signs out
      if (event === 'SIGNED_OUT') {
        const userProfileStore = useUserProfileStore()
        userProfileStore.clearProfile()
      }
      
      callback?.(event, currentSession)
    })
    return data.subscription
  }

  const signInWithPassword = async (email: string, password: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const { user: signedInUser, session: signedInSession } =
        await AuthenticationService.signIn({ email, password });
      setAuthState(signedInSession ?? null);
      return { user: signedInUser, session: signedInSession, error: null };
    } catch (err: any) {
      error.value = err?.message ?? "Login failed";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const signInWithGoogle = async (redirectTo: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (signInError) throw signInError;
      return data;
    } catch (err: any) {
      error.value = err?.message ?? "Google login failed";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (input: {
    email: string;
    password: string;
    fullName?: string;
    phone?: string;
    username?: string;
    role?: UserRole;
  }) => {
    isLoading.value = true;
    error.value = null;
    try {
      const { user: newUser, session: newSession } =
        await AuthenticationService.signUp({
          email: input.email,
          password: input.password,
          full_name: input.fullName ?? "",
          phone: input.phone ?? "",
          username: input.username ?? "",
          role: input.role ?? UserRole.TRAVELLER,
        });
      setAuthState(newSession ?? null);
      return { user: newUser, session: newSession };
    } catch (err: any) {
      error.value = err?.message ?? "Registration failed";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const signOut = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      // Sign out from Supabase - this clears access token from storage
      await AuthenticationService.signOut();
      console.log("User signed out successfully");
      // Clear local auth state
      setAuthState(null);
      session.value = null;
      user.value = null;
      role.value = null;

      // Clear profile store
      const userProfileStore = useUserProfileStore();
      userProfileStore.clearProfile();
    } catch (err: any) {
      error.value = err?.message ?? "Sign out failed";
      // Even if signout fails, clear local state
      setAuthState(null);
      session.value = null;
      user.value = null;
      role.value = null;

      const userProfileStore = useUserProfileStore();
      userProfileStore.clearProfile();
    } finally {
      isLoading.value = false;
    }
  };

  const upgradeToBusinessOwner = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const updatedUser = await AuthenticationService.updateUserMetadata({
        role: UserRole.BUSINESS_OWNER,
      });
      if (updatedUser) {
        user.value = updatedUser;
        role.value = UserRole.BUSINESS_OWNER;
      }
    } catch (err: any) {
      error.value = err?.message ?? "Failed to upgrade role";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

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
  };
});
