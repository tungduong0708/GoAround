<script setup lang="ts">
import SearchHero from "@/components/search/SearchHero.vue";
import RecommendationsCarousel from "@/components/recommendations/RecommendationsCarousel.vue";
import TripPlannerSection from "@/components/trip/TripPlannerSection.vue";
</script>

<template>
  <div class="flex w-full flex-col gap-12 px-4 py-8">
    <SearchHero v-motion-slide-visible-once-top />

    <section
      v-motion-slide-visible-once-bottom
      :delay="200"
      class="mx-auto w-full max-w-6xl"
    >
      <RecommendationsCarousel />
    </section>

    <section
      v-motion-slide-visible-once-bottom
      :delay="400"
      class="mx-auto w-full max-w-6xl"
    >
      <!-- Temporarily get the recommendations from the useRecommendations composable -->
      <!-- TODO: Replace with actual trip data -->
      <TripPlannerSection :trips="[]" />
    </section>
  </div>
</template>
