<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Camera, User, AtSign } from "lucide-vue-next";
import ImageUpload from "@/components/common/ImageUpload.vue";
import type { IUserDetail, IUserPublic, IUserUpdate } from "@/utils/interfaces";

const props = defineProps<{
  open: boolean;
  user: IUserDetail | IUserPublic | null;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  save: [data: IUserUpdate];
}>();

// Form state
const username = ref("");
const fullName = ref("");
const avatarUrl = ref<string | null>(null);
const submitting = ref(false);
const errorMessage = ref<string | null>(null);
const showAvatarUpload = ref(false);

// Initialize form when modal opens or user changes
watch(
  () => [props.open, props.user],
  ([isOpen, currentUser]) => {
    if (isOpen && currentUser) {
      username.value =
        (currentUser as IUserDetail | IUserPublic).username || "";
      fullName.value =
        (currentUser as IUserDetail | IUserPublic).full_name || "";
      avatarUrl.value =
        (currentUser as IUserDetail | IUserPublic).avatar_url || null;
      errorMessage.value = null;
      showAvatarUpload.value = false;
    }
  },
  { immediate: true }
);

// Check if form has changes
const hasChanges = computed(() => {
  if (!props.user) return false;
  return (
    username.value !== props.user.username ||
    fullName.value !== (props.user.full_name || "") ||
    avatarUrl.value !== (props.user.avatar_url || null)
  );
});

// Form validation
const isValid = computed(() => {
  return username.value.trim().length >= 3 && hasChanges.value;
});

const handleOpenChange = (open: boolean) => {
  if (!open && submitting.value) return; // Prevent closing while submitting
  emit("update:open", open);
};

const handleAvatarUpdate = (url: string | string[]) => {
  avatarUrl.value = Array.isArray(url) ? url[0] || null : url || null;
  showAvatarUpload.value = false;
};

const handleSubmit = async () => {
  if (!isValid.value || submitting.value) return;

  submitting.value = true;
  errorMessage.value = null;

  try {
    const updateData: IUserUpdate = {
      username:
        username.value.trim() !== props.user?.username
          ? username.value.trim()
          : null,
      full_name:
        fullName.value.trim() !== (props.user?.full_name || "")
          ? fullName.value.trim()
          : null,
      avatar_url:
        avatarUrl.value !== (props.user?.avatar_url || null)
          ? avatarUrl.value
          : null,
    };

    emit("save", updateData);
  } catch (error: any) {
    console.error("Failed to update profile:", error);
    errorMessage.value =
      error?.response?.data?.detail ||
      "Failed to update profile. Please try again.";
    submitting.value = false;
  }
};

// Expose method to stop submitting (called from parent after save completes)
const stopSubmitting = (error?: string) => {
  submitting.value = false;
  if (error) {
    errorMessage.value = error;
  }
};

defineExpose({ stopSubmitting });
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle class="text-2xl font-bold">Edit Profile</DialogTitle>
        <DialogDescription>
          Update your profile information. Changes will be visible to other
          users.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6 py-4">
        <!-- Avatar Section -->
        <div class="flex flex-col items-center gap-4">
          <div
            class="relative group cursor-pointer"
            @click="showAvatarUpload = !showAvatarUpload"
          >
            <!-- Avatar Ring -->
            <div
              class="absolute -inset-1 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full opacity-75 blur transition-opacity group-hover:opacity-100"
            ></div>
            <Avatar
              class="relative h-24 w-24 border-4 border-background shadow-xl"
            >
              <AvatarImage
                :src="avatarUrl || ''"
                alt="Profile avatar"
                class="object-cover"
              />
              <AvatarFallback
                class="text-2xl bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600 font-bold"
              >
                {{ (fullName || username || "U").charAt(0).toUpperCase() }}
              </AvatarFallback>
            </Avatar>
            <!-- Camera overlay -->
            <div
              class="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera class="h-6 w-6 text-white" />
            </div>
          </div>
          <p class="text-sm text-muted-foreground">Click to change avatar</p>

          <!-- Avatar Upload (expandable) -->
          <div
            v-if="showAvatarUpload"
            v-motion
            :initial="{ opacity: 0, height: 0 }"
            :enter="{
              opacity: 1,
              height: 'auto',
              transition: { duration: 200 },
            }"
            class="w-full overflow-hidden"
          >
            <ImageUpload
              :model-value="avatarUrl || ''"
              upload-type="avatar"
              :multiple="false"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              :max-size-in-m-b="18"
              label=""
              :disabled="submitting"
              @update:model-value="handleAvatarUpdate"
            />
          </div>
        </div>

        <!-- Username Field -->
        <div class="space-y-2">
          <Label
            for="username"
            class="flex items-center gap-2 text-sm font-medium"
          >
            <AtSign class="h-4 w-4 text-muted-foreground" />
            Username
          </Label>
          <Input
            id="username"
            v-model="username"
            placeholder="Enter your username"
            :disabled="submitting"
            class="transition-all focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
          <p class="text-xs text-muted-foreground">
            Must be at least 3 characters. This is how others will find you.
          </p>
        </div>

        <!-- Full Name Field -->
        <div class="space-y-2">
          <Label
            for="fullName"
            class="flex items-center gap-2 text-sm font-medium"
          >
            <User class="h-4 w-4 text-muted-foreground" />
            Full Name
          </Label>
          <Input
            id="fullName"
            v-model="fullName"
            placeholder="Enter your full name"
            :disabled="submitting"
            class="transition-all focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
          <p class="text-xs text-muted-foreground">
            Your display name shown on your profile and posts.
          </p>
        </div>

        <!-- Error Message -->
        <div
          v-if="errorMessage"
          v-motion
          :initial="{ opacity: 0, y: -10 }"
          :enter="{ opacity: 1, y: 0 }"
          class="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-4 text-red-800 dark:text-red-200 text-sm"
        >
          {{ errorMessage }}
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 justify-end pt-2">
        <Button
          variant="outline"
          class="rounded-full px-6"
          @click="handleOpenChange(false)"
          :disabled="submitting"
        >
          Cancel
        </Button>
        <Button
          class="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25"
          @click="handleSubmit"
          :disabled="!isValid || submitting"
        >
          <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
          {{ submitting ? "Saving..." : "Save Changes" }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
