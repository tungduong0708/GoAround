<script setup lang="ts">
import SearchBar from "@/components/search/SearchBar.vue";
import SearchResultCard from "@/components/search/SearchResultCard.vue";
import TripCard from "@/components/trip/TripCard.vue";
import ForumPostSearchCard from "@/components/search/ForumPostSearchCard.vue";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useSearchResults, useSearchCategories } from "@/composables";
import { SlidersHorizontalIcon } from "lucide-vue-next";
import { computed } from "vue";

const {
  searchTerm,
  results,
  loading,
  error,
  hasResults,
  performSearch,
  selectResult,
} = useSearchResults({ searchOnCategoryChange: true });

const { categories, selectedCategory } = useSearchCategories();

const hasTrips = computed(() => 
  results.value?.data.trips && results.value.data.trips.length > 0
);

const hasPlaces = computed(() =>
  results.value?.data.places && results.value.data.places.length > 0
);

const hasPosts = computed(() =>
  results.value?.data.posts && results.value.data.posts.length > 0
);
</script>

<template>
  <div class="mx-auto w-full max-w-6xl px-4 py-10">
    <section v-motion-slide-visible-once-top class="space-y-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-[0.5em] text-muted-foreground"
          >
            Search
          </p>
          <h1 class="text-4xl font-semibold tracking-tight text-foreground">
            Search Place
          </h1>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <Tabs
            v-model="selectedCategory"
            class="w-full sm:w-auto"
            :default-value="categories[0]?.value"
          >
            <TabsList
              class="flex flex-wrap gap-2 rounded-full bg-transparent"
            >
              <TabsTrigger
                v-for="category in categories"
                :key="category.value"
                :value="category.value"
                class="rounded-full border border-transparent px-4 py-5 text-sm font-medium text-muted-foreground transition data-[state=active]:border-ring data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                {{ category.label }}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="secondary" size="lg" class="rounded-full px-4">
            <SlidersHorizontalIcon class="mr-2 size-4" aria-hidden="true" />
            Filters
          </Button>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <div class="w-full flex-1 min-w-[240px]">
          <SearchBar
            v-model="searchTerm"
            :loading="loading"
            placeholder="Search"
            @submit="performSearch"
          />
        </div>
      </div>
    </section>

    <section class="mt-10 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-2xl font-semibold tracking-tight text-foreground">
          Places
        </h2>
        <p class="text-sm text-muted-foreground">
          {{ results?.data.places.length ?? 0 }} places found
        </p>
      </div>

      <div
        v-if="error"
        class="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-destructive"
      >
        <p>{{ error }}</p>
        <Button variant="destructive" class="mt-3" @click="performSearch"
          >Try again</Button
        >
      </div>

      <div v-else>
        <div
          v-if="loading"
          class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <Skeleton v-for="index in 6" :key="index" class="h-64 rounded-3xl" />
        </div>

        <div
          v-else-if="!hasResults"
          v-motion-pop-visible-once
          class="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border/70 p-10 text-center text-muted-foreground"
        >
          <p class="text-lg font-semibold text-foreground">No results yet</p>
          <p class="max-w-md">
            Try adjusting your keywords or filters to discover more places.
          </p>
          <Button variant="outline" class="rounded-full" @click="performSearch"
            >Search Again</Button
          >
        </div>

        <div
          v-else-if="hasPlaces"
          class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <SearchResultCard
            v-for="(result, index) in results?.data.places"
            :key="result.id"
            :result="result"
            v-motion
            :initial="{ opacity: 0, y: 50 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: index * 100 } }"
            @select="selectResult"
          />
        </div>

        <div
          v-else
          class="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border/70 p-10 text-center text-muted-foreground"
        >
          <p class="text-lg font-medium text-foreground">No places found</p>
        </div>
      </div>
    </section>

    <!-- Forum Posts Section -->
    <section v-if="hasPosts && !loading" class="mt-12 space-y-4">
      <Separator class="my-8" />
      
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-2xl font-semibold tracking-tight text-foreground">
          Related Forum Posts
        </h2>
        <p class="text-sm text-muted-foreground">
          {{ results?.data.posts.length ?? 0 }} posts found
        </p>
      </div>

      <div class="space-y-4">
        <ForumPostSearchCard
          v-for="post in results?.data.posts"
          :key="post.id"
          :post="post"
        />
      </div>
    </section>

    <!-- Public Trips Section -->
    <section v-if="hasTrips && !loading" class="mt-12 space-y-4">
      <Separator class="my-8" />
      
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-2xl font-semibold tracking-tight text-foreground">
          Public Trips
        </h2>
        <p class="text-sm text-muted-foreground">
          {{ results?.data.trips.length ?? 0 }} trips found
        </p>
      </div>

      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <TripCard
          v-for="(trip, index) in results?.data.trips"
          :key="trip.id"
          :trip="trip"
          :index="index"
          :show-public-badge="true"
          :clickable="false"
        />
      </div>
    </section>
  </div>
</template>
