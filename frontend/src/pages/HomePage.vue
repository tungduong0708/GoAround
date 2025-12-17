<script setup lang="ts">
import SearchHero from '@/components/search/SearchHero.vue'
import RecommendationsCarousel from '@/components/recommendations/RecommendationsCarousel.vue'
import TripPlannerSection from '@/components/trip/TripPlannerSection.vue'
import { useRecommendations, useSearchResults } from '@/composables'

const {
  items: recommendations,
  loading: recommendationsLoading,
  error: recommendationsError,
  handleRecommendationSelect,
} = useRecommendations()

const { searchTerm, performSearch} = useSearchResults({ autoLoad: false })

const handleSearchSubmit = () => {
  performSearch()
}

</script>

<template>
  <div class="flex w-full flex-col gap-12 px-4 py-8">
    <SearchHero v-model="searchTerm" @submit="handleSearchSubmit" />

    <section class="mx-auto w-full max-w-6xl">
      <RecommendationsCarousel
        :items="recommendations"
        :loading="recommendationsLoading"
        @select="handleRecommendationSelect"
      />
      <p
        v-if="recommendationsError"
        class="mt-4 text-center text-sm text-destructive"
      >
        {{ recommendationsError }}
      </p>
    </section>

    <section class="mx-auto w-full max-w-6xl">
      <!-- Temporarily get the recommendations from the useRecommendations composable -->
       <!-- TODO: Replace with actual trip data -->
      <TripPlannerSection :trips="recommendations" />
    </section>
  </div>
</template>