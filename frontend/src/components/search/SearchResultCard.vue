<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookmarkIcon, MapPinIcon, StarIcon } from 'lucide-vue-next'
import type { SearchResult } from '@/utils/types'

const props = defineProps<{
  result: SearchResult
}>()

const emit = defineEmits<{
  select: [SearchResult]
}>()

const handleClick = () => {
  emit('select', props.result)
}
</script>

<template>
  <Card
    role="button"
    tabindex="0"
    class="flex h-full flex-col overflow-hidden rounded-3xl border border-border/50 shadow-sm transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    @click="handleClick"
    @keyup.enter="handleClick"
  >
    <div class="relative h-40 w-full overflow-hidden">
      <img :src="result.image" :alt="result.name" class="h-full w-full object-cover transition duration-500 hover:scale-105" />
      <div class="absolute right-3 top-3 flex items-center gap-2">
        <Button variant="secondary" size="icon" class="rounded-full bg-white/80 text-foreground shadow">
          <BookmarkIcon class="size-4" aria-hidden="true" />
        </Button>
        <div class="flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white">
          <StarIcon class="size-3 text-yellow-300" aria-hidden="true" />
          <span>{{ result.rating.toFixed(1) }}</span>
        </div>
      </div>
    </div>

    <CardContent class="flex flex-1 flex-col gap-2 p-4">
      <div>
        <h3 class="text-lg font-semibold text-foreground">{{ result.name }}</h3>
        <p class="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPinIcon class="size-4" aria-hidden="true" />
          {{ result.location }}
        </p>
      </div>
      <div class="mt-auto flex items-center justify-between text-sm text-muted-foreground">
        <span class="font-medium text-foreground/80">{{ result.category }}</span>
        <span>{{ result.rating.toFixed(1) }} · {{ result.tags.length }} tags</span>
      </div>
    </CardContent>
  </Card>
</template>
