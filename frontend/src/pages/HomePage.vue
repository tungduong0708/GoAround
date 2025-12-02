<script setup lang="ts">
import { ref } from 'vue'
import SearchHero from '@/components/search/SearchHero.vue'

const searchTerm = ref('')

const handleSearchSubmit = () => {
  /* placeholder for future search action */
}
</script>

<template>
  <div class="flex w-full flex-col items-center px-4 py-8">
    <SearchHero v-model="searchTerm" @submit="handleSearchSubmit" />
  </div>
</template>