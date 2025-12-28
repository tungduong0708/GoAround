<script setup lang="ts">
import { RouterLink } from "vue-router";
import type { IForumPostListItem } from "@/utils/interfaces";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircleIcon, BadgeCheckIcon } from "lucide-vue-next";

const props = defineProps<{
  post: IForumPostListItem;
}>();

// Helper to format numbers (e.g. 13.1k)
const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
};

// Helper for date formatting
const formatDate = (dateStr: string) => {
  if (!dateStr) return "Unknown";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
};
</script>

<template>
  <RouterLink :to="`/forums/${post.id}`" class="block">
    <Card
      class="overflow-hidden rounded-3xl border border-border/50 bg-card hover:border-orange-500/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <CardContent class="p-6">
        <div class="flex gap-4">
          <!-- Avatar -->
          <div class="hidden sm:block">
            <RouterLink :to="`/users/${post.author.id}`" @click.stop>
              <Avatar
                class="size-12 border-2 border-background shadow-sm hover:opacity-80 transition-opacity"
              >
                <AvatarImage
                  :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.username}`"
                />
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
            </RouterLink>
          </div>

          <div class="flex-1 space-y-4">
            <!-- Header -->
            <div class="flex items-center gap-2 text-sm">
              <RouterLink :to="`/users/${post.author.id}`" @click.stop>
                <Avatar
                  class="sm:hidden size-8 hover:opacity-80 transition-opacity"
                >
                  <AvatarImage
                    :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.username}`"
                  />
                  <AvatarFallback>UN</AvatarFallback>
                </Avatar>
              </RouterLink>
              <span class="font-bold text-foreground">{{
                post.author.username || 'Anonymous'
              }}</span>
              <BadgeCheckIcon class="size-4 text-blue-500 fill-blue-500/10" />
              <span class="text-muted-foreground">@{{ post.author.id.slice(0, 8) }}</span>
              <span class="text-muted-foreground">•</span>
              <span class="text-muted-foreground">{{
                formatDate(post.created_at)
              }}</span>
            </div>

            <!-- Content -->
            <div class="space-y-2">
              <h3 class="text-lg font-bold leading-tight">{{ post.title }}</h3>
              <p class="text-muted-foreground leading-relaxed line-clamp-3">
                {{ post.content_snippet }}
              </p>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="tag in post.tags"
                  :key="tag.id"
                  class="text-blue-500 hover:underline cursor-pointer text-sm"
                  >#{{ tag.name }}</span
                >
              </div>
            </div>

            <!-- Footer/Stats -->
            <div class="flex items-center gap-6 pt-2">
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
                  >{{ formatNumber(post.reply_count || 0) }}</span
                >
              </div>

              <div class="flex gap-2 ml-auto">
                <Badge
                  v-for="tag in post.tags.slice(0, 3)"
                  :key="tag.id"
                  variant="secondary"
                  class="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-transparent"
                >
                  {{ tag.name }}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </RouterLink>
</template>
