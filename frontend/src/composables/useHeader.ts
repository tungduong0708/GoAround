import { computed } from "vue";
import { storeToRefs } from "pinia";
import type { RouteLocationRaw } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";
import { ref } from "vue";

export function useHeader() {
  const authStore = useAuthStore();
  const router = useRouter();
  const { isAuthenticated, user } = storeToRefs(authStore);
  const isGuest = computed(() => !isAuthenticated.value);
  const showDropdown = ref(false);

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
      .map((n: string[]) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  });

  function handleProfile() {
    showDropdown.value = false;
    router.push(profileLink.value);
  }

  async function handleLogout() {
    showDropdown.value = false;
    try {
      await authStore.signOut();
    } catch (err) {
      // Log or surface sign-out errors if needed
      console.error("Failed to sign out", err);
    } finally {
      router.push({ name: "home" });
    }
  }

  return {
    isAuthenticated,
    isGuest,
    showDropdown, 
    user,
    displayName,
    avatarUrl,
    profileLink,
    profileLabel,
    profileSubtext,
    initials,
    handleProfile,
    handleLogout,
  };
}
