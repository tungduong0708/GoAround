<script setup lang="ts">
import { ref } from "vue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  MessageCircle,
  Image as ImageIcon,
  Star,
  Map,
} from "lucide-vue-next";
// Import Tab Contents
import UserPostsTab from "@/pages/UserProfile/ForumsTab.vue";
import UserRepliesTab from "@/pages/UserProfile/FeedTab.vue";
import UserPhotosTab from "@/pages/UserProfile/PhotosTab.vue";
import UserReviewsTab from "@/pages/UserProfile/ReviewsTab.vue";
import UserTripsTab from "@/pages/UserProfile/TripsTab.vue";

interface Props {
  userId: string;
}

const props = defineProps<Props>();
const activeTab = ref("posts");

const tabs = [
  { value: "posts", label: "Posts", icon: MessageSquare },
  { value: "replies", label: "Replies", icon: MessageCircle },
  { value: "photos", label: "Photos", icon: ImageIcon },
  { value: "reviews", label: "Reviews", icon: Star },
  { value: "trips", label: "Trips", icon: Map },
];
</script>

<template>
  <Tabs v-model="activeTab" default-value="posts" class="w-full">
    <!-- Tab Navigation -->
    <div
      v-motion-slide-visible-once-top
      class="relative overflow-hidden rounded-2xl bg-secondary/30 p-1.5 border border-border/40"
    >
      <TabsList class="w-full grid grid-cols-5 gap-1 bg-transparent h-auto p-0">
        <TabsTrigger
          v-for="(tab, index) in tabs"
          :key="tab.value"
          :value="tab.value"
          v-motion
          :initial="{ opacity: 0, y: -10 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: index * 50, duration: 300 },
          }"
          class="relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-muted-foreground transition-all duration-300 data-[state=active]:bg-background data-[state=active]:text-orange-600 data-[state=active]:shadow-md hover:text-foreground hover:bg-background/50"
        >
          <component :is="tab.icon" class="h-4 w-4" />
          <span class="hidden sm:inline">{{ tab.label }}</span>
        </TabsTrigger>
      </TabsList>
    </div>

    <!-- Tab Contents with Animations -->
    <div class="mt-8">
      <TabsContent
        value="posts"
        class="m-0 focus-visible:ring-0 focus-visible:outline-none"
      >
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
        >
          <UserPostsTab :user-id="userId" />
        </div>
      </TabsContent>

      <TabsContent
        value="replies"
        class="m-0 focus-visible:ring-0 focus-visible:outline-none"
      >
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
        >
          <UserRepliesTab :user-id="userId" />
        </div>
      </TabsContent>

      <TabsContent
        value="photos"
        class="m-0 focus-visible:ring-0 focus-visible:outline-none"
      >
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
        >
          <UserPhotosTab :user-id="userId" />
        </div>
      </TabsContent>

      <TabsContent
        value="reviews"
        class="m-0 focus-visible:ring-0 focus-visible:outline-none"
      >
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
        >
          <UserReviewsTab :user-id="userId" />
        </div>
      </TabsContent>

      <TabsContent
        value="trips"
        class="m-0 focus-visible:ring-0 focus-visible:outline-none"
      >
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
        >
          <UserTripsTab :user-id="userId" />
        </div>
      </TabsContent>
    </div>
  </Tabs>
</template>
