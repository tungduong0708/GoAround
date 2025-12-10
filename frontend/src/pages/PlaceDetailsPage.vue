<script setup lang="ts">
import { computed } from 'vue'
import { usePlaceDetails } from '@/composables'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import GoogleMap from '@/components/common/GoogleMap.vue'
import { MapPinIcon, StarIcon, ClockIcon, TicketIcon, BookmarkIcon, TagIcon } from 'lucide-vue-next'

const { place, loading, error } = usePlaceDetails()

const heroImage = computed(() => {
  if (!place.value) return ''
  return place.value.mainImageUrl || place.value.images?.[0]?.imageUrl || ''
})

const galleryImages = computed(() => {
  if (!place.value?.images) return []
  return place.value.images.map((img) => img.imageUrl).filter(Boolean)
})

const locationLabel = computed(() => {
  if (!place.value) return ''
  const parts = [place.value.address, place.value.city, place.value.country].filter(Boolean)
  return parts.join(', ')
})

const coordinates = computed(() => {
  const coords = place.value?.location?.coordinates
  if (coords && coords.length === 2) {
    const [lng, lat] = coords
    return { lat, lng }
  }
  return null
})

const tags = computed(() => place.value?.tags?.map((tag) => tag.name) ?? [])

const priceLabel = computed(() => {
  const p = place.value
  if (!p) return 'N/A'
  if (p.pricePerNight !== undefined) return `$${p.pricePerNight.toLocaleString()}/night`
  if (p.ticketPrice !== undefined) return `$${p.ticketPrice.toLocaleString()}`
  if (p.priceRange) return p.priceRange
  return 'N/A'
})

const openHoursLabel = computed(() => {
  const hours = place.value?.openingHours
  if (!hours) return 'N/A'
  const entries = Object.entries(hours)
  if (!entries.length) return 'N/A'
  return entries.map(([day, val]) => `${day}: ${val}`).join(' • ')
})
</script>

<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <!-- Loading State -->
    <div v-if="loading" class="space-y-8">
      <Skeleton class="h-[400px] w-full rounded-3xl" />
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div class="space-y-4 lg:col-span-2">
          <Skeleton class="h-12 w-3/4" />
          <Skeleton class="h-6 w-1/2" />
          <Skeleton class="h-32 w-full" />
        </div>
        <div class="lg:col-span-1">
          <Skeleton class="h-64 w-full rounded-3xl" />
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex h-64 flex-col items-center justify-center text-center">
      <p class="text-lg font-semibold text-destructive">{{ error }}</p>
      <Button variant="outline" class="mt-4" @click="$router.go(0)">Try Again</Button>
    </div>

    <!-- Content -->
    <div v-else-if="place" class="space-y-8">
      <!-- Image Gallery -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-2 h-[400px] md:h-[500px]">
        <div class="relative col-span-1 md:col-span-4 md:row-span-2 overflow-hidden rounded-3xl">
          <img :src="heroImage || place.mainImageUrl" :alt="place.name" class="h-full w-full object-cover" />
          <Button variant="secondary" size="icon" class="absolute right-4 top-4 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white" aria-label="Save place">
            <BookmarkIcon class="size-5" />
          </Button>
        </div>
      </div>
      
      <!-- Additional Images Row -->
      <div v-if="galleryImages.length > 1" class="grid grid-cols-4 gap-4">
        <div v-for="(img, index) in galleryImages.slice(0, 4)" :key="index" class="aspect-[4/3] overflow-hidden rounded-2xl cursor-pointer hover:opacity-90 transition-opacity">
           <img :src="img" :alt="place.name" class="h-full w-full object-cover" />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-10">
          <!-- Header -->
          <div class="space-y-2">
            <h1 class="text-4xl font-bold tracking-tight text-foreground">{{ place.name }}</h1>
            <div class="flex items-center gap-4 text-muted-foreground">
              <div class="flex items-center gap-1 text-yellow-500">
                <StarIcon class="size-5 fill-current" />
                <span class="font-semibold text-foreground">{{ place.averageRating }}</span>
                <span class="text-muted-foreground">({{ place.reviewCount }} reviews)</span>
              </div>
              <div class="flex items-center gap-1">
                <MapPinIcon class="size-5" />
                <span>{{ locationLabel }}</span>
              </div>
            </div>
          </div>

          <!-- About -->
          <section class="space-y-4">
            <h2 class="text-2xl font-semibold">About this place</h2>
            <p class="leading-relaxed text-muted-foreground">{{ place.description }}</p>
          </section>

          <!-- Highlights -->
          <section class="space-y-4">
            <h2 class="text-2xl font-semibold">Highlight</h2>
            <div class="flex flex-wrap gap-3">
              <Badge v-for="tag in tags" :key="tag" variant="secondary" class="px-4 py-2 text-sm font-normal rounded-full bg-secondary/50 hover:bg-secondary/70">
                <span class="mr-2 text-primary">•</span> {{ tag }}
              </Badge>
              <p v-if="!tags.length" class="text-sm text-muted-foreground">No highlights listed</p>
            </div>
          </section>

          <!-- Location Map -->
          <section class="space-y-4">
            <h2 class="text-2xl font-semibold">Location map</h2>
            <div class="h-80 w-full rounded-3xl shadow-sm overflow-hidden">
              <GoogleMap 
                v-if="coordinates"
                :lat="coordinates.lat" 
                :lng="coordinates.lng" 
              />
              <div v-else class="flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground">Location not available</div>
            </div>
          </section>

          <!-- Reviews -->
          <section class="space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-semibold">Reviews</h2>
              <Button variant="default" class="bg-orange-500 hover:bg-orange-600 text-white rounded-full">Write a Review</Button>
            </div>
            <div class="rounded-2xl border border-dashed border-border/60 p-6 text-muted-foreground">
              <p class="font-medium text-foreground">No reviews yet</p>
              <p class="text-sm">Be the first to share your experience at {{ place.name }}.</p>
            </div>
          </section>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="sticky top-24 space-y-6">
            <Card class="overflow-hidden rounded-3xl border-none bg-secondary/30 shadow-none">
              <CardContent class="p-6 space-y-6">
                <div class="space-y-4">
                  <div class="flex items-start gap-3">
                    <div class="rounded-full bg-background p-2 shadow-sm">
                      <ClockIcon class="size-5 text-foreground" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-muted-foreground">Opening Hours</p>
                      <p class="font-semibold">{{ openHoursLabel }}</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-3">
                    <div class="rounded-full bg-background p-2 shadow-sm">
                      <TicketIcon class="size-5 text-foreground" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-muted-foreground">Price</p>
                      <p class="font-semibold">{{ priceLabel }}</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-3">
                    <div class="rounded-full bg-background p-2 shadow-sm">
                      <TagIcon class="size-5 text-foreground" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-muted-foreground">Place Type</p>
                      <p class="font-semibold">{{ place.placeType }}</p>
                    </div>
                  </div>
                </div>

                <Button class="w-full rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-12 text-lg shadow-lg shadow-orange-500/20">
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>