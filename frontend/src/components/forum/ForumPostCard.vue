<script setup lang="ts">
import type { IForumPost } from "@/utils/interfaces";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageCircleIcon,
  HeartIcon,
  BarChart3Icon,
  BadgeCheckIcon,
} from "lucide-vue-next";

const props = defineProps<{
  post: IForumPost;
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
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
};
</script>

<template>
  <Card
    class="overflow-hidden rounded-3xl border border-border/50 bg-card hover:border-orange-500/30 hover:shadow-lg transition-all duration-300"
  >
    <CardContent class="p-6">
      <div class="flex gap-4">
        <!-- Avatar -->
        <div class="hidden sm:block">
          <Avatar class="size-12 border-2 border-background shadow-sm">
            <AvatarImage
              :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.username}`"
            />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
        </div>

        <div class="flex-1 space-y-4">
          <!-- Header -->
          <div class="flex items-center gap-2 text-sm">
            <Avatar class="sm:hidden size-8">
              <AvatarImage
                :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.username}`"
              />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
            <span class="font-bold text-foreground">{{
              post.author.username
            }}</span>
            <BadgeCheckIcon class="size-4 text-blue-500 fill-blue-500/10" />
            <span class="text-muted-foreground">@{{ post.author.id }}</span>
            <span class="text-muted-foreground">•</span>
            <span class="text-muted-foreground">{{
              formatDate(post.createdAt)
            }}</span>
          </div>

          <!-- Content -->
          <div class="space-y-2">
            <h3 class="text-lg font-bold leading-tight">{{ post.title }}</h3>
            <p class="text-muted-foreground leading-relaxed">
              {{ post.contentSnippet || post.content }}
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

          <!-- Images Grid -->
          <div
            v-if="post.images && post.images.length"
            class="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden mt-4 h-64"
          >
            <div
              :class="[
                post.images.length === 1 ? 'col-span-2' : 'col-span-1',
                'h-full relative',
              ]"
            >
              <img
                :src="post.images[0]"
                class="absolute inset-0 size-full object-cover hover:scale-105 transition-transform duration-500"
                alt="Post Image"
              />
            </div>
            <div
              v-if="post.images.length > 1"
              class="col-span-1 grid grid-rows-2 gap-2 h-full"
            >
              <div class="relative w-full h-full overflow-hidden">
                <img
                  :src="post.images[1]"
                  class="absolute inset-0 size-full object-cover hover:scale-105 transition-transform duration-500"
                  alt="Post Image"
                />
              </div>
              <div
                v-if="post.images.length > 2"
                class="relative w-full h-full overflow-hidden"
              >
                <img
                  :src="post.images[2]"
                  class="absolute inset-0 size-full object-cover hover:scale-105 transition-transform duration-500"
                  alt="Post Image"
                />
              </div>
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
                >{{ formatNumber(post.replyCount || 0) }}</span
              >
            </div>
            <div class="flex items-center gap-2 group cursor-pointer">
              <div
                class="p-2 rounded-full group-hover:bg-red-500/10 transition-colors"
              >
                <HeartIcon
                  class="size-5 text-muted-foreground group-hover:text-red-500"
                />
              </div>
              <!-- Mocking likes since interface doesn't have it yet -->
              <span
                class="text-sm font-medium text-muted-foreground group-hover:text-red-500"
                >{{ formatNumber(36300) }}</span
              >
            </div>
            <div class="flex items-center gap-2 group cursor-pointer">
              <div
                class="p-2 rounded-full group-hover:bg-green-500/10 transition-colors"
              >
                <BarChart3Icon
                  class="size-5 text-muted-foreground group-hover:text-green-500"
                />
              </div>
              <!-- Mocking views -->
              <span
                class="text-sm font-medium text-muted-foreground group-hover:text-green-500"
                >{{ formatNumber(97400) }}</span
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
</template>
