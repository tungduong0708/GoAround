import { defineStore } from "pinia";
import { ref } from "vue";
import type { IUserDetail, IUserPublic } from "@/utils/interfaces";
import { UserService } from "@/services";

export const useUserStore = defineStore("user-profile", () => {
  // We can store either a detailed user (me) or a public user (others)
  // IUserDetail has more fields, but IUserPublic is a subset (mostly).
  // Actually checking interfaces:
  // IUserDetail: username, full_name, avatar_url, id, role, is_verified_business, stats, created_at, email
  // IUserPublic: username, full_name, avatar_url, id, role, is_verified_business, stats, created_at
  // So they are compatible for the display fields.
  const user = ref<IUserDetail | IUserPublic | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const loadMe = async () => {
    loading.value = true;
    error.value = null;
    user.value = null;
    try {
      user.value = await UserService.getCurrentUser();
    } catch (err: any) {
      error.value = err.message || "Failed to load profile";
    } finally {
      loading.value = false;
    }
  };

  const loadUser = async (id: string) => {
    loading.value = true;
    error.value = null;
    user.value = null;
    try {
      user.value = await UserService.publicProfile(id);
    } catch (err: any) {
      error.value = err.message || "Failed to load user profile";
    } finally {
      loading.value = false;
    }
  };

  return {
    user,
    loading,
    error,
    loadMe,
    loadUser,
  };
});
