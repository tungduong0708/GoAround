import { defineStore } from "pinia";
import { ref } from "vue";
import type { IUserDetail, IUserPublic, IUserUpdate } from "@/utils/interfaces";
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

  let abortController: AbortController | null = null;

  const cancelPendingRequest = () => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  };

  const loadMe = async () => {
    cancelPendingRequest();
    abortController = new AbortController();

    loading.value = true;
    error.value = null;
    user.value = null;

    try {
      user.value = await UserService.getCurrentUser(abortController.signal);
    } catch (err: any) {
      if (err.code !== "ERR_CANCELED") {
        error.value = err.message || "Failed to load profile";
      }
    } finally {
      // Only turn off loading if this request wasn't cancelled (or replaced)
      if (!abortController?.signal.aborted) {
        loading.value = false;
        abortController = null;
      }
    }
  };

  const loadUser = async (id: string) => {
    cancelPendingRequest();
    abortController = new AbortController();

    loading.value = true;
    error.value = null;
    user.value = null;

    try {
      user.value = await UserService.publicProfile(id, abortController.signal);
    } catch (err: any) {
      if (err.code !== "ERR_CANCELED") {
        error.value = err.message || "Failed to load user profile";
      }
    } finally {
      if (!abortController?.signal.aborted) {
        loading.value = false;
        abortController = null;
      }
    }
  };

  const updateProfile = async (input: IUserUpdate): Promise<IUserDetail> => {
    loading.value = true;
    error.value = null;

    try {
      const updatedUser = await UserService.updateProfile(input);
      // Update the local user state with the new data
      user.value = updatedUser;
      return updatedUser;
    } catch (err: any) {
      error.value =
        err?.response?.data?.detail ||
        err.message ||
        "Failed to update profile";
      throw err;
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
    updateProfile,
  };
});
