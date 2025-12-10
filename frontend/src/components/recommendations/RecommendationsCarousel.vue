<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon, ArrowRightIcon, MapPinIcon, StarIcon, BookmarkIcon } from 'lucide-vue-next'
import type { IPlace } from '@/utils/interfaces'

const props = defineProps<{
  items: IPlace[]
  title?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  select: [IPlace]
}>()

const scrollerRef = ref<HTMLDivElement | null>(null)

const scrollByCards = (direction: 'prev' | 'next') => {
  const container = scrollerRef.value
  if (!container || !container.firstElementChild) return

  const cardWidth = (container.firstElementChild as HTMLElement).clientWidth
  const gap = parseFloat(getComputedStyle(container).columnGap || '16') || 16
  const visibleCards = Math.max(1, Math.round(container.clientWidth / (cardWidth + gap)))
  const distance = (cardWidth + gap) * visibleCards * (direction === 'next' ? 1 : -1)

  container.scrollBy({ left: distance, behavior: 'smooth' })
}

const formatRating = (place: IPlace) => (place.averageRating ?? 0).toFixed(1)
const formatLocation = (place: IPlace) => [place.address, place.city, place.country].filter(Boolean).join(', ')

const handleSelect = (item: IPlace) => {
  emit('select', item)
}
</script>

<template>
  <section class="w-full space-y-4">
    <header class="flex items-center justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Highlights</p>
        <h2 class="text-2xl font-semibold tracking-tight">{{ title ?? 'You May Like' }}</h2>
      </div>
      <div class="flex gap-2">
        <Button variant="secondary" size="icon" class="rounded-full" @click="scrollByCards('prev')">
          <ArrowLeftIcon class="size-4" aria-hidden="true" />
          <span class="sr-only">Previous</span>
        </Button>
        <Button variant="default" size="icon" class="rounded-full" @click="scrollByCards('next')">
          <ArrowRightIcon class="size-4" aria-hidden="true" />
          <span class="sr-only">Next</span>
        </Button>
      </div>
    </header>

    <div
      ref="scrollerRef"
      class="grid snap-x snap-mandatory auto-cols-[minmax(220px,280px)] grid-flow-col gap-4 overflow-x-auto pb-2"
      aria-live="polite"
    >
      <article
        v-for="item in items"
        :key="item.id"
        class="snap-start"
      >
        <button
          type="button"
          class="group flex w-full flex-col rounded-3xl border border-border/40 bg-card text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          @click="handleSelect(item)"
        >
          <div class="relative h-48 w-full overflow-hidden rounded-3xl rounded-b-none">
            <img :src="item.mainImageUrl" :alt="item.name" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            <div class="absolute right-3 top-3 flex items-center gap-2">
              <Button variant="secondary" size="icon" class="rounded-full bg-white/80 text-foreground shadow" aria-label="Save to bookmarks">
                <BookmarkIcon class="size-4" aria-hidden="true" />
              </Button>
              <div class="flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
                <StarIcon class="size-3 text-yellow-300" aria-hidden="true" />
                <span>{{ formatRating(item) }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-2 px-4 py-4">
            <div>
              <p class="text-lg font-semibold">{{ item.name }}</p>
              <p class="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPinIcon class="size-4 text-muted-foreground" aria-hidden="true" />
                {{ formatLocation(item) }}
              </p>
            </div>
            <div class="flex items-center justify-between text-sm text-muted-foreground">
              <span>{{ item.placeType }}</span>
              <span>{{ item.reviewCount }} reviews</span>
            </div>
          </div>
        </button>
      </article>

      <div v-if="!items.length && !loading" class="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Nothing to show yet.
      </div>
      <div v-if="loading" class="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Loading recommendations…
      </div>
    </div>
  </section>
</template>
