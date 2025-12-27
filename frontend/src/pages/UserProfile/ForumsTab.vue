<script setup lang="ts">
import { ref, onMounted } from "vue";
import { UserService } from "@/services";
import type { IUserPostResponse } from "@/utils/interfaces";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, ChevronRight, FileText } from "lucide-vue-next";
import { useRouter } from "vue-router";

interface Props {
  userId: string;
}

const props = defineProps<Props>();
const posts = ref<IUserPostResponse[]>([]);
const loading = ref(true);
const router = useRouter();

onMounted(async () => {
  try {
    const response = await UserService.getUserPosts(props.userId, {
      page: 1,
      limit: 10,
    });
    posts.value = response.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});

const navigateToPost = (postId: string) => {
  router.push(`/forums/${postId}`);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
</script>

<template>
  <div class="space-y-6">
    <!-- Section Header -->
    <div
      v-motion-slide-visible-once-left
      class="flex items-center justify-between"
    >
      <h3 class="text-xl font-semibold tracking-tight flex items-center gap-2">
        <div class="p-2 rounded-full bg-orange-500/10">
          <MessageSquare class="h-5 w-5 text-orange-500" />
        </div>
        Posts
        <Badge
          v-if="posts.length"
          variant="secondary"
          class="ml-1 bg-secondary/80 text-muted-foreground font-normal"
        >
          {{ posts.length }}
        </Badge>
      </h3>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div
        v-for="i in 3"
        :key="i"
        class="p-6 rounded-2xl border border-border/40 bg-secondary/20"
      >
        <Skeleton class="h-7 w-3/4 mb-3" />
        <Skeleton class="h-5 w-full mb-2" />
        <Skeleton class="h-5 w-2/3" />
        <div class="flex gap-4 mt-4">
          <Skeleton class="h-4 w-24" />
          <Skeleton class="h-4 w-20" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="posts.length === 0"
      v-motion
      :initial="{ opacity: 0, scale: 0.95 }"
      :enter="{ opacity: 1, scale: 1, transition: { duration: 400 } }"
      class="flex flex-col items-center justify-center py-16 text-center rounded-3xl bg-secondary/20 border border-dashed border-border/60"
    >
      <div class="p-4 rounded-full bg-secondary/50 mb-4">
        <FileText class="h-8 w-8 text-muted-foreground" />
      </div>
      <p class="font-medium text-foreground mb-1">No posts yet</p>
      <p class="text-sm text-muted-foreground">
        Forum posts will appear here when created.
      </p>
    </div>

    <!-- Posts List -->
    <div v-else class="space-y-4">
      <div
        v-for="(post, index) in posts"
        :key="post.id"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: { delay: index * 75, duration: 400 },
        }"
        class="group relative p-6 bg-card rounded-2xl border border-border/40 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300 cursor-pointer overflow-hidden"
        @click="navigateToPost(post.id)"
      >
        <!-- Decorative Gradient -->
        <div
          class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        ></div>

        <div class="relative">
          <h4
            class="text-lg font-semibold text-foreground mb-2 group-hover:text-orange-600 transition-colors flex items-center gap-2"
          >
            {{ post.title }}
            <ChevronRight
              class="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1"
            />
          </h4>

          <p class="text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {{ post.content_snippet }}
          </p>

          <div class="flex flex-wrap items-center gap-4 text-sm">
            <div class="flex items-center gap-1.5 text-muted-foreground">
              <Clock class="h-4 w-4" />
              <span>{{ formatDate(post.created_at) }}</span>
            </div>
            <div
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/50 text-muted-foreground"
            >
              <MessageSquare class="h-3.5 w-3.5" />
              <span class="font-medium">{{ post.reply_count || 0 }}</span>
              <span>replies</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
