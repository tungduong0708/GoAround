<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TagIcon, CalendarIcon } from "lucide-vue-next";

defineProps<{
  sortOptions: string[];
  activeSort: string;
  tagOptions: string[];
  activeTags: string[];
  timeOptions: string[];
  activeTimeFilter: string;
}>();

const emit = defineEmits<{
  (e: "update:sort", value: string): void;
  (e: "toggle:tag", value: string): void;
  (e: "update:time", value: string): void;
}>();
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
        >
          Show Filter
        </Button>
      </div>
    </div>

    <!-- Tags -->
    <div v-motion-slide-visible-once-bottom :delay="100" class="space-y-3">
      <div
        class="flex items-center gap-2 text-sm font-medium text-muted-foreground"
      >
        <TagIcon class="size-4" />
        <span>Filter by tags:</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <Badge
          v-for="tag in tagOptions"
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
    </div>

    <!-- Time -->
    <div v-motion-slide-visible-once-bottom :delay="200" class="space-y-3">
      <div
        class="flex items-center gap-2 text-sm font-medium text-muted-foreground"
      >
        <CalendarIcon class="size-4" />
        <span>Filter by time:</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="time in timeOptions"
          :key="time"
          variant="secondary"
          :class="[
            'rounded-lg px-4 h-8 text-sm',
            activeTimeFilter === time
              ? 'bg-secondary text-foreground font-semibold shadow-sm ring-1 ring-border'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',
          ]"
          @click="emit('update:time', time)"
        >
          {{ time }}
        </Button>
      </div>
    </div>
  </div>
</template>
