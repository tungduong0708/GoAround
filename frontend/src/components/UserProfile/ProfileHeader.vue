<script setup lang="ts">
import { h, ref } from "vue";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Pencil,
  MessageSquare,
  MessageCircle,
  Image as ImageIcon,
  Star,
  Map,
} from "lucide-vue-next";
import { useRouter } from "vue-router";
import type {
  IUserDetail,
  IUserPublic,
  IUserStats,
  IUserUpdate,
} from "@/utils/interfaces";
import EditProfileModal from "@/components/UserProfile/EditProfileModal.vue";

interface Props {
  user: IUserDetail | IUserPublic | null;
  loading: boolean;
  isMe: boolean;
}

const props = defineProps<Props>();
const router = useRouter();

const emit = defineEmits<{
  save: [data: IUserUpdate];
}>();

// Edit Profile Modal state
const showEditModal = ref(false);
const editModalRef = ref<InstanceType<typeof EditProfileModal> | null>(null);

const goBack = () => {
  router.back();
};

const handleEditProfile = () => {
  showEditModal.value = true;
};

const handleSaveProfile = (data: IUserUpdate) => {
  emit("save", data);
};

// Method to close modal and stop submitting (called from parent after save completes)
const closeEditModal = (error?: string) => {
  if (error) {
    editModalRef.value?.stopSubmitting(error);
  } else {
    showEditModal.value = false;
  }
};

defineExpose({ closeEditModal });

// Helper for stats
const getStat = (key: keyof IUserStats) => {
  return props.user?.stats?.[key] || 0;
};

const statItems = [
  {
    key: "posts_count" as keyof IUserStats,
    label: "Posts",
    icon: MessageSquare,
  },
  {
    key: "replies_count" as keyof IUserStats,
    label: "Replies",
    icon: MessageCircle,
  },
  { key: "photos_count" as keyof IUserStats, label: "Photos", icon: ImageIcon },
  { key: "reviews_count" as keyof IUserStats, label: "Reviews", icon: Star },
  { key: "public_trips_count" as keyof IUserStats, label: "Trips", icon: Map },
];
</script>

<template>
  <div class="space-y-8">
    <!-- Back Button -->
    <Button
      v-motion
      :initial="{ opacity: 0, x: -10 }"
      :enter="{ opacity: 1, x: 0, transition: { duration: 300 } }"
      variant="ghost"
      class="gap-2 pl-0 hover:bg-transparent hover:text-orange-500 transition-colors group"
      @click="goBack"
    >
      <ArrowLeft
        class="h-5 w-5 transition-transform group-hover:-translate-x-1"
      />
      <span class="text-base font-medium">Back</span>
    </Button>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col gap-6 md:flex-row md:items-center">
      <Skeleton class="h-28 w-28 rounded-full" />
      <div class="space-y-4 flex-1">
        <Skeleton class="h-10 w-56" />
        <Skeleton class="h-5 w-32" />
        <div class="flex gap-4 flex-wrap">
          <Skeleton v-for="i in 5" :key="i" class="h-10 w-24 rounded-full" />
        </div>
      </div>
    </div>

    <!-- User Profile Card -->
    <div
      v-else-if="user"
      class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary/50 via-background to-secondary/30 border border-border/40 p-8"
    >
      <!-- Decorative Background Elements -->
      <div
        class="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"
      ></div>

      <div
        class="relative flex flex-col gap-8 md:flex-row md:items-start md:justify-between"
      >
        <div class="flex flex-1 flex-col gap-6 md:flex-row md:items-center">
          <!-- Avatar with Ring -->
          <div
            v-motion
            :initial="{ opacity: 0, scale: 0.8 }"
            :enter="{
              opacity: 1,
              scale: 1,
              transition: { delay: 100, duration: 400 },
            }"
            class="relative"
          >
            <div
              class="absolute -inset-1.5 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full opacity-75 blur"
            ></div>
            <Avatar
              class="relative h-28 w-28 border-4 border-background shadow-xl"
            >
              <AvatarImage
                :src="user.avatar_url || ''"
                :alt="user.username"
                class="object-cover"
              />
              <AvatarFallback
                class="text-3xl bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600 font-bold"
              >
                {{ user.username.charAt(0).toUpperCase() }}
              </AvatarFallback>
            </Avatar>
          </div>

          <div
            v-motion
            :initial="{ opacity: 0, x: -20 }"
            :enter="{
              opacity: 1,
              x: 0,
              transition: { delay: 200, duration: 400 },
            }"
            class="space-y-4"
          >
            <!-- Name & Type -->
            <div>
              <h1 class="text-3xl font-bold tracking-tight text-foreground">
                {{ user.full_name }}
              </h1>
              <h2 class="text-base text-muted-foreground">
                @{{ user.username }}
              </h2>
              <div class="flex items-center gap-3 mt-2">
                <Badge
                  variant="secondary"
                  class="px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium capitalize border-orange-500/20"
                >
                  {{ user.role }} Account
                </Badge>
              </div>
            </div>

            <!-- Stats -->
            <div
              v-motion
              :initial="{ opacity: 0, y: 10 }"
              :enter="{
                opacity: 1,
                y: 0,
                transition: { delay: 300, duration: 400 },
              }"
              class="flex flex-wrap items-center gap-3"
            >
              <div
                v-for="(stat, index) in statItems"
                :key="stat.key"
                v-motion
                :initial="{ opacity: 0, scale: 0.9 }"
                :enter="{
                  opacity: 1,
                  scale: 1,
                  transition: { delay: 350 + index * 50, duration: 300 },
                }"
                class="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 border border-border/50 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all duration-300 cursor-pointer group"
              >
                <component
                  :is="stat.icon"
                  class="h-4 w-4 text-muted-foreground group-hover:text-orange-500 transition-colors"
                />
                <span class="font-bold text-orange-500">{{
                  getStat(stat.key)
                }}</span>
                <span class="text-sm text-muted-foreground">{{
                  stat.label
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Profile Button -->
        <Button
          v-if="isMe"
          v-motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :enter="{
            opacity: 1,
            scale: 1,
            transition: { delay: 400, duration: 300 },
          }"
          variant="outline"
          class="gap-2 self-start rounded-full md:self-center px-6 py-5 bg-background/80 backdrop-blur-sm shadow-lg hover:shadow-xl hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300 border-border/60 group"
          @click="handleEditProfile"
        >
          <Pencil class="h-4 w-4 transition-transform group-hover:rotate-12" />
          Edit Profile
        </Button>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <EditProfileModal
      ref="editModalRef"
      v-model:open="showEditModal"
      :user="user"
      @save="handleSaveProfile"
    />
  </div>
</template>
