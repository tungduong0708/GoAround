<script setup lang="ts">
import { MessageCircleIcon, HeartIcon, BarChart3Icon } from "lucide-vue-next";

defineProps<{
  replyCount: number;
  likeCount: number;
  viewCount: number;
  formatNumber: (num: number) => string;
  isLiked?: boolean;
  isLiking?: boolean;
  isAuthenticated?: boolean;
}>();

const emit = defineEmits<{
  toggleLike: [];
}>();
</script>

<template>
  <div class="flex items-center gap-6">
    <!-- Replies -->
    <div class="flex items-center gap-2 group cursor-pointer">
      <div
        class="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors"
      >
        <MessageCircleIcon
          class="size-5 text-muted-foreground group-hover:text-blue-500"
        />
      </div>
      <span
        class="text-sm font-medium text-muted-foreground group-hover:text-blue-500"
      >
        {{ formatNumber(replyCount) }}
      </span>
    </div>

    <!-- Likes -->
    <div 
      class="flex items-center gap-2 group cursor-pointer"
      :class="{ 'opacity-50 cursor-not-allowed': isLiking }"
      @click="isAuthenticated && !isLiking ? emit('toggleLike') : null"
    >
      <div class="p-2 rounded-full group-hover:bg-red-500/10 transition-colors">
        <HeartIcon
          :class="[
            'size-5 transition-colors',
            isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground group-hover:text-red-500'
          ]"
        />
      </div>
      <span
        :class="[
          'text-sm font-medium transition-colors',
          isLiked ? 'text-red-500' : 'text-muted-foreground group-hover:text-red-500'
        ]"
      >
        {{ formatNumber(likeCount) }}
      </span>
    </div>

    <!-- Views -->
    <div class="flex items-center gap-2 group cursor-pointer">
      <div
        class="p-2 rounded-full group-hover:bg-green-500/10 transition-colors"
      >
        <BarChart3Icon
          class="size-5 text-muted-foreground group-hover:text-green-500"
        />
      </div>
      <span
        class="text-sm font-medium text-muted-foreground group-hover:text-green-500"
      >
        {{ formatNumber(viewCount) }}
      </span>
    </div>
  </div>
</template>
