import { ref, watch } from "vue";
import { useAuthStore } from "@/stores";

/**
 * Provides a simple auth gate with a login prompt toggle.
 * guardAction will open the prompt when unauthenticated; otherwise it runs the action.
 */
export function useAuthGuard() {
  const authStore = useAuthStore();
  const showLoginPrompt = ref(false);

  // Immediately show prompt when not authenticated, and keep it in sync on changes
  const syncPrompt = (authed: boolean) => {
    showLoginPrompt.value = !authed;
  };

  syncPrompt(authStore.isAuthenticated);

  watch(
    () => authStore.isAuthenticated,
    (authed) => syncPrompt(authed),
  );

  const guardAction = (action: () => void) => {
    if (!authStore.isAuthenticated) {
      showLoginPrompt.value = true;
      return;
    }
    action();
  };

  return { showLoginPrompt, guardAction };
}
