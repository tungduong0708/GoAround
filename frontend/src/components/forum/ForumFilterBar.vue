<script setup lang="ts">
import { ref, computed } from "vue";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TagIcon, ChevronDownIcon, ChevronUpIcon, SearchIcon } from "lucide-vue-next";

const props = defineProps<{
  sortOptions: string[];
  activeSort: string;
  tagOptions: string[];
  activeTags: string[];
}>();

const emit = defineEmits<{
  (e: "update:sort", value: string): void;
  (e: "toggle:tag", value: string): void;
}>();

const showFilters = ref(true);
const showAllTags = ref(false);
const tagSearchQuery = ref("");

const INITIAL_TAG_COUNT = 8;

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const filteredTags = computed(() => {
  if (!tagSearchQuery.value) {
    return props.tagOptions;
  }
  return props.tagOptions.filter(tag => 
    tag.toLowerCase().includes(tagSearchQuery.value.toLowerCase())
  );
});

const displayedTags = computed(() => {
  if (showAllTags.value || tagSearchQuery.value) {
    return filteredTags.value;
  }
  return filteredTags.value.slice(0, INITIAL_TAG_COUNT);
});

const hasMoreTags = computed(() => {
  return !tagSearchQuery.value && filteredTags.value.length > INITIAL_TAG_COUNT;
});
</script>

<template>
  <div
    class="space-y-6 rounded-3xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm"
  >
    <!-- Sort -->
    <div
      v-motion-slide-visible-once-bottom
      class="flex items-center gap-4 flex-wrap"
    >
      <span class="font-semibold">Sort by:</span>
      <div class="flex gap-2 flex-wrap">
        <Button
          v-for="option in sortOptions"
          :key="option"
          variant="secondary"
          :class="[
            'rounded-lg px-4 h-8 text-sm font-medium transition-colors',
            activeSort === option
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground',
          ]"
          @click="emit('update:sort', option)"
        >
          {{ option }}
        </Button>
      </div>
      <div class="ml-auto">
        <Button
          variant="ghost"
          class="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
          @click="toggleFilters"
        >
          <component :is="showFilters ? ChevronUpIcon : ChevronDownIcon" class="mr-2 size-4" />
          {{ showFilters ? "Hide Filters" : "Show Filters" }}
        </Button>
      </div>
    </div>

    <!-- Tags -->
    <div v-if="showFilters" v-motion-slide-visible-once-bottom :delay="100" class="space-y-3">
      <div
        class="flex items-center gap-2 text-sm font-medium text-muted-foreground"
      >
        <TagIcon class="size-4" />
        <span>Filter by tags:</span>
      </div>

      <!-- Selected Tags Area -->
      <div v-if="activeTags.length > 0" class="flex flex-wrap gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
        <span class="text-sm font-medium text-orange-700 dark:text-orange-300">Selected:</span>
        <Badge
          v-for="tag in activeTags"
          :key="tag"
          class="px-3 py-1.5 text-sm bg-orange-500 text-white hover:bg-orange-600 cursor-pointer transition-colors"
          @click="emit('toggle:tag', tag)"
        >
          {{ tag }}
          <span class="ml-1.5">×</span>
        </Badge>
      </div>
      
      <!-- Tag Search -->
      <div class="relative">
        <SearchIcon
          class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          v-model="tagSearchQuery"
          placeholder="Search tags..."
          class="h-9 rounded-lg pl-9 text-sm"
        />
      </div>

      <!-- Tag List -->
      <div class="flex flex-wrap gap-2">
        <Badge
          v-for="tag in displayedTags"
          :key="tag"
          variant="outline"
          :class="[
            'px-4 py-1.5 text-sm cursor-pointer transition-all border-transparent',
            activeTags.includes(tag)
              ? 'bg-secondary text-foreground font-semibold shadow-sm'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',
          ]"
          @click="emit('toggle:tag', tag)"
        >
          {{ tag }}
        </Badge>
      </div>

      <!-- Show More/Less Button -->
      <div v-if="hasMoreTags" class="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          class="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
          @click="showAllTags = !showAllTags"
        >
          {{ showAllTags ? 'Show Less' : `Show More (${tagOptions.length - INITIAL_TAG_COUNT} more)` }}
        </Button>
      </div>
    </div>
  </div>
</template>
