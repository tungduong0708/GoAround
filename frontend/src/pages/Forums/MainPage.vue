<script setup lang="ts">
import { useForumMain } from "@/composables";
import ForumSearchHeader from "@/components/forum/ForumSearchHeader.vue";
import ForumFilterBar from "@/components/forum/ForumFilterBar.vue";
import ForumPostCard from "@/components/forum/ForumPostCard.vue";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const {
  searchQuery,
  activeSort,
  activeTags,
  activeTimeFilter,
  posts,
  loading,
  sortOptions,
  tagOptions,
  timeOptions,
  toggleTag,
  setTimeFilter,
  setSort,
  pagination,
  currentPage,
  nextPage,
  previousPage,
  isAuthenticated,
  likedPosts,
  toggleLike,
} = useForumMain();
</script>

<template>
  <div class="bg-background pb-20">
    <div class="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <!-- 1. Search Header -->
      <ForumSearchHeader
        v-motion-slide-visible-once-top
        v-model="searchQuery"
      />

      <!-- 2. Filters -->
      <div v-motion-slide-visible-once-top :delay="100">
        <ForumFilterBar
          :sort-options="sortOptions"
          :active-sort="activeSort"
          :tag-options="tagOptions"
          :active-tags="activeTags"
          :time-options="timeOptions"
          :active-time-filter="activeTimeFilter"
          @update:sort="setSort"
          @toggle:tag="toggleTag"
          @update:time="setTimeFilter"
        />
      </div>

      <!-- 3. Posts List -->
      <div class="space-y-6">
        <!-- Loading State -->
        <div v-if="loading" class="space-y-6">
          <div
            v-for="i in 3"
            :key="i"
            class="flex gap-4 p-4 border rounded-3xl"
          >
            <Skeleton class="size-12 rounded-full" />
            <div class="flex-1 space-y-4">
              <Skeleton class="h-4 w-1/3" />
              <Skeleton class="h-24 w-full rounded-xl" />
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!posts.length"
          v-motion-pop-visible-once
          class="text-center py-20 bg-muted/30 rounded-3xl border border-dashed"
        >
          <h3 class="text-xl font-bold">No results found</h3>
          <p class="text-muted-foreground">
            Try checking your spelling or using different keywords.
          </p>
        </div>

        <!-- Posts -->
        <div v-else class="space-y-6">
          <ForumPostCard
            v-for="(post, index) in posts"
            :key="post.id"
            :post="post"
            :is-liked="likedPosts.has(post.id)"
            :is-authenticated="isAuthenticated"
            @toggle-like="toggleLike"
            v-motion
            :initial="{ opacity: 0, y: 50 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: index * 50 } }"
          />

          <!-- Pagination -->
          <div
            v-if="pagination && pagination.total_items > pagination.limit"
            class="flex items-center justify-center gap-4 py-8"
          >
            <Button
              variant="outline"
              :disabled="currentPage === 1"
              @click="previousPage"
              class="rounded-xl border-border/50"
            >
              Previous
            </Button>
            <span class="text-sm font-medium text-muted-foreground">
              Page {{ currentPage }} of
              {{ Math.ceil(pagination.total_items / pagination.limit) }}
            </span>
            <Button
              variant="outline"
              :disabled="
                currentPage >=
                Math.ceil(pagination.total_items / pagination.limit)
              "
              @click="nextPage"
              class="rounded-xl border-border/50"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any page specific overrides if necessary */
</style>
