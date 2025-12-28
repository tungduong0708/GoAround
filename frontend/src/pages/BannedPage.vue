<template>
  <div class="flex min-h-screen items-center justify-center bg-background px-4">
    <div class="w-full max-w-md space-y-6 text-center">
      <!-- Icon -->
      <div class="flex justify-center">
        <div class="rounded-full bg-destructive/10 p-6">
          <svg
            class="h-16 w-16 text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
      </div>

      <!-- Title -->
      <div class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight text-foreground">
          Account Suspended
        </h1>
        <p class="text-muted-foreground">
          Your account has been temporarily suspended due to policy violations.
        </p>
      </div>

      <!-- Ban Details -->
      <div class="rounded-lg border border-border bg-card p-6 text-left">
        <div class="space-y-4">
          <div v-if="profile?.ban_until">
            <p class="text-sm font-medium text-muted-foreground">
              Suspended Until
            </p>
            <p class="text-lg font-semibold text-foreground">
              {{ formatBanDate(profile.ban_until) }}
            </p>
          </div>
          <div v-if="profile?.ban_reason">
            <p class="text-sm font-medium text-muted-foreground">Reason</p>
            <p class="text-foreground">{{ profile.ban_reason }}</p>
          </div>
          <div v-else>
            <p class="text-sm text-muted-foreground">
              No specific reason provided. Please contact support for more information.
            </p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <button
          @click="handleLogout"
          :disabled="isLoading"
          class="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? "Logging out..." : "Log Out" }}
        </button>
        <p class="text-sm text-muted-foreground">
          If you believe this is a mistake, please
          <a
            href="mailto:support@goaround.com"
            class="font-medium text-primary hover:underline"
          >
            contact support
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore, useUserProfileStore } from "@/stores";
import { storeToRefs } from "pinia";

const router = useRouter();
const authStore = useAuthStore();
const userProfileStore = useUserProfileStore();
const { profile } = storeToRefs(userProfileStore);
const isLoading = ref(false);

const formatBanDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();

  // Check if ban is expired
  if (date < now) {
    return "Expired - Please log in again";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handleLogout = async () => {
  isLoading.value = true;
  try {
    await authStore.signOut();
    // Use replace to reset navigation stack
    router.replace({ name: "login" });
  } catch (error) {
    console.error("Failed to logout:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>
