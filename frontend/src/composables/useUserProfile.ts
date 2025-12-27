import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useUserStore, useAuthStore } from "@/stores";
import { storeToRefs } from "pinia";
import type { IUserDetail, IUserPublic } from "@/utils/interfaces";

export function useUserProfile() {
  const route = useRoute();
  const store = useUserStore();
  const { user, loading, error } = storeToRefs(store);

  const isMe = computed(() => {
    if (route.name === "profile-me") return true;
    const authStore = useAuthStore();
    // If we are viewing a user by ID, check if it matches our logged-in ID
    return authStore.user?.id && user.value?.id === authStore.user.id;
  });

  const activeTab = ref("posts");

  const loadData = async () => {
    if (isMe.value) {
      await store.loadMe();
    } else {
      const userId = route.params.id as string;
      if (userId) {
        await store.loadUser(userId);
      }
    }
  };

  onMounted(() => {
    loadData();
  });

  watch(
    () => route.path,
    () => {
      loadData();
    }
  );

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
  };
}
