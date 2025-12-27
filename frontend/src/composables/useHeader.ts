import { computed } from "vue";
import { storeToRefs } from "pinia";
import type { RouteLocationRaw } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserProfileStore } from "@/stores";
import { useRouter } from "vue-router";
import { ref } from "vue";

export function useHeader() {
  const authStore = useAuthStore();
  const userProfileStore = useUserProfileStore();
  const router = useRouter();
  const { isAuthenticated, user } = storeToRefs(authStore);
  const { profile } = storeToRefs(userProfileStore);
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
    return profile.value?.avatar_url || user.value?.user_metadata?.avatar_url || "";
  });

  const profileLink = computed<RouteLocationRaw>(() => {
    return isAuthenticated.value ? { name: "profile" } : { name: "login" };
  });

  const profileLabel = computed(() => {
    return isAuthenticated.value ? displayName.value : "Sign In";
  });

  const profileSubtext = computed(() => {
    if (!isAuthenticated.value) return "Get Started";
    
    const role = profile.value?.role || 'traveler';
    const roleLabels = {
      traveler: 'Traveler',
      business: 'Business',
      admin: 'Administrator'
    };
    
    return roleLabels[role] || 'Traveler';
  });

  const accountType = computed(() => {
    return profile.value?.role || 'traveler';
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

  function handleManagePlaces() {
    showDropdown.value = false;
    router.push({ name: 'manage-places' });
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
    accountType,
    handleProfile,
    handleManagePlaces,
    handleLogout,
  };
}
