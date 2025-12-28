import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useUserStore, useAuthStore } from "@/stores";
import { useUserProfileStore } from "@/stores/userProfileStore";
import { storeToRefs } from "pinia";
import type { IUserDetail, IUserUpdate } from "@/utils/interfaces";

export function useUserProfile() {
  const route = useRoute();
  const store = useUserStore();

  // Reset state immediately to prevent flash of stale data from previous route
  store.user = null;
  store.error = null;

  const { user, loading, error } = storeToRefs(store);

  const isMe = computed(() => {
    if (route.name === "profile-me") return true;
    const authStore = useAuthStore();
    // If we are viewing a user by ID, check if it matches our logged-in ID
    return authStore.user?.id && user.value?.id === authStore.user.id;
  });

  const activeTab = ref("posts");

  const loadData = async () => {
    const authStore = useAuthStore();
    const userId = route.params.id as string;

    if (route.name === "profile-me") {
      await store.loadMe();
    } else if (userId) {
      // If the user attempts to view their own public profile via ID,
      // load the detailed 'me' profile instead to allow editing/private info.
      if (authStore.user?.id === userId) {
        await store.loadMe();
      } else {
        await store.loadUser(userId);
      }
    }
  };

  onMounted(() => {
    loadData();
  });

  const displayName = computed(
    () => user.value?.full_name || user.value?.username || "User"
  );
  const avatarUrl = computed(() => user.value?.avatar_url || "");
  const role = computed(() => user.value?.role || "traveler");

  // Stats helpers
  const stats = computed(() => {
    if (!user.value?.stats) return null;
    return user.value.stats;
  });

  // Update profile handler
  const updateProfile = async (input: IUserUpdate): Promise<IUserDetail> => {
    const userProfileStore = useUserProfileStore();
    const updatedUser = await store.updateProfile(input);

    // Also update the userProfileStore's profile data if it exists
    userProfileStore.updateProfile(updatedUser);

    return updatedUser;
  };

  return {
    user,
    loading,
    error,
    isMe,
    activeTab,
    displayName,
    avatarUrl,
    role,
    stats,
    loadData,
    updateProfile,
  };
}
