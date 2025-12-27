<script setup lang="ts">
import type { IForumCommentSchema } from "@/utils/interfaces";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HeartIcon,
  FlagIcon,
  MessageCircleIcon,
  BadgeCheckIcon,
  PencilIcon,
} from "lucide-vue-next";
import { computed } from "vue";

const props = defineProps<{
  reply: IForumCommentSchema;
  formatDate: (date: string) => string;
  formatNumber: (num: number) => string;
  isAuthenticated: boolean;
  isLiked?: boolean;
  currentUserId?: string;
}>();

const emit = defineEmits<{
  (e: "report", replyId: string): void;
  (e: "reply", replyId: string): void;
  (e: "like", replyId: string): void;
  (e: "edit", replyId: string): void;
}>();

const isAuthor = computed(() => {
  return props.currentUserId && props.reply.user.id === props.currentUserId;
});

const getInitials = (username: string) => {
  return username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
</script>

<template>
  <div
    class="group relative flex gap-4 p-4 rounded-2xl bg-card/50 hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all duration-200"
  >
    <!-- Avatar -->
    <div class="flex-shrink-0">
      <RouterLink :to="`/users/${reply.user.id}`">
        <Avatar class="size-10 border-2 border-background shadow-sm hover:opacity-80 transition-opacity cursor-pointer">
          <AvatarImage
            :src="
              reply.user.avatar_url ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.user.username}`
            "
            :alt="reply.user.username"
          />
          <AvatarFallback class="bg-primary/10 text-primary text-xs font-medium">
            {{ getInitials(reply.user.username || 'User') }}
          </AvatarFallback>
        </Avatar>
      </RouterLink>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0 space-y-2">
      <!-- Header -->
      <div class="flex items-center flex-wrap gap-x-2 gap-y-1">
        <RouterLink :to="`/users/${reply.user.id}`" class="hover:underline">
          <span class="font-semibold text-foreground text-sm">
            {{ reply.user.username }}
          </span>
        </RouterLink>
        <BadgeCheckIcon
          v-if="reply.like_count && reply.like_count > 50"
          class="size-4 text-blue-500 fill-blue-500/10"
        />
        <RouterLink :to="`/users/${reply.user.id}`" class="hover:underline">
          <span class="text-xs text-muted-foreground">
            @{{ reply.user.username }}
          </span>
        </RouterLink>
        <span class="text-muted-foreground text-xs">•</span>
        <span class="text-xs text-muted-foreground">
          {{ formatDate(reply.created_at) }}
        </span>
      </div>

      <!-- Reply Content -->
      <p class="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
        {{ reply.content }}
      </p>

      <!-- Actions -->
      <div class="flex items-center gap-2 pt-1">
        <!-- Like Button -->
        <Button
          variant="ghost"
          size="sm"
          :class="[
            'h-auto px-3 py-1.5 rounded-full transition-colors',
            isLiked
              ? 'text-orange-500 hover:text-orange-600 bg-orange-500/10 hover:bg-orange-500/20'
              : 'text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10'
          ]"
          @click="emit('like', reply.id)"
        >
          <HeartIcon :class="['size-4 mr-1.5', isLiked && 'fill-current']" />
          <span class="text-xs font-medium">
            {{ formatNumber(reply.like_count || 0) }}
          </span>
        </Button>

        <!-- Reply Button -->
        <Button
          variant="ghost"
          size="sm"
          class="h-auto px-3 py-1.5 rounded-full text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 transition-colors"
          @click="emit('reply', reply.id)"
        >
          <MessageCircleIcon class="size-4 mr-1.5" />
          <span class="text-xs font-medium">Reply</span>
        </Button>

        <!-- Edit Button (only for author, shows on hover) -->
        <Button
          v-if="isAuthor"
          variant="ghost"
          size="sm"
          class="h-auto px-3 py-1.5 rounded-full text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-colors opacity-0 group-hover:opacity-100"
          @click="emit('edit', reply.id)"
        >
          <PencilIcon class="size-4 mr-1.5" />
          <span class="text-xs font-medium">Edit</span>
        </Button>

        <!-- Report Button -->
        <Button
          v-if="isAuthenticated"
          variant="ghost"
          size="sm"
          class="h-auto px-3 py-1.5 rounded-full text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 transition-colors opacity-0 group-hover:opacity-100"
          @click="emit('report', reply.id)"
        >
          <FlagIcon class="size-4 mr-1.5" />
          <span class="text-xs font-medium">Report</span>
        </Button>
      </div>
    </div>
  </div>
</template>
