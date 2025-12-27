<script setup lang="ts">
import { useForumPost } from "@/composables";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ForumImageGallery from "@/components/forum/ForumImageGallery.vue";
import ForumPostStats from "@/components/forum/ForumPostStats.vue";
import ForumReplyCard from "@/components/forum/ForumReplyCard.vue";
import ForumReplyEditor from "@/components/forum/ForumReplyEditor.vue";
import ForumReportDialog from "@/components/forum/ForumReportDialog.vue";
import {
  ArrowLeftIcon,
  BadgeCheckIcon,
  FlagIcon,
  PencilIcon,
  MessageCircleIcon,
  Loader2Icon,
} from "lucide-vue-next";

const {
  // State
  post,
  replies,
  replyPagination,
  loading,
  repliesLoading,
  error,
  isAuthenticated,
  isAuthor,
  hasMoreReplies,
  canReply,
  timeUntilCanReply,
  isLiked,
  isLiking,

  // Reply editor
  isReplyEditorOpen,
  replyContent,
  replyError,
  replyFormMeta,
  openReplyEditor,
  closeReplyEditor,
  submitReply,

  // Report dialog
  isReportDialogOpen,
  reportReason,
  reportReasonError,
  reportDetails,
  reportDetailsError,
  reportReasons,
  openReportDialog,
  closeReportDialog,
  submitReport,

  // Actions
  loadMoreReplies,
  goBack,
  formatDate,
  formatNumber,
  toggleLike,
} = useForumPost();
</script>

<template>
  <div class="bg-background pb-20">
    <div class="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <!-- Back Button -->
      <Button
        variant="ghost"
        class="rounded-xl text-muted-foreground hover:text-foreground -ml-2"
        @click="goBack"
      >
        <ArrowLeftIcon class="size-4 mr-2" />
        Back to forum
      </Button>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-6">
        <Card class="rounded-3xl border-border/50">
          <CardContent class="p-6 space-y-4">
            <div class="flex items-center gap-3">
              <Skeleton class="size-12 rounded-full" />
              <div class="space-y-2">
                <Skeleton class="h-4 w-32" />
                <Skeleton class="h-3 w-24" />
              </div>
            </div>
            <Skeleton class="h-6 w-3/4" />
            <Skeleton class="h-20 w-full" />
            <Skeleton class="h-64 w-full rounded-2xl" />
          </CardContent>
        </Card>
      </div>

      <!-- Error / Not Found State -->
      <div
        v-else-if="error || !post"
        class="text-center py-20 bg-muted/30 rounded-3xl border border-dashed"
      >
        <h3 class="text-xl font-bold">Post Not Found</h3>
        <p class="text-muted-foreground mt-2">
          This topic has been removed or does not exist.
        </p>
        <Button variant="outline" class="mt-6 rounded-xl" @click="goBack">
          Return to Forum
        </Button>
      </div>

      <!-- Post Content -->
      <template v-else>
        <!-- Main Post Card -->
        <Card
          v-motion-slide-visible-once-bottom
          class="rounded-3xl border-border/50 overflow-hidden"
        >
          <CardContent class="p-6 space-y-4">
            <!-- Author Header -->
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <Avatar class="size-12 border-2 border-background shadow-sm">
                  <AvatarImage
                    :src="
                      post.author.avatar_url ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.username}`
                    "
                    :alt="post.author.username"
                  />
                  <AvatarFallback
                    class="bg-primary/10 text-primary font-medium"
                  >
                    {{ post?.author.username ? post.author.username.slice(0, 2).toUpperCase() : '' }}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-foreground">
                      {{ post.author.username }}
                    </span>
                    <BadgeCheckIcon
                      class="size-4 text-blue-500 fill-blue-500/10"
                    />
                  </div>
                  <div
                    class="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span>@{{ post.author.username }}</span>
                    <span>•</span>
                    <span>{{ formatDate(post.created_at) }}</span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-2">
                <Button
                  v-if="isAuthor"
                  variant="ghost"
                  size="sm"
                  class="rounded-xl text-muted-foreground hover:text-foreground"
                >
                  <PencilIcon class="size-4 mr-1" />
                  Edit
                </Button>
                <Button
                  v-if="isAuthenticated"
                  variant="ghost"
                  size="sm"
                  class="rounded-xl text-muted-foreground hover:text-orange-500"
                  @click="openReportDialog('post', post.id)"
                >
                  <FlagIcon class="size-4" />
                </Button>
              </div>
            </div>

            <!-- Post Title -->
            <h1
              class="text-xl sm:text-2xl font-bold text-foreground leading-tight"
            >
              {{ post.title }}
            </h1>

            <!-- Post Content -->
            <p class="text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {{ post.content ? post.content : post.content }}
            </p>

            <!-- Tags (inline hashtags) -->
            <div class="flex flex-wrap gap-1">
              <span
                v-for="tag in post.tags"
                :key="tag.id"
                class="text-blue-500 hover:underline cursor-pointer text-sm"
              >
                #{{ tag.name }}
              </span>
            </div>

            <!-- Image Gallery -->
            <ForumImageGallery
              v-if="post.images && post.images.length"
              :images="post.images.map((image) => image.image_url)"
            />

            <!-- Tag Badges -->
            <div class="flex flex-wrap gap-2 pt-2">
              <Badge
                v-for="tag in post.tags"
                :key="tag.id"
                variant="secondary"
                class="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-transparent rounded-lg"
              >
                {{ tag.name }}
              </Badge>
            </div>

            <!-- Stats -->
            <ForumPostStats
              :reply-count="post.reply_count || 0"
              :like-count="post.like_count || 0"
              :view-count="post.view_count || 0"
              :format-number="formatNumber"
              :is-liked="isLiked"
              :is-liking="isLiking"
              :is-authenticated="isAuthenticated"
              @toggle-like="toggleLike"
            />

          </CardContent>
        </Card>

        <!-- Replies Section -->
        <Card
          v-motion-slide-visible-once-bottom
          :delay="200"
          class="rounded-3xl border-border/50 overflow-hidden"
        >
          <CardContent class="p-6 space-y-6">
            <!-- Replies Header -->
            <div class="flex items-center justify-between">
              <h2
                class="text-lg font-bold text-foreground flex items-center gap-2"
              >
                <MessageCircleIcon class="size-5" />
                Replies
                <span class="text-muted-foreground font-normal text-sm">
                  ({{ replyPagination?.total_items || 0 }})
                </span>
              </h2>

              <!-- Reply Button (when editor is closed) -->
              <Button
                v-if="!isReplyEditorOpen"
                size="sm"
                class="rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white"
                @click="openReplyEditor"
              >
                <MessageCircleIcon class="size-4 mr-1.5" />
                {{ isAuthenticated ? "Write a Reply" : "Login to Reply" }}
              </Button>
            </div>

            <!-- Reply Editor -->
            <ForumReplyEditor
              v-if="isReplyEditorOpen"
              v-model="replyContent"
              :error="replyError"
              :is-submitting="repliesLoading"
              :can-submit="replyFormMeta.valid && !!replyContent?.trim()"
              :cooldown-seconds="canReply ? 0 : timeUntilCanReply"
              placeholder="Share a thought..."
              @submit="submitReply"
              @cancel="closeReplyEditor"
            />

            <!-- Replies List -->
            <div v-if="replies.length > 0" class="space-y-2">
              <template v-for="reply in replies.filter(r => !r.parent_id)" :key="reply.id">
                <!-- Top-level reply -->
                <ForumReplyCard
                  :reply="reply"
                  :format-date="formatDate"
                  :format-number="formatNumber"
                  :is-authenticated="isAuthenticated"
                  @report="openReportDialog('comment', $event)"
                  @reply="openReplyEditor"
                />
                
                <!-- Nested replies -->
                <div 
                  v-if="replies.filter(r => r.parent_id === reply.id).length > 0"
                  class="ml-8 space-y-2 border-l-2 border-border/50 pl-4"
                >
                  <ForumReplyCard
                    v-for="nestedReply in replies.filter(r => r.parent_id === reply.id)"
                    :key="nestedReply.id"
                    :reply="nestedReply"
                    :format-date="formatDate"
                    :format-number="formatNumber"
                    :is-authenticated="isAuthenticated"
                    @report="openReportDialog('comment', $event)"
                    @reply="openReplyEditor"
                  />
                </div>
              </template>
            </div>

            <!-- Empty Replies State -->
            <div
              v-else-if="!repliesLoading"
              class="text-center py-10 text-muted-foreground"
            >
              <MessageCircleIcon class="size-12 mx-auto mb-3 opacity-40" />
              <p class="font-medium">No replies yet</p>
              <p class="text-sm">Be the first to share your thoughts!</p>
            </div>

            <!-- Loading Replies -->
            <div v-if="repliesLoading" class="space-y-4">
              <div
                v-for="i in 3"
                :key="i"
                class="flex gap-4 p-4 rounded-2xl border border-border/30"
              >
                <Skeleton class="size-10 rounded-full flex-shrink-0" />
                <div class="flex-1 space-y-2">
                  <Skeleton class="h-4 w-32" />
                  <Skeleton class="h-16 w-full" />
                </div>
              </div>
            </div>

            <!-- Load More Button -->
            <div
              v-if="hasMoreReplies && !repliesLoading"
              class="text-center pt-4"
            >
              <Button
                variant="outline"
                class="rounded-xl border-border/50"
                @click="loadMoreReplies"
              >
                <Loader2Icon
                  v-if="repliesLoading"
                  class="size-4 mr-2 animate-spin"
                />
                Load More Replies
              </Button>
            </div>
          </CardContent>
        </Card>
      </template>

      <!-- Report Dialog -->
      <ForumReportDialog
        :open="isReportDialogOpen"
        :reasons="reportReasons"
        :selected-reason="reportReason"
        :reason-error="reportReasonError"
        :details="reportDetails"
        :details-error="reportDetailsError"
        @update:open="isReportDialogOpen = $event"
        @update:selected-reason="reportReason = $event"
        @update:details="reportDetails = $event"
        @submit="submitReport"
        @cancel="closeReportDialog"
      />
    </div>
  </div>
</template>

<style scoped>
/* Add any page specific overrides if necessary */
</style>
