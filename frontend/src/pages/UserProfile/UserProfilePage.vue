<script setup lang="ts">
import { ref } from "vue";
import { useUserProfile } from "@/composables";
import ProfileHeader from "@/components/UserProfile/ProfileHeader.vue";
import UserProfileTabs from "@/components/UserProfile/UserProfileTabs.vue";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon } from "lucide-vue-next";
import type { IUserUpdate } from "@/utils/interfaces";

// Initialise composable
const { user, loading, error, isMe, loadData, updateProfile } =
  useUserProfile();

// Reference to ProfileHeader for controlling the edit modal
const profileHeaderRef = ref<InstanceType<typeof ProfileHeader> | null>(null);

const retry = () => {
  loadData();
};

const handleSaveProfile = async (data: IUserUpdate) => {
  try {
    await updateProfile(data);
    // Close the modal on success
    profileHeaderRef.value?.closeEditModal();
  } catch (err: any) {
    const errorMessage =
      err?.response?.data?.detail || err.message || "Failed to update profile";
    // Pass error back to the modal to display
    profileHeaderRef.value?.closeEditModal(errorMessage);
  }
};
</script>

<template>
  <div class="bg-background pb-20">
    <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-8">
        <div class="flex flex-col gap-6 md:flex-row md:items-center">
          <Skeleton class="h-28 w-28 rounded-full" />
          <div class="space-y-4 flex-1">
            <Skeleton class="h-10 w-64" />
            <Skeleton class="h-5 w-32" />
            <div class="flex gap-6">
              <Skeleton v-for="i in 5" :key="i" class="h-5 w-20" />
            </div>
          </div>
        </div>
        <Skeleton class="h-14 w-full rounded-xl" />
        <div class="space-y-4">
          <Skeleton v-for="i in 3" :key="i" class="h-32 w-full rounded-2xl" />
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        v-motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :enter="{ opacity: 1, scale: 1, transition: { duration: 400 } }"
        class="flex h-80 flex-col items-center justify-center text-center rounded-3xl bg-secondary/30 border border-dashed border-border/60"
      >
        <div class="space-y-4">
          <div
            class="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center"
          >
            <span class="text-3xl">😕</span>
          </div>
          <p class="text-xl font-semibold text-destructive">
            Error loading profile
          </p>
          <p class="text-muted-foreground max-w-sm">{{ error }}</p>
          <Button
            variant="outline"
            class="gap-2 rounded-full hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300"
            @click="retry"
          >
            <RefreshCwIcon class="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="space-y-10">
        <!-- Profile Header -->
        <ProfileHeader
          ref="profileHeaderRef"
          v-motion
          :initial="{ opacity: 0, y: -20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
          :user="user"
          :loading="loading"
          :is-me="isMe as boolean"
          @save="handleSaveProfile"
        />

        <!-- Tabs (Only show if user exists) -->
        <UserProfileTabs
          v-if="user"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 200, duration: 500 },
          }"
          :user-id="user.id"
        />
      </div>
    </div>
  </div>
</template>
