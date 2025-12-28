<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import SearchResultCard from "@/components/search/SearchResultCard.vue";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from "lucide-vue-next";
import type { IPlacePublic } from "@/utils/interfaces";
import { useRecommendations } from "@/composables";

defineProps<{
  title?: string;
}>();

const {
  items,
  loading,
  error,
  handleRecommendationSelect,
} = useRecommendations();

const handleSelect = (item: IPlacePublic) => {
  handleRecommendationSelect(item);
};

const scrollerRef = ref<HTMLDivElement | null>(null);

const scrollByCards = (direction: "prev" | "next") => {
  const container = scrollerRef.value;
  if (!container || !container.firstElementChild) return;

  const cardWidth = (container.firstElementChild as HTMLElement).clientWidth;
  const gap = parseFloat(getComputedStyle(container).columnGap || "16") || 16;
  const visibleCards = Math.max(
    1,
    Math.round(container.clientWidth / (cardWidth + gap))
  );
  const distance =
    (cardWidth + gap) * visibleCards * (direction === "next" ? 1 : -1);

  container.scrollBy({ left: distance, behavior: "smooth" });
};
</script>

<template>
  <section v-if="!loading && items.length" class="w-full space-y-4">
    <header class="flex items-center justify-between">
      <div>
        <p
          class="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground"
        >
          Highlights
        </p>
        <h2 class="text-2xl font-semibold tracking-tight">
          {{ title ?? "You May Like" }}
        </h2>
      </div>
      <div class="flex gap-2">
        <Button
          variant="secondary"
          size="icon"
          class="rounded-full"
          @click="scrollByCards('prev')"
        >
          <ArrowLeftIcon class="size-4" aria-hidden="true" />
          <span class="sr-only">Previous</span>
        </Button>
        <Button
          variant="default"
          size="icon"
          class="rounded-full"
          @click="scrollByCards('next')"
        >
          <ArrowRightIcon class="size-4" aria-hidden="true" />
          <span class="sr-only">Next</span>
        </Button>
      </div>
    </header>

    <div
      ref="scrollerRef"
      class="grid snap-x snap-mandatory auto-cols-[minmax(280px,340px)] grid-flow-col gap-4 overflow-x-auto pb-2"
      aria-live="polite"
    >
      <article
        v-for="(item, index) in items"
        :key="item.id"
        class="snap-start"
        v-motion
        :initial="{ opacity: 0, x: 50 }"
        :enter="{ opacity: 1, x: 0, transition: { delay: index * 100 } }"
      >
        <SearchResultCard :result="item" @select="handleSelect" />
      </article>
    </div>
  </section>
</template>
