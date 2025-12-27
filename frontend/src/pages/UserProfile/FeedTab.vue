<script setup lang="ts">
import { ref, onMounted } from "vue";
import { UserService } from "@/services";
import type { IUserReplyResponse } from "@/utils/interfaces";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Clock, Reply, ChevronRight } from "lucide-vue-next";
import { useRouter } from "vue-router";

interface Props {
  userId: string;
}

const props = defineProps<Props>();
const replies = ref<IUserReplyResponse[]>([]);
const loading = ref(true);
const router = useRouter();

onMounted(async () => {
  try {
    const response = await UserService.getUserReplies(props.userId, {
      page: 1,
      limit: 10,
    });
    replies.value = response.data;
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
        <div class="p-2 rounded-full bg-blue-500/10">
          <MessageCircle class="h-5 w-5 text-blue-500" />
        </div>
        Replies
        <Badge
          v-if="replies.length"
          variant="secondary"
          class="ml-1 bg-secondary/80 text-muted-foreground font-normal"
        >
          {{ replies.length }}
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
        <Skeleton class="h-5 w-20 mb-3" />
        <Skeleton class="h-6 w-2/3 mb-4" />
        <div class="pl-4 border-l-2 border-orange-500/30 py-2">
          <Skeleton class="h-5 w-full" />
        </div>
        <Skeleton class="h-4 w-24 mt-4" />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="replies.length === 0"
      v-motion
      :initial="{ opacity: 0, scale: 0.95 }"
      :enter="{ opacity: 1, scale: 1, transition: { duration: 400 } }"
      class="flex flex-col items-center justify-center py-16 text-center rounded-3xl bg-secondary/20 border border-dashed border-border/60"
    >
      <div class="p-4 rounded-full bg-secondary/50 mb-4">
        <Reply class="h-8 w-8 text-muted-foreground" />
      </div>
      <p class="font-medium text-foreground mb-1">No replies yet</p>
      <p class="text-sm text-muted-foreground">
        Replies to forum posts will appear here.
      </p>
    </div>

    <!-- Replies List -->
    <div v-else class="space-y-4">
      <div
        v-for="(reply, index) in replies"
        :key="reply.id"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: { delay: index * 75, duration: 400 },
        }"
        class="group p-6 bg-card rounded-2xl border border-border/40 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer overflow-hidden"
        @click="navigateToPost(reply.post_id)"
      >
        <!-- Reply Badge -->
        <div class="mb-4">
          <Badge
            class="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-medium"
          >
            <Reply class="h-3 w-3 mr-1.5" />
            Replied to
          </Badge>
        </div>

        <!-- Original Post Title -->
        <h4
          class="font-semibold text-foreground mb-4 group-hover:text-blue-600 transition-colors flex items-center gap-2"
        >
          {{ reply.post_title }}
          <ChevronRight
            class="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1"
          />
        </h4>

        <!-- Reply Content -->
        <div
          class="relative pl-4 border-l-3 border-orange-500/50 bg-gradient-to-r from-secondary/50 to-transparent p-4 rounded-r-xl"
        >
          <div
            class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-amber-500 rounded-full"
          ></div>
          <p class="text-sm text-foreground/90 leading-relaxed">
            {{ reply.content }}
          </p>
        </div>

        <!-- Meta Info -->
        <div class="mt-4 flex items-center text-sm text-muted-foreground">
          <Clock class="h-4 w-4 mr-1.5" />
          <span>{{ formatDate(reply.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.border-l-3 {
  border-left-width: 3px;
}
</style>
