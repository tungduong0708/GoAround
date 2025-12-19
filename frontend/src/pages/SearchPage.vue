<script setup lang="ts">
import SearchBar from "@/components/search/SearchBar.vue";
import SearchResultCard from "@/components/search/SearchResultCard.vue";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchResults, useSearchCategories } from "@/composables";
import { SlidersHorizontalIcon } from "lucide-vue-next";

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
              class="flex flex-wrap gap-2 rounded-full border border-border/60 bg-secondary/30 p-2"
            >
              <TabsTrigger
                v-for="category in categories"
                :key="category.value"
                :value="category.value"
                class="rounded-full border border-transparent px-4 py-1.5 text-sm font-medium text-muted-foreground transition data-[state=active]:border-ring data-[state=active]:bg-background data-[state=active]:text-foreground"
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
          Search Results
        </h2>
        <p class="text-sm text-muted-foreground">
          {{ results?.data.length ?? 0 }} places found
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
          v-else
          class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <SearchResultCard
            v-for="(result, index) in results?.data"
            :key="result.id"
            :result="result"
            v-motion
            :initial="{ opacity: 0, y: 50 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: index * 100 } }"
            @select="selectResult"
          />
        </div>
      </div>
    </section>
  </div>
</template>
