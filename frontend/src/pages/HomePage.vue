<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import SearchHero from '@/components/search/SearchHero.vue'
import RecommendationsCarousel from '@/components/recommendations/RecommendationsCarousel.vue'
import { useRecommendations, useSearchResults } from '@/composables'

const router = useRouter()

const {
  items: recommendations,
  loading: recommendationsLoading,
  error: recommendationsError,
  handleRecommendationSelect,
} = useRecommendations()

const {
  query,
  setQuery,
  performSearch,
} = useSearchResults({ autoLoad: false })

const searchTerm = computed({
  get: () => query.value,
  set: (val) => setQuery(val),
})

const handleSearchSubmit = () => {
  performSearch()
  router.push({ name: 'search' })
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
  </div>
</template>