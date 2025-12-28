<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import Card from '@/components/ui/card/Card.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, FileText } from 'lucide-vue-next'
import type { ITripListSchema } from '@/utils/interfaces'
import { formatDateRange, getPlaceCountText } from '@/utils/helpers'

interface Props {
  trip: ITripListSchema
  index?: number
  showPublicBadge?: boolean
  clickable?: boolean
  customOnClick?: (trip: ITripListSchema) => void
}

const props = withDefaults(defineProps<Props>(), {
  index: 0,
  showPublicBadge: false,
  clickable: true,
})

const emit = defineEmits<{
  click: [trip: ITripListSchema]
}>()

const tripDateRange = computed(() => 
  formatDateRange(props.trip.start_date, props.trip.end_date)
)

const tripPlaceCount = computed(() => 
  getPlaceCountText(props.trip.stop_count || 0)
)

const tripLocation = computed(() => {
  if (props.trip.stop_count && props.trip.stop_count > 0) {
    return `${props.trip.stop_count} destination${props.trip.stop_count > 1 ? 's' : ''}`
  }
  return 'No destinations yet'
})

const handleClick = () => {
  if (props.customOnClick) {
    props.customOnClick(props.trip)
  }
  emit('click', props.trip)
}
</script>

<template>
  <RouterLink
    v-if="clickable"
    :to="`/trip/${trip.id}`"
    custom
    v-slot="{ navigate, href }"
  >
    <Card
      :as="'a'"
      :href="href"
      v-motion
      :initial="{ opacity: 0, y: 50 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: index * 100 } }"
      class="cursor-pointer group overflow-hidden rounded-xl border border-border/30 bg-card ring-1 ring-black/5 hover:ring-coral/20 hover:border-coral/40 transition-all duration-300 hover:-translate-y-1"
      @click="(e: MouseEvent) => {
        e.preventDefault();
        handleClick();
        navigate();
      }"
    >
      <!-- Gradient accent bar -->
      <div class="h-1.5 bg-gradient-to-r from-coral via-coral-dark to-coral-darker" />

      <CardHeader class="pb-3">
        <div class="flex items-start justify-between gap-2">
          <CardTitle
            class="text-xl font-bold text-foreground group-hover:text-coral transition-colors duration-200 flex-1"
          >
            {{ trip.trip_name }}
          </CardTitle>
          <Badge 
            v-if="showPublicBadge && trip.public"
            variant="secondary" 
            class="shrink-0 bg-emerald-500/10 text-emerald-600 border-0 font-medium"
          >
            Public
          </Badge>
        </div>
      </CardHeader>

      <CardContent class="space-y-3 pt-0">
        <div
          class="flex items-center gap-3 text-muted-foreground text-sm group-hover:text-muted-foreground/80 transition-colors"
        >
          <div
            class="flex items-center justify-center w-8 h-8 rounded-lg bg-coral/10 shrink-0"
          >
            <MapPin :size="16" class="text-coral" />
          </div>
          <span class="truncate">{{ tripLocation }}</span>
        </div>

        <div class="flex items-center gap-3 text-muted-foreground text-sm">
          <div
            class="flex items-center justify-center w-8 h-8 rounded-lg bg-coral/10 shrink-0"
          >
            <Calendar :size="16" class="text-coral" />
          </div>
          <span>{{ tripDateRange }}</span>
        </div>

        <div class="flex items-center gap-3 text-sm">
          <div
            class="flex items-center justify-center w-8 h-8 rounded-lg bg-coral/10 shrink-0"
          >
            <FileText :size="16" class="text-coral" />
          </div>
          <span class="text-foreground font-semibold">
            {{ tripPlaceCount }}
          </span>
        </div>
      </CardContent>
    </Card>
  </RouterLink>

  <!-- Non-clickable version for public trips -->
  <Card
    v-else
    v-motion
    :initial="{ opacity: 0, y: 50 }"
    :enter="{ opacity: 1, y: 0, transition: { delay: index * 100 } }"
    class="cursor-pointer group overflow-hidden rounded-xl border border-border/30 bg-card ring-1 ring-black/5 hover:ring-coral/20 hover:border-coral/40 transition-all duration-300 hover:-translate-y-1"
    @click="handleClick"
  >
    <!-- Gradient accent bar -->
    <div class="h-1.5 bg-gradient-to-r from-coral via-coral-dark to-coral-darker" />

    <CardHeader class="pb-3">
      <div class="flex items-start justify-between gap-2">
        <CardTitle
          class="text-xl font-bold text-foreground group-hover:text-coral transition-colors duration-200 flex-1"
        >
          {{ trip.trip_name }}
        </CardTitle>
        <Badge 
          v-if="showPublicBadge && trip.public"
          variant="secondary" 
          class="shrink-0 bg-emerald-500/10 text-emerald-600 border-0 font-medium"
        >
          Public
        </Badge>
      </div>
    </CardHeader>

    <CardContent class="space-y-3 pt-0">
      <div
        class="flex items-center gap-3 text-muted-foreground text-sm group-hover:text-muted-foreground/80 transition-colors"
      >
        <div
          class="flex items-center justify-center w-8 h-8 rounded-lg bg-coral/10 shrink-0"
        >
          <MapPin :size="16" class="text-coral" />
        </div>
        <span class="truncate">{{ tripLocation }}</span>
      </div>

      <div class="flex items-center gap-3 text-muted-foreground text-sm">
        <div
          class="flex items-center justify-center w-8 h-8 rounded-lg bg-coral/10 shrink-0"
        >
          <Calendar :size="16" class="text-coral" />
        </div>
        <span>{{ tripDateRange }}</span>
      </div>

      <div class="flex items-center gap-3 text-sm">
        <div
          class="flex items-center justify-center w-8 h-8 rounded-lg bg-coral/10 shrink-0"
        >
          <FileText :size="16" class="text-coral" />
        </div>
        <span class="text-foreground font-semibold">
          {{ tripPlaceCount }}
        </span>
      </div>
    </CardContent>
  </Card>
</template>
