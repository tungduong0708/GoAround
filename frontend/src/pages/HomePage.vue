<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import SearchHero from "@/components/search/SearchHero.vue";
import RecommendationsCarousel from "@/components/recommendations/RecommendationsCarousel.vue";
import TripPlannerSection from "@/components/trip/TripPlannerSection.vue";
import { useAuthStore } from "@/stores";
import { TripService } from "@/services";
import type { ITripListSchema } from "@/utils/interfaces";

const authStore = useAuthStore();
const trips = ref<ITripListSchema[]>([]);
const loading = ref(false);

// Get trips for display - user trips if logged in, public trips otherwise
const displayTrips = computed(() => {
  // Limit to 5 trips for the carousel
  return trips.value.slice(0, 5);
});

onMounted(async () => {
  try {
    loading.value = true;
    if (authStore.isAuthenticated) {
      // Load user's trips if authenticated
      const response = await TripService.getTrips({ limit: 5, page: 1 });
      trips.value = response.data || [];
      
      // If user has no trips, load public trips instead
      if (trips.value.length === 0) {
        const publicResponse = await TripService.getPublicTrips({ limit: 5, page: 1 });
        trips.value = publicResponse.data || [];
      }
    } else {
      // Load public trips if not authenticated
      const response = await TripService.getPublicTrips({ limit: 5, page: 1 });
      trips.value = response.data || [];
    }
  } catch (error) {
    console.error('Failed to load trips for home page:', error);
  } finally {
    loading.value = false;
  }
});
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
      <TripPlannerSection :trips="displayTrips" />
    </section>
  </div>
</template>
