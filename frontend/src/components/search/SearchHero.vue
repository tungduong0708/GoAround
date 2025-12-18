<script setup lang="ts">
import SearchBar from "@/components/SearchBar.vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchCategories } from "@/composables";

const props = defineProps<{
  modelValue: string;
  loading?: boolean;
  placeholder?: string;
}>();

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
  <section class="w-full px-4 py-8 sm:py-12">
    <Card
      class="mx-auto w-full max-w-5xl border border-border/60 bg-card/90 px-6 py-10 shadow-2xl backdrop-blur"
    >
      <CardHeader class="items-center space-y-3 text-center">
        <CardTitle
          v-motion-slide-visible-once-top
          class="text-4xl font-semibold tracking-[0.35em] uppercase text-foreground sm:text-5xl"
        >
          Go Around With Us
        </CardTitle>
      </CardHeader>

      <CardContent class="flex flex-col gap-6">
        <Tabs
          v-model="selectedCategory"
          class="w-full"
          :default-value="categories[0]?.value"
        >
          <TabsList
            v-motion-slide-visible-once-bottom
            :delay="200"
            class="flex w-full justify-center gap-2 rounded-full border border-border/40 bg-secondary/30 p-7"
            aria-label="Search filters"
          >
            <TabsTrigger
              v-for="category in categories"
              :key="category.value"
              :value="category.value"
              @click="selectCategory(category.value)"
              class="rounded-full flex border border-transparent p-4 text-sm font-medium text-muted-foreground shadow-sm transition data-[state=active]:border-ring data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              <div class="flex items-center justify-center gap-2">
                <component
                  :is="category.icon"
                  class="size-4"
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
            :model-value="props.modelValue"
            :loading="props.loading"
            :placeholder="
              props.placeholder ?? 'Search destinations, guides, or experiences'
            "
            @update:modelValue="updateValue"
            @submit="handleSubmit"
          />
        </div>
      </CardContent>
    </Card>
  </section>
</template>
