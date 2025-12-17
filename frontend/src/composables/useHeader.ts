import { computed } from "vue";
import { storeToRefs } from "pinia";
import type { RouteLocationRaw } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

export function useHeader() {
  const authStore = useAuthStore();
  const { isAuthenticated, user } = storeToRefs(authStore);

  const displayName = computed(() => {
    return (
      user.value?.user_metadata?.full_name ||
      user.value?.email?.split("@")[0] ||
      "Guest"
    );
  });

  const avatarUrl = computed(() => {
    return user.value?.user_metadata?.avatar_url || "";
  });

  const profileLink = computed<RouteLocationRaw>(() => {
    return isAuthenticated.value ? { name: "profile" } : { name: "login" };
  });

  const profileLabel = computed(() => {
    return isAuthenticated.value ? displayName.value : "Sign In";
  });

  const profileSubtext = computed(() => {
    return isAuthenticated.value ? "My Account" : "Get Started";
  });

  const initials = computed(() => {
    if (!displayName.value || displayName.value === "Guest") return "G";
    return displayName.value
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  });

  return {
    isAuthenticated,
    user,
    displayName,
    avatarUrl,
    profileLink,
    profileLabel,
    profileSubtext,
    initials,
  };
}
