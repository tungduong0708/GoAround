<script setup lang="ts">
import SearchBar from "@/components/search/SearchBar.vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchCategories, useSearchResults } from "@/composables";

defineProps<{
  placeholder?: string;
}>();

const { searchTerm, loading, performSearch } = useSearchResults({ autoLoad: false });

const handleSearchSubmit = () => {
  performSearch();
};

const emit = defineEmits<{
  "update:modelValue": [value: string];
  submit: [];
}>();

const {
  categories,
  selectedCategory,
  updateValue,
  selectCategory,
  handleSubmit,
} = useSearchCategories(emit);
</script>

<template>
  <section class="w-full px-4 py-8">
    <div
      class="mx-auto w-full max-w-5xl px-6 py-10 border-0 bg-transparent"
    >
      <CardHeader class="items-center space-y-3 text-center py-0 mb-15">
        <CardTitle
          v-motion-slide-visible-once-top
          class="text-6xl font-semibold tracking-[0.15em] uppercase text-foreground sm:text-6xl"
        >
          Go Around With Us
        </CardTitle>
      </CardHeader>

      <CardContent class="flex flex-col gap-6">
        <Tabs
          v-model="selectedCategory"
          class="w-full background-transparent"
          :default-value="categories[0]?.value"
        >
          <TabsList
            v-motion-slide-visible-once-bottom
            :delay="200"
            class="flex w-full justify-center gap-4 rounded-full bg-transparent p-7 border-0"
            aria-label="Search filters"
          >
            <TabsTrigger
              v-for="category in categories"
              :key="category.value"
              :value="category.value"
              @click="selectCategory(category.value)"
              class="rounded-full flex border border-orange-200 px-5 py-6 text-base font-medium text-muted-foreground shadow-sm transition data-[state=active]:border-orange-500 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <div class="flex items-center justify-center gap-2">
                <component
                  :is="category.icon"
                  class="size-5"
                  aria-hidden="true"
                />
                <span>{{ category.label }}</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div
          v-motion-slide-visible-once-bottom
          :delay="300"
          class="flex w-full justify-center"
        >
          <SearchBar
            v-model="searchTerm"
            :loading="loading"
            :placeholder="
              placeholder ?? 'Search destinations, guides, or experiences'
            "
            @submit="handleSearchSubmit"
          />
        </div>
      </CardContent>
    </div>
  </section>
</template>
